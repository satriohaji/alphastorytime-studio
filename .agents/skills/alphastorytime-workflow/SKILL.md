---
name: alphastorytime-workflow
description: >-
  SOP lengkap produksi video storytelling vertikal 9:16 untuk karakter Alpha (alphastorytimee)
  dalam berbagai genre (horor, kisah nyata, misteri, hiburan). Mencakup riset cerita, interview
  klarifikasi (grill-me), penulisan naskah utuh lalu pemecahan multi-part 45-120 detik per part,
  peta sound effect (SFX), TTS Gemini dengan voice_id konsisten (voice_w6twpenhmuqf), ekstraksi
  timestamp milidetik, lip-sync akustik, 2-layer staging ruangan Alpha + efek cerita di Remotion,
  QA audit, preview still ACC gate, dan protokol HERMES_HANDOFF.
---

# Workflow Produksi Video AlphaStorytime (`alpha`)

SOP ini mengatur alur kerja bertahap pembuatan video storytelling oleh **Alpha** (narrator di dalam ruangan dengan efek visual & transisi cerita) menggunakan engine terpusat Remotion + Python audio pipeline.

**Prinsip Utama:** Setiap tahap memiliki gerbang persetujuan (**ACC Gate**). DILARANG melompat ke tahap berikutnya sebelum user memberikan ACC.

---

## Alur 5 Tahap & Gerbang ACC

```text
[Tahap 1: Riset & Outline Utuh] ──(ACC Gate 1)──>
[Tahap 2: Script Utuh + Split Part (45-120s) + SFX & Moodboard] ──(ACC Gate 2)──>
[Tahap 3: Generate VO Alpha + Cek Durasi + Lip-Sync] ──(ACC Gate 3)──>
[Tahap 4: Coding Remotion + QA Audit + Preview PNG] ──(ACC Gate 4)──>
[Tahap 5: Full Video Render per Part + Kirim Hasil]
```

---

## TAHAP 1: Riset Cerita & Outline Utuh (*Grill-Me Gate*)

1. **Tentukan Genre & Kedalaman Riset:**
   - **Kisah Nyata / Sejarah / Kasus Viral:** Kumpulkan kronologi faktual, tahun kejadian, lokasi, dan cantumkan daftar referensi terkurasi (hindari halusinasi fakta).
   - **Horor / Urban Legend / Creepy Story:** Kumpulkan variasi cerita yang paling kuat atmosfernya dan susun titik-titik jumpscare/tensi.
   - **Kisah Hiburan / Plot Twist / Edukasi Populer:** Susun hook rasa penasaran, eskalasi konflik, dan punchline/twist yang memuaskan.
2. **Aturan "Grill Me" (Zero Assumption):**
   - Tanyakan preferensi user sebelum menulis script penuh:
     - Angle cerita & tingkat keseraman/emosi yang diinginkan?
     - Target estimasi total part (1 video utuh atau berseri Part 1, 2, ...)?
     - Ada detail wajib yang harus masuk atau dihindari?
3. **Output Tahap 1:** Simpan di `projects/<YYYYMMDD-slug>/STORY_MASTER.md` berisi ringkasan riset, referensi, dan outline utuh.
4. **ACC Gate 1:** Minta ACC outline (sertakan blok `---HERMES_HANDOFF---`).

---

## TAHAP 2: Naskah Utuh → Smart Part Splitter (45–120 Detik) + Peta SFX & Moodboard

### A. Tulis Naskah Utuh Terlebih Dahulu
- Tulis narasi utuh dari intro sampai tamat dengan gaya bertutur Alpha: akrab, mengalir, ekspresif, langsung mengajak penonton masuk ke suasana ruangan (*"Halo kawan-kawan, balik lagi sama Alpha..."* atau hook langsung yang kuat).
- Gunakan bahasa lisan natural Indonesia (kalimat pendek-sedang, jeda dramatis yang jelas).

