import argparse
import json
import os
from faster_whisper import WhisperModel


def sec_to_ts(sec: float) -> str:
    hrs = int(sec // 3600)
    mins = int((sec % 3600) // 60)
    secs = int(sec % 60)
    millis = int(round((sec - int(sec)) * 1000))
    if millis >= 1000:
        millis = 999
    return f"{hrs:02d}:{mins:02d}:{secs:02d}.{millis:03d}"


def extract_timestamps(audio_path: str, output_json_path: str, output_md_path: str = None, model_size: str = "base"):
    print(f"Loading faster-whisper model ({model_size})...")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    print(f"Transcribing & extracting word-level timestamps from: {audio_path}")
    segments, info = model.transcribe(
        audio_path,
        language="id",
        word_timestamps=True,
        beam_size=5,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=250),
    )

    total_duration = info.duration
    fps = 30
    total_frames = int(round(total_duration * fps))

    segments_data = []
    seg_id = 1

    for segment in segments:
        words_data = []
        word_no = 1
        if segment.words:
            for w in segment.words:
                w_start = round(w.start, 3)
                w_end = round(w.end, 3)
                words_data.append(
                    {
                        "no": word_no,
                        "word": w.word.strip(),
                        "start": w_start,
                        "end": w_end,
                        "start_ts": sec_to_ts(w_start),
                        "end_ts": sec_to_ts(w_end),
                        "start_frame": int(round(w_start * fps)),
                        "end_frame": int(round(w_end * fps)),
                        "duration_ms": int(round((w_end - w_start) * 1000)),
                        "probability": round(w.probability, 3),
                    }
                )
                word_no += 1

        s_start = round(segment.start, 3)
        s_end = round(segment.end, 3)
        segments_data.append(
            {
                "id": seg_id,
                "start": s_start,
                "end": s_end,
                "start_ts": sec_to_ts(s_start),
                "end_ts": sec_to_ts(s_end),
                "start_frame": int(round(s_start * fps)),
                "end_frame": int(round(s_end * fps)),
                "text": segment.text.strip(),
                "words": words_data,
            }
        )
        print(f"[{sec_to_ts(s_start)} -> {sec_to_ts(s_end)}] {segment.text.strip()}")
        seg_id += 1

    result = {
        "audio_file": os.path.basename(audio_path),
        "total_duration_sec": total_duration,
        "total_frames_30fps": total_frames,
        "fps": fps,
        "segments": segments_data,
    }

    os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\n[SUCCESS] Saved word timestamps JSON: {output_json_path}")

    if output_md_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_md_path)), exist_ok=True)
        with open(output_md_path, "w", encoding="utf-8") as f:
            f.write("# Word-Level Audio Timestamps\n")
            f.write(f"- Audio: `{os.path.basename(audio_path)}`\n")
            f.write(f"- Total Duration: `{total_duration:.2f}s` ({total_frames} frames @ 30 FPS)\n\n")
            f.write("| No | Range Timestamp | Range Frame | Segment Text |\n")
            f.write("|---|---|---|---|\n")
            for s in segments_data:
                f.write(f"| {s['id']} | `{s['start_ts']}` - `{s['end_ts']}` | `{s['start_frame']}` - `{s['end_frame']}` | {s['text']} |\n")
        print(f"[SUCCESS] Saved summary Markdown: {output_md_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract word-level timestamps using faster-whisper.")
    parser.add_argument("audio_path", help="Input MP3/WAV audio path.")
    parser.add_argument("output_json", help="Output JSON path.")
    parser.add_argument("output_md", nargs="?", default=None, help="Optional Markdown summary path.")
    parser.add_argument("--model-size", default="base", help="Whisper model size (tiny, base, small, medium).")
    args = parser.parse_args()
    extract_timestamps(args.audio_path, args.output_json, args.output_md, args.model_size)
