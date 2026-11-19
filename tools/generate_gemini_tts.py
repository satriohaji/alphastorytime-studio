"""
Central Gemini 3.8 Flash TTS Generator for AlphaStorytime.

Features:
- Uses locked character voice IDs from tools/gemini_voices.json (alpha -> voice_w6twpenhmuqf).
- Automatically merges consecutive turns by the same speaker to save API quota.
- Loads GEMINI_API_KEY from environment, repo .env file, or Windows user registry.
- Handles 429/5xx retries cleanly with configurable pacing (--delay).
- Trims dead silence, normalizes loudness (loudnorm), stitches master MP3,
  emits speaker_turns.json, and validates 45s-120s part duration.
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import time
import wave
from pathlib import Path

from google import genai
from google.genai import errors

TOOLS_DIR = Path(__file__).resolve().parent
REPO_ROOT = TOOLS_DIR.parent
CONFIG_PATH = TOOLS_DIR / "gemini_voices.json"
SAMPLE_RATE = 24000
CHANNELS = 1
SAMPLE_WIDTH = 2  # 16-bit PCM

MIN_PART_SEC = 45.0
MAX_PART_SEC = 120.0


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_dotenv_file(env_path: Path):
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


def resolve_api_key():
    load_dotenv_file(REPO_ROOT / ".env")
    key = os.environ.get("GEMINI_API_KEY")
    if not key and sys.platform == "win32":
        import winreg

        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as reg_key:
                key, _ = winreg.QueryValueEx(reg_key, "GEMINI_API_KEY")
                os.environ["GEMINI_API_KEY"] = key
        except OSError:
            pass
    if not key:
        print(
            "[ERROR] GEMINI_API_KEY is not set. Set it via environment variable or .env in repo root.",
            file=sys.stderr,
        )
        sys.exit(1)
    return key


def merge_consecutive_turns(turns):
    """Combine back-to-back turns from the same speaker to minimize API requests."""
    if not turns:
        return []
    merged = []
    for item in turns:
        spk = item["speaker"].lower()
        speakers = item.get("speakers", [spk])
        can_merge = (
            merged
            and not item.get("no_merge", False)
            and merged[-1]["speaker"].lower() == spk
            and merged[-1].get("speakers", [spk]) == speakers
            and item.get("voice_id") == merged[-1].get("voice_id")
            and len(merged[-1]["text"]) + len(item["text"]) < 900
        )
        if can_merge:
            merged[-1]["text"] = f"{merged[-1]['text'].rstrip()} <short pause> {item['text'].lstrip()}"
            if "gap_ms" in item:
                merged[-1]["gap_ms"] = item["gap_ms"]
        else:
            merged.append(dict(item))
    return merged


def extract_retry_delay(err, default_sec):
    msg = str(err)
    m = re.search(r"retry\s*(?:in|after)?\s*(\d+(?:\.\d+)?)\s*s", msg, re.IGNORECASE)
    if m:
        return max(default_sec, float(m.group(1)) + 1.0)
    return default_sec


def synthesize_turn(client, model, fallback_model, voice_id, text, style, out_wav, max_retries=4):
    annotations = [{"type": "speech_metadata"}]
    if style:
        annotations[0]["style"] = style

    active_model = model
    for attempt in range(1, max_retries + 1):
        try:
            interaction = client.interactions.create(
                model=active_model,
                input=[
                    {
                        "type": "user_input",
                        "content": [
                            {
                                "type": "text",
                                "text": text,
                                "annotations": annotations,
                            }
                        ],
                    }
                ],
                response_format={"type": "audio"},
                generation_config={"speech_config": [{"voice": voice_id}]},
            )
            if not interaction.output_audio or not interaction.output_audio.data:
                raise RuntimeError("Empty audio response from Gemini API.")
            out_wav.write_bytes(base64.b64decode(interaction.output_audio.data))
            return active_model
        except errors.APIError as err:
            status = getattr(err, "status_code", None)
            if status in (429, 500, 502, 503, 504):
                if status == 429 and fallback_model and active_model != fallback_model:
                    print(f"  [Quota 429 on {active_model}] Switching to fallback model: {fallback_model}")
                    active_model = fallback_model
                    continue
                if attempt < max_retries:
                    wait_sec = extract_retry_delay(err, min(65.0, 20.0 * attempt))
                    print(f"  [Retry {attempt}/{max_retries}] Status {status} on {active_model}, waiting {wait_sec:.0f}s...")
                    time.sleep(wait_sec)
                    continue
            raise


def trim_and_normalize_wav(src_wav, dst_wav):
    """Trim dead leading/trailing silence (< -48dB) and level loudness via FFmpeg."""
    af = (
        "silenceremove=start_periods=1:start_silence=0.04:start_threshold=-48dB,"
        "areverse,"
        "silenceremove=start_periods=1:start_silence=0.06:start_threshold=-48dB,"
        "areverse,"
        "loudnorm=I=-16:TP=-1.5:LRA=11"
    )
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(src_wav),
            "-af", af,
            "-ar", str(SAMPLE_RATE), "-ac", str(CHANNELS), "-sample_fmt", "s16",
            str(dst_wav),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def stitch_turns(turn_entries, out_mp3, out_wav):
    """Concatenate PCM frames with exact ms silences so speaker_turns.json matches 1:1."""
    pcm_chunks = []
    timeline = []
    cursor_sec = 0.0
    fps = 30

    for entry in turn_entries:
        with wave.open(str(entry["clean_wav"]), "rb") as w:
            frames = w.readframes(w.getnframes())
            dur = w.getnframes() / float(w.getframerate())

        start_sec = round(cursor_sec, 4)
        end_sec = round(cursor_sec + dur, 4)
        pcm_chunks.append(frames)
        timeline.append(
            {
                "turn": entry["turn"],
                "speaker": entry["speaker"],
                "speakers": entry["speakers"],
                "start": start_sec,
                "end": end_sec,
                "start_frame": int(round(start_sec * fps)),
                "end_frame": int(round(end_sec * fps)),
                "text": entry["text"],
            }
        )
        cursor_sec += dur

        gap_ms = entry["gap_ms"]
        if gap_ms > 0:
            gap_samples = int(round(SAMPLE_RATE * (gap_ms / 1000.0)))
            pcm_chunks.append(b"\x00" * (gap_samples * SAMPLE_WIDTH * CHANNELS))
            cursor_sec += gap_samples / float(SAMPLE_RATE)

    with wave.open(str(out_wav), "wb") as out_w:
        out_w.setnchannels(CHANNELS)
        out_w.setsampwidth(SAMPLE_WIDTH)
        out_w.setframerate(SAMPLE_RATE)
        out_w.writeframes(b"".join(pcm_chunks))

    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(out_wav),
            "-c:a", "libmp3lame", "-b:a", "192k",
            str(out_mp3),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return timeline, cursor_sec


def main():
    parser = argparse.ArgumentParser(description="Generate AlphaStorytime VO via Gemini 3.8 TTS.")
    parser.add_argument("script_json", help="Path to JSON list of dialogue/narration turns.")
    parser.add_argument("output_mp3", help="Destination master MP3 file path.")
    parser.add_argument("--model", help="Override TTS model (e.g. gemini-3.8-flash-lite-tts).")
    parser.add_argument(
        "--fallback-model",
        default="gemini-3.8-flash-lite-tts",
        help="Model to fall back to on 429 quota error (use '' to disable).",
    )
    parser.add_argument("--turns-dir", help="Directory to cache per-turn WAV files (default: <out_dir>/turns).")
    parser.add_argument("--no-merge", action="store_true", help="Do not merge consecutive turns by the same speaker.")
    parser.add_argument("--force", action="store_true", help="Regenerate even if cached turn WAV exists.")
    parser.add_argument("--only-turn", type=int, help="Regenerate only a specific 1-based turn index.")
    parser.add_argument("--delay", type=float, default=3.0, help="Seconds to pause between API calls.")
    args = parser.parse_args()

    resolve_api_key()
    cfg = load_config()
    model = args.model or cfg["model"]
    fallback_model = args.fallback_model or None
    if fallback_model == model:
        fallback_model = None
    voices_cfg = cfg["voices"]
    default_gap = cfg.get("default_gap_ms", 240)

    script_path = Path(args.script_json)
    out_mp3 = Path(args.output_mp3)
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    turns_dir = Path(args.turns_dir) if args.turns_dir else (out_mp3.parent / "turns")
    turns_dir.mkdir(parents=True, exist_ok=True)

    with open(script_path, "r", encoding="utf-8") as f:
        raw_turns = json.load(f)

    turns = raw_turns if args.no_merge else merge_consecutive_turns(raw_turns)
    if len(turns) < len(raw_turns):
        print(f"Merged consecutive same-speaker lines: {len(raw_turns)} -> {len(turns)} API turns")

    client = genai.Client(
        http_options={
            "api_version": cfg.get("api_version", "v1beta"),
            "timeout": 60000,
        }
    )

    processed = []
    for idx, item in enumerate(turns, start=1):
        speaker = item.get("speaker", "alpha").lower()
        if speaker not in voices_cfg:
            raise ValueError(f"Unknown speaker '{speaker}' on turn {idx}. Expected one of {list(voices_cfg)}")

        vinfo = voices_cfg[speaker]
        voice_id = item.get("voice_id") or vinfo["voice_id"]
        style = item.get("style", vinfo["default_style"])
        text = item["text"]
        gap_ms = int(item.get("gap_ms", 0 if idx == len(turns) else default_gap))
        speakers_list = item.get("speakers", [speaker])

        raw_wav = turns_dir / f"turn_{idx:03d}_{speaker}_raw.wav"
        clean_wav = turns_dir / f"turn_{idx:03d}_{speaker}.wav"

        should_gen = args.force or (args.only_turn == idx) or (not raw_wav.exists())
        if should_gen and (args.only_turn is None or args.only_turn == idx):
            print(f"[{idx}/{len(turns)}] Generating {speaker} ({voice_id}, model={model})...")
            model = synthesize_turn(client, model, fallback_model, voice_id, text, style, raw_wav)
            if args.delay > 0 and idx < len(turns):
                time.sleep(args.delay)
        else:
            print(f"[{idx}/{len(turns)}] Using cached {raw_wav.name}")

        if not clean_wav.exists() or should_gen:
            trim_and_normalize_wav(raw_wav, clean_wav)

        processed.append(
            {
                "turn": idx,
                "speaker": speaker,
                "speakers": speakers_list,
                "text": text,
                "gap_ms": gap_ms,
                "clean_wav": clean_wav,
            }
        )

    master_wav = turns_dir / "_master_stitched.wav"
    timeline, total_sec = stitch_turns(processed, out_mp3, master_wav)
    total_frames = int(round(total_sec * 30))

    timeline_path = out_mp3.parent / "speaker_turns.json"
    timeline_payload = {
        "master_audio": out_mp3.name,
        "total_duration_sec": round(total_sec, 4),
        "total_frames_30fps": total_frames,
        "fps": 30,
        "within_part_bounds": MIN_PART_SEC <= total_sec <= MAX_PART_SEC,
        "turns": timeline,
    }
    timeline_path.write_text(json.dumps(timeline_payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\n[SUCCESS] Master VO MP3: {out_mp3} ({total_sec:.2f}s / {total_frames} frames @ 30 FPS)")
    print(f"[SUCCESS] Speaker Turns Map: {timeline_path}")

    if total_sec < MIN_PART_SEC or total_sec > MAX_PART_SEC:
        print(
            f"[DURATION WARNING] Duration {total_sec:.2f}s is outside target part bounds "
            f"({MIN_PART_SEC:.0f}s - {MAX_PART_SEC:.0f}s). Adjust script/part split before Tahap 4!",
            file=sys.stderr,
        )
    else:
        print(f"[DURATION CHECK] PASS ({MIN_PART_SEC:.0f}s <= {total_sec:.2f}s <= {MAX_PART_SEC:.0f}s)")


if __name__ == "__main__":
    main()