### B. Aturan Pemecahan Part (`45s <= durasi <= 120s`)
- Laju bicara narasi Alpha rata-rata **135–145 kata/menit** (~2,3 kata/detik):
  - **Minimum keras 45 detik:** minimal **~105 kata** per part (ideal **120+ kata** agar aman).
  - **Maksimum keras 120 detik (2 menit):** maksimal **~275 kata** per part (target aman **240–255 kata** untuk memberi ruang jeda dramatis dan SFX).
- **Aturan Pemotongan Part:**
  1. Jika total naskah ≤ 255 kata, jadikan **1 video utuh** (`part-1`).
  2. Jika total naskah > 255 kata, pecah menjadi `part-1`, `part-2`, dst. **hanya di batas adegan atau titik cliffhanger alami**.
  3. **Part non-terakhir** wajib ditutup cliffhanger singkat yang bikin penasaran (*"Tapi pas pintu itu dibuka... lanjut Part 2!"*).
  4. **Part lanjutan (`part-2` dst.)** wajib dibuka hook recap 1 kalimat singkat sebelum menyambung cerita.

### C. Desain Audio (`tts_script.json` + SFX + BGM)
- Bagi naskah tiap part menjadi turn-turn emosi di `<part-dir>/script/tts_script.json` dengan speaker `"alpha"`.
- Jangan ubah `voice_id` (tetap `voice_w6twpenhmuqf` dari `tools/gemini_voices.json`). Variasikan emosi lewat field `"style"` berbahasa Inggris:
  - *Opening akrab:* `"warm, engaging, charismatic Indonesian storyteller"`
  - *Tegang / Horor:* `"low, eerie, suspenseful Indonesian horror narrator"`
  - *Berbisik / Mencekam:* `"hushed, tense, chilling whisper storytelling"`
  - *Terkejut / Klimaks:* `"shocked, dramatic, urgent storytelling"`
  - *Kisah Nyata Menyentuh:* `"empathetic, reflective, heartfelt Indonesian narrator"`
  - *Hiburan / Plot Twist:* `"playful, expressive, witty Indonesian storyteller"`
- Boleh sisipkan markup emosi Gemini TTS seperlunya seperti `<short pause>` atau `<gasp>`.
- **Peta SFX & BGM:** Cantumkan daftar SFX relevan di setiap momen naskah (lihat katalog SFX di `Resources/audio/sfx/`, misal `impact-cine.mp3`, `riser-cine.mp3`, `whoosh-fast.mp3`, `whoosh-big.mp3`, `swoosh-quick.mp3`, `transition-snap.mp3`, `transition-soft.mp3`, `pop.mp3`, `sparkle.mp3`, atau SFX tematik tambahan seperti ketukan pintu/hujan/detak jantung jika tersedia di `public/sfx/`).

### D. Moodboard Ruangan & Efek Cerita per Shot
Untuk setiap shot dalam part, definisikan:
1. **Room Preset:** `horror-dark` | `mystery-cold` | `true-story-warm` | `comedy-vibrant` | `void-spotlight`.
2. **Ekspresi & Pose Alpha (`AlphaCharacter`):** kombinasi `expression` (`happy`, `thinking`, `shock`, `squint`, `smug`) dan `bodyPose` (`wave`, `gesture_right`, `gesture_left`, `point`, `shrug`, `think`).
3. **Efek / Visual Cerita:** proyeksi siluet/ilustrasi SVG di dinding/belakang Alpha, kartu kejadian berbingkai, kilas balik vignette/sepia, partikel kabut/bara/hujan, glitch horor, atau camera shake.
4. **Transisi Stinger:** pilih dari `shadow-wipe`, `glitch-cut`, `flashback-iris`, `fog-curtain`, `blood-slash`, `laser-scan`, `golden-reveal`.

- **ACC Gate 2:** Sajikan naskah utuh, ringkasan pembagian part (estimasi kata & detik tiap part), moodboard, dan peta SFX. Tunggu ACC user.

---

## TAHAP 3: Generate VO Alpha, Validasi Durasi & Lip-Sync

