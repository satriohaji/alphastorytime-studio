import json
import os

def build_accurate_timestamps():
    fps = 30
    total_duration = 86.164
    total_frames = 2585

    def f(sec):
        return int(round(sec * fps))

    def ts(sec):
        hrs = int(sec // 3600)
        mins = int((sec % 3600) // 60)
        secs = int(sec % 60)
        millis = int(round((sec - int(sec)) * 1000))
        if millis >= 1000:
            millis = 999
        return f"{hrs:02d}:{mins:02d}:{secs:02d}.{millis:03d}"

    def make_seg(seg_id, start, end, text, raw_words):
        words = []
        for i, (w, w_start, w_end) in enumerate(raw_words, 1):
            words.append({
                "no": i,
                "word": w,
                "start": round(w_start, 3),
                "end": round(w_end, 3),
                "start_ts": ts(w_start),
                "end_ts": ts(w_end),
                "start_frame": f(w_start),
                "end_frame": f(w_end),
                "duration_ms": int(round((w_end - w_start) * 1000)),
                "probability": 0.99
            })
        return {
            "id": seg_id,
            "start": round(start, 3),
            "end": round(end, 3),
            "start_ts": ts(start),
            "end_ts": ts(end),
            "start_frame": f(start),
            "end_frame": f(end),
            "text": text,
            "words": words
        }

    segments = []

    # Segment 1
    segments.append(make_seg(
        1, 0.0, 5.08,
        "Eh, bayangin deh, kamu lagi mendaki di ketinggian lebih dari 2.800 meter.",
        [
            ("Eh,", 0.0, 0.18),
            ("bayangin", 0.40, 0.82),
            ("deh,", 0.82, 0.90),
            ("kamu", 1.40, 1.64),
            ("lagi", 1.64, 1.88),
            ("mendaki", 1.88, 2.32),
            ("di", 2.32, 2.46),
            ("ketinggian", 2.46, 2.88),
            ("lebih", 2.88, 3.22),
            ("dari", 3.22, 3.50),
            ("2.800", 3.50, 4.74),
            ("meter.", 4.74, 5.08),
        ]
    ))

    # Segment 2
    segments.append(make_seg(
        2, 5.78, 9.22,
        "Hutan sunyi parah, kabut tebal banget...",
        [
            ("Hutan", 5.78, 6.30),
            ("sunyi", 6.58, 6.96),
            ("parah,", 6.96, 7.24),
            ("kabut", 7.78, 8.30),
            ("tebal", 8.46, 8.86),
            ("banget...", 8.86, 9.22),
        ]
    ))

    # Segment 3
    segments.append(make_seg(
        3, 9.86, 14.46,
        "Tapi tiba-tiba, kuping kamu nangkep suara pasar tradisional yang rame banget.",
        [
            ("Tapi", 9.86, 10.04),
            ("tiba-tiba,", 10.40, 10.82),
            ("kuping", 11.24, 11.52),
            ("kamu", 11.52, 11.80),
            ("nangkep", 11.80, 12.15),
            ("suara", 12.15, 12.50),
            ("pasar", 12.50, 12.80),
            ("tradisional", 12.80, 13.44),
            ("yang", 13.44, 13.72),
            ("rame", 13.72, 14.24),
            ("banget.", 14.24, 14.46),
        ]
    ))

    # Segment 4
    segments.append(make_seg(
        4, 15.14, 17.08,
        "Ini kisah fiktifnya, dengerin baik-baik.",
        [
            ("Ini", 15.14, 15.32),
            ("kisah", 15.32, 15.60),
            ("fiktifnya,", 15.60, 15.88),
            ("dengerin", 16.40, 16.78),
            ("baik-baik.", 16.78, 17.08),
        ]
    ))

    # Segment 5
    segments.append(make_seg(
        5, 17.68, 21.32,
        "Malam itu, Raka mendaki Gunung Lawu lewat jalur Candi Cetho.",
        [
            ("Malam", 17.68, 18.08),
            ("itu,", 18.08, 18.30),
            ("Raka", 18.84, 19.14),
            ("mendaki", 19.14, 19.58),
            ("Gunung", 19.58, 19.82),
            ("Lawu", 19.82, 20.04),
            ("lewat", 20.04, 20.36),
            ("jalur", 20.36, 20.66),
            ("Candi", 20.66, 21.08),
            ("Cetho.", 21.08, 21.32),
        ]
    ))

    # Segment 6
    segments.append(make_seg(
        6, 21.90, 25.74,
        "Pas menjelang gelap, kabut pekat mendadak turun nutupin sabana Pos Lima,",
        [
            ("Pas", 21.90, 22.14),
            ("menjelang", 22.14, 22.50),
            ("gelap,", 22.50, 22.72),
            ("kabut", 23.30, 23.52),
            ("pekat", 23.52, 23.82),
            ("mendadak", 23.82, 24.20),
            ("turun", 24.20, 24.66),
            ("nutupin", 24.66, 25.08),
            ("sabana", 25.08, 25.30),
            ("Pos", 25.30, 25.54),
            ("Lima,", 25.54, 25.74),
        ]
    ))

    # Segment 7
    segments.append(make_seg(
        7, 26.34, 29.22,
        "tempat yang sering disebut pendaki sebagai Pasar Setan.",
        [
            ("tempat", 26.34, 26.74),
            ("yang", 26.74, 27.14),
            ("sering", 27.14, 27.52),
            ("disebut", 27.52, 27.78),
            ("pendaki", 27.78, 28.14),
            ("sebagai", 28.14, 28.58),
            ("Pasar", 28.58, 28.98),
            ("Setan.", 28.98, 29.22),
        ]
    ))

    # Segment 8
    segments.append(make_seg(
        8, 30.07, 34.95,
        "Raka yang langkahnya ketinggalan jauh, pelan-pelan kehilangan jejak cahaya senter dua temannya di depan.",
        [
            ("Raka", 30.07, 30.45),
            ("yang", 30.45, 30.59),
            ("langkahnya", 30.59, 30.79),
            ("ketinggalan", 30.79, 31.07),
            ("jauh,", 31.07, 31.43),
            ("pelan-pelan", 31.93, 32.39),
            ("kehilangan", 32.39, 32.99),
            ("jejak", 32.99, 33.33),
            ("cahaya", 33.33, 33.69),
            ("senter", 33.69, 34.01),
            ("dua", 34.01, 34.29),
            ("temannya", 34.29, 34.61),
            ("di", 34.61, 34.71),
            ("depan.", 34.71, 34.95),
        ]
    ))

    # Segment 9
    segments.append(make_seg(
        9, 35.21, 37.49,
        "Senter di tangannya mulai meredup.",
        [
            ("Senter", 35.21, 35.87),
            ("di tangannya", 35.87, 36.63),
            ("mulai", 36.63, 36.95),
            ("meredup.", 36.95, 37.49),
        ]
    ))

    # Segment 10
    segments.append(make_seg(
        10, 38.35, 45.16,
        "Jalur setapak tiba-tiba ngilang, ganti jadi ilalang tinggi dan batu-batu besar yang asing banget.",
        [
            ("Jalur", 38.35, 38.87),
            ("setapak", 38.87, 39.39),
            ("tiba-tiba", 39.39, 40.30),
            ("ngilang,", 40.30, 41.28),
            ("ganti", 41.28, 41.62),
            ("jadi", 41.62, 41.88),
            ("ilalang", 41.88, 42.60),
            ("tinggi", 42.60, 42.94),
            ("dan", 42.94, 43.12),
            ("batu-batu", 43.12, 43.66),
            ("besar", 43.66, 44.08),
            ("yang", 44.08, 44.32),
            ("asing", 44.32, 44.90),
            ("banget.", 44.90, 45.16),
        ]
    ))

    # Segment 11
    segments.append(make_seg(
        11, 46.38, 53.72,
        "Anehnya, angin gunung yang tadinya kenceng mendadak berhenti total. Dari balik kabut putih itu,",
        [
            ("Anehnya,", 46.38, 46.76),
            ("angin", 47.24, 47.90),
            ("gunung", 47.90, 48.34),
            ("yang", 48.34, 48.44),
            ("tadinya", 48.44, 48.66),
            ("kenceng", 48.66, 49.63),
            ("mendadak", 49.63, 50.09),
            ("berhenti", 50.09, 50.43),
            ("total.", 50.43, 51.50),
            ("Dari", 52.18, 52.48),
            ("balik", 52.48, 52.78),
            ("kabut", 52.78, 53.12),
            ("putih", 53.12, 53.42),
            ("itu,", 53.42, 53.72),
        ]
    ))

    # Segment 12
    segments.append(make_seg(
        12, 53.90, 60.61,
        "mulai kedengeran derap langkah kaki... suara orang tawar-menawar... sama sayup alunan gamelan.",
        [
            ("mulai", 53.90, 54.30),
            ("kedengeran", 54.30, 54.71),
            ("derap", 54.71, 55.17),
            ("langkah", 55.17, 55.47),
            ("kaki...", 55.47, 56.27),
            ("suara", 56.27, 56.87),
            ("orang", 56.87, 57.11),
            ("tawar-menawar...", 57.11, 58.15),
            ("sama", 58.49, 58.81),
            ("sayup", 58.81, 59.45),
            ("alunan", 59.45, 59.99),
            ("gamelan.", 59.99, 60.61),
        ]
    ))

    # Segment 13
    segments.append(make_seg(
        13, 61.52, 69.24,
        "Raka langsung membeku dong. Jantungnya deg-degan parah soalnya dia yakin nggak ada warung atau manusia lain di sabana ini.",
        [
            ("Raka", 61.52, 62.12),
            ("langsung", 62.12, 62.42),
            ("membeku", 62.42, 62.80),
            ("dong.", 62.80, 63.20),
            ("Jantungnya", 63.20, 63.90),
            ("deg-degan", 63.90, 64.60),
            ("parah", 64.60, 65.20),
            ("soalnya", 65.20, 65.70),
            ("dia", 65.70, 66.10),
            ("yakin", 66.10, 66.78),
            ("nggak", 66.78, 66.90),
            ("ada", 66.90, 67.08),
            ("warung", 67.08, 67.62),
            ("atau", 67.62, 67.78),
            ("manusia", 67.78, 68.26),
            ("lain", 68.26, 68.52),
            ("di", 68.52, 68.66),
            ("sabana", 68.66, 68.90),
            ("ini.", 68.90, 69.24),
        ]
    ))

    # Segment 14 (Split into 3 clean, crisp beats!)
    segments.append(make_seg(
        14, 70.12, 77.25,
        "Tiba-tiba, napas dingin nyentuh tengkuknya, dan satu suara berbisik persis di belakang telinganya...",
        [
            ("Tiba-tiba,", 70.12, 70.76),
            ("napas", 71.00, 71.50),
            ("dingin", 71.50, 72.00),
            ("nyentuh", 72.00, 72.60),
            ("tengkuknya,", 72.60, 73.40),
            ("dan", 73.40, 73.80),
            ("satu", 73.80, 74.36),
            ("suara", 74.48, 74.82),
            ("berbisik", 74.82, 75.46),
            ("persis", 75.46, 76.19),
            ("di", 76.19, 76.33),
            ("belakang", 76.33, 76.65),
            ("telinganya...", 76.65, 77.25),
        ]
    ))

    segments.append(make_seg(
        15, 77.25, 81.20,
        "\"Mas... mau beli apa?\"",
        [
            ("\"Mas...", 77.25, 78.50),
            ("mau", 78.50, 79.50),
            ("beli", 79.90, 80.34),
            ("apa?\"", 80.34, 81.20),
        ]
    ))

    segments.append(make_seg(
        16, 81.50, 86.164,
        "Siapa yang nyapa Raka di tengah kabut itu? Lanjut Part dua!",
        [
            ("Siapa", 81.50, 82.37),
            ("yang", 82.37, 82.60),
            ("nyapa", 82.60, 83.07),
            ("Raka", 83.07, 83.55),
            ("di tengah", 83.55, 84.10),
            ("kabut", 84.10, 84.45),
            ("itu?", 84.45, 84.80),
            ("Lanjut", 84.90, 85.40),
            ("Part dua!", 85.40, 86.164),
        ]
    ))

    result = {
        "audio_file": "vo_alpha.mp3",
        "total_duration_sec": total_duration,
        "total_frames_30fps": total_frames,
        "fps": fps,
        "segments": segments
    }

    out_path = "tools/part1_word_timestamps_corrected.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"[SUCCESS] Generated accurate timestamps: {out_path} ({len(segments)} segments)")

if __name__ == "__main__":
    build_accurate_timestamps()
