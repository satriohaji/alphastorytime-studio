import json
import os
import sys
from pathlib import Path

import av
import numpy as np

TOOLS_DIR = Path(__file__).resolve().parent
VOICES_CONFIG_PATH = TOOLS_DIR / "gemini_voices.json"


def load_default_speakers(turns_data):
    speakers = []
    if turns_data:
        for t in turns_data:
            for spk in t.get("speakers", [t.get("speaker", "alpha")]):
                spk_low = spk.lower()
                if spk_low not in speakers:
                    speakers.append(spk_low)
    if not speakers and VOICES_CONFIG_PATH.exists():
        cfg = json.loads(VOICES_CONFIG_PATH.read_text(encoding="utf-8"))
        speakers = [k.lower() for k in cfg.get("voices", {}).keys()]
    return speakers or ["alpha"]


def resolve_speakers_from_turns(start_s, end_s, turns, fallback_speaker):
    """Map a Whisper segment or word interval to speaker(s) via turn time ranges."""
    if not turns:
        return [fallback_speaker]
    mid = (start_s + end_s) / 2.0
    for t in turns:
        if t["start"] <= mid <= t["end"]:
            return [s.lower() for s in t.get("speakers", [t["speaker"]])]
    nearest = min(turns, key=lambda t: min(abs(mid - t["start"]), abs(mid - t["end"])))
    return [s.lower() for s in nearest.get("speakers", [nearest["speaker"]])]


def generate_lipsync(audio_path, timestamps_json_path, output_ts_path, speaker_turns_path=None):
    print(f"Reading audio from: {audio_path}")
    container = av.open(audio_path)
    resampler = av.AudioResampler(format="s16", layout="mono", rate=16000)

    samples = []
    for frame in container.decode(audio=0):
        for rf in resampler.resample(frame):
            samples.append(rf.to_ndarray())

    audio_data = np.concatenate(samples, axis=1).squeeze().astype(np.float32) / 32768.0
    sr = 16000
    duration_sec = len(audio_data) / sr
    fps = 30
    total_frames = int(round(duration_sec * fps))
    print(f"Total audio duration: {duration_sec:.2f}s -> {total_frames} frames @ 30 FPS")

    with open(timestamps_json_path, "r", encoding="utf-8") as f:
        ts_data = json.load(f)

    turns_data = None
    if speaker_turns_path and os.path.exists(speaker_turns_path):
        with open(speaker_turns_path, "r", encoding="utf-8") as f:
            turns_data = json.load(f).get("turns", [])
        print(f"Loaded {len(turns_data)} speaker turns from: {speaker_turns_path}")

    speakers_list = load_default_speakers(turns_data)
    primary_speaker = speakers_list[0]
    active_words = {spk: [] for spk in speakers_list}

    for seg in ts_data.get("segments", []):
        seg_speakers = resolve_speakers_from_turns(seg["start"], seg["end"], turns_data, primary_speaker)
        words = seg.get("words") or []
        if words:
            for w in words:
                w_start = w["start"]
                w_end = w["end"]
                speakers = resolve_speakers_from_turns(w_start, w_end, turns_data, primary_speaker)
                sf = int(round(w_start * fps))
                ef = int(round(w_end * fps))
                for spk in speakers:
                    active_words.setdefault(spk, []).append((sf, ef))
        else:
            sf = int(round(seg["start"] * fps))
            ef = int(round(seg["end"] * fps))
            for spk in seg_speakers:
                active_words.setdefault(spk, []).append((sf, ef))

    # Calculate RMS per 30 FPS frame window
    samples_per_frame = sr / fps
    raw_envelope = []
    for f in range(total_frames):
        start_idx = int(f * samples_per_frame)
        end_idx = int((f + 1) * samples_per_frame)
        window = audio_data[start_idx:end_idx]
        rms = float(np.sqrt(np.mean(window ** 2))) if len(window) > 0 else 0.0
        raw_envelope.append(rms)

    raw_arr = np.array(raw_envelope)
    voiced = raw_arr[raw_arr > 0.01]
    max_val = float(np.percentile(voiced, 95)) if np.any(raw_arr > 0.01) else 1.0
    norm_envelope = np.clip(raw_arr / max_val, 0.0, 1.0)

    # Attack-release vocal smoothing
    smoothed = []
    curr = 0.0
    attack = 0.70
    release = 0.35
    for val in norm_envelope:
        if val > curr:
            curr = curr + attack * (float(val) - curr)
        else:
            curr = curr - release * (curr - float(val))
        smoothed.append(curr)

    def is_frame_active(frame_idx, intervals):
        for sf, ef in intervals:
            if sf <= frame_idx <= ef:
                return True
        return False

    mouth_by_speaker = {spk: [] for spk in active_words}
    for f in range(total_frames):
        val = smoothed[f]
        energy = val if val >= 0.05 else 0.0
        for spk, intervals in active_words.items():
            if is_frame_active(f, intervals):
                mouth_by_speaker[spk].append(float(round(min(1.0, energy * 1.12), 2)))
            else:
                mouth_by_speaker[spk].append(0.0)

    print(f"Generated mouth values for {total_frames} frames:")
    for spk, vals in mouth_by_speaker.items():
        print(f"  {spk}: {sum(1 for x in vals if x > 0)} active frames")

    os.makedirs(os.path.dirname(os.path.abspath(output_ts_path)), exist_ok=True)
    speaker_union = " | ".join(f"'{s}'" for s in mouth_by_speaker.keys())

    with open(output_ts_path, "w", encoding="utf-8") as f:
        f.write("// ============================================================\n")
        f.write("//  ACOUSTIC AUDIO-DRIVEN LIP SYNC DATA (@ 30 FPS)\n")
        f.write("//  Extracted from master voiceover & Whisper word alignment\n")
        f.write("//  Generated by tools/generate_lipsync.py\n")
        f.write("// ============================================================\n\n")
        f.write(f"export const TOTAL_LIPSYNC_FRAMES = {total_frames};\n\n")
        f.write(f"export type LipSyncSpeaker = {speaker_union};\n\n")
        f.write(f"export const MOUTH_OPEN_BY_SPEAKER: Record<string, number[]> = {json.dumps(mouth_by_speaker)};\n\n")
        if "alpha" in mouth_by_speaker:
            f.write("export const ALPHA_MOUTH: number[] = MOUTH_OPEN_BY_SPEAKER['alpha'];\n\n")
        f.write("export function getMouthOpenness(speaker: string, globalFrame: number): number {\n")
        f.write("  const frame = Math.max(0, Math.min(TOTAL_LIPSYNC_FRAMES - 1, Math.floor(globalFrame)));\n")
        f.write("  const track = MOUTH_OPEN_BY_SPEAKER[speaker.toLowerCase()];\n")
        f.write("  return track ? (track[frame] ?? 0) : 0;\n")
        f.write("}\n")

    print(f"[SUCCESS] Saved lipSyncData.ts: {output_ts_path}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python tools/generate_lipsync.py <audio_path> <timestamps_json> <output_ts> [speaker_turns_json]")
        sys.exit(1)
    turns_arg = sys.argv[4] if len(sys.argv) > 4 else None
    generate_lipsync(sys.argv[1], sys.argv[2], sys.argv[3], turns_arg)