Jalankan berurutan untuk setiap `<part-dir>` (`projects/<slug>/part-1`, dst.):

```bash
python tools/generate_gemini_tts.py "<part-dir>/script/tts_script.json" "<part-dir>/audio/vo_alpha.mp3"
```

1. **Gerbang Validasi Durasi Keras:**
   - Script `generate_gemini_tts.py` melaporkan durasi aktual dalam detik & frame @ 30 FPS.
   - **WAJIB `45.0s <= durasi <= 120.0s`** (`1350 <= frames <= 3600`).
   - Jika durasi < 45s atau > 120s, perbaiki naskah/pemecahan part lalu generate ulang (pakai `--only-turn` atau `--force`) sebelum lanjut!
2. Salin audio ke `<part-dir>/public/audio/vo.mp3` (dan BGM ke `<part-dir>/public/audio/bgm.mp3` jika memakai BGM).
3. Ekstrak word timestamps:
   ```bash
   python tools/extract_timestamps.py "<part-dir>/audio/vo_alpha.mp3" "<part-dir>/audio/word_timestamps.json" "<part-dir>/script/timestamps.md"
   cp "<part-dir>/audio/word_timestamps.json" "<part-dir>/src/word_timestamps.json"
   ```
4. Generate lip-sync akustik:
   ```bash
   python tools/generate_lipsync.py "<part-dir>/audio/vo_alpha.mp3" "<part-dir>/audio/word_timestamps.json" "<part-dir>/src/lipSyncData.ts" "<part-dir>/audio/speaker_turns.json"
   ```
5. **ACC Gate 3:** Laporkan durasi aktual tiap part, daftar segmen/shot, dan status timestamps sebelum coding visual.

---

## TAHAP 4: Coding Remotion, QA Audit & Preview PNG

1. Salin starter dari `templates/part-template/src/` ke `<part-dir>/src/` (jangan buat `package.json` atau `node_modules` di dalam folder part!).
2. Implementasikan `shots.ts` dan `scenes.tsx` menggunakan komponen `@shared/*`:
   - `SpatialCameraRig` untuk pergerakan kamera organik + `shakeFrame` saat jumpscare/hentakan.
   - `RoomBackdrop` sesuai mood genre + `StoryVisualCard` / ilustrasi SVG naratif di zona tengah (`top: 300px - 880px`).
   - `AliveCharacterRig` membungkus `AlphaCharacter` pada posisi lantai `bottom: 370px`, diberi `mouthOpen={getMouthOpenness('alpha', globalFrame)}` dan `word` aktif dari `word_timestamps.json`.
   - `KineticWordSubtitle` di `bottom: 260px`, `ProgressBar` 8px di `bottom: 0`.
   - `StingerOverlay` antar-shot yang relevan dengan cerita.
3. Jalankan audit QA otomatis:
   ```bash
   node tools/runner.js audit "<part-dir>"
   ```
   Pastikan status `[ PASSED ]` (lolos durasi 45–120s, safe zone, zero modulo chatter, transform preservation, valid stingers).
4. Render preview still frame tiap shot penting:
   ```bash
   node tools/runner.js still "<part-dir>" --frame <frame>
   ```
5. **ACC Gate 4:** Sertakan seluruh path `<part-dir>/previews/*.png` di `FILES_TO_SEND` pada blok `---HERMES_HANDOFF---` agar Hermes mengirim gambar preview ke user.

---

## TAHAP 5: Full Video Render & Penyerahan

1. Setelah user memberi ACC pada preview Gate 4, render part **satu per satu** (jangan paralel agar RAM 6 GB di VPS tidak OOM):
   ```bash
   node tools/runner.js render "<part-dir>"
   ```
2. Verifikasi `<part-dir>/render/<nama-part>.mp4` terbentuk dan ukurannya normal.
3. Akhiri dengan `STATUS: COMPLETED` dan cantumkan seluruh path `.mp4` di `FILES_TO_SEND` pada `---HERMES_HANDOFF---` agar Hermes mengirim videonya ke chat user.
