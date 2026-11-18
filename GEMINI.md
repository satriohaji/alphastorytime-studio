# Aturan Kerja & SOP Konten Video AlphaStorytime (`alpha`)

Dokumen aturan ini wajib dipatuhi oleh seluruh AI Agent yang beroperasi di workspace ini (`alphastorytime-studio`).

---

## 1. Prinsip Utama: Zero Assumption & "Grill Me"
- **Dilarang keras berasumsi sendiri** mengenai alur cerita, sudut pandang tokoh, fakta kisah nyata, nuansa horor/hiburan, jumlah part, atau elemen visual penting jika belum dikonfirmasi oleh user.
- **Selalu validasi & tanyakan ("Grill Me"):** Sebelum mengunci riset dan menulis naskah, ajukan pertanyaan klarifikasi yang singkat, tajam, dan terarah kepada user (melalui chat langsung atau lewat Hermes).

---

## 2. Identitas & Karakter Paten: Alpha (`alpha`)
- **Nama Panggilan:** Alpha (`alphastorytimee`)
- **Konsep Acara:** Alpha adalah narrator/storyteller di dalam sebuah ruangan studio yang bercerita langsung kepada penonton, didukung **efek visual naratif, properti/ilustrasi cerita, dan transisi scene dinamis** yang menggambarkan jalannya cerita agar hidup dan imersif.
- **Genre Cerita:** Horor / Urban Legend, Kisah Nyata / Sejarah / Misteri, dan Kisah Hiburan / Plot Twist.
- **Karakter Visual Paten (`@shared/AlphaCharacter`):** Maskot 2.5D "Kok Bisa" Volumetric Style bervolume 3D: kupluk / beanie hitam ribbed tebal, 4 helai poni rambut stylish, wajah bulat chibi dengan gradasi volumetrik halus, mata anime berbinar dengan 2 catchlights glossy, pipi blush, hoodie saku kanguru dengan drawstrings putih & aglet logam perak.
- **Pose Tangan & Lengan Ekspresif:** Pose horor/shock terangkat memegang pipi (*Home Alone*), gesture tangan menunjuk scene plate (`gesture_left`, `gesture_right`), lambaian tangan (`wave`), berpikir (`think`), dan santai (`idle`).
- **Rossark Motion Engine:** Pernapasan dada volume preservation, kedipan mata asimetris, tatapan bola mata dinamis, dan lip-sync viseme bibir karaoke organik mengikuti audio TTS.
- **Karakter Suara Paten (`tools/gemini_voices.json`):**
  - Voice ID: `voice_onwkczqs6uoj` (Model: `gemini-3.8-flash-tts` via Gemini Voice Design).
  - **Wajib Konsisten:** Seluruh part dan episode wajib menggunakan `voice_id` `voice_w6twpenhmuqf`. Nuansa emosi diubah lewat parameter `style` (misal tegang/horor, hangat/kisah nyata, ceria/hiburan), bukan mengganti `voice_id`.

---

## 3. Batasan Durasi & Aturan Multi-Part (Wajib)
- **Durasi per Video / Part:** Minimal **45 detik** (`1350 frame @ 30 FPS`), maksimal **120 detik / 2 menit** (`3600 frame @ 30 FPS`).
- **Tulis Utuh Dulu, Baru Bagi Part:**
  1. Selalu susun dan tulis **naskah cerita utuh dari awal hingga tamat** lebih dulu agar alur, pacing, dan emosi cerita terjaga.
  2. Estimasi durasi baca Bahasa Indonesia (~135–145 kata/menit → target aman **110–265 kata per part**).
  3. Jika cerita utuh melebihi 2 menit, pecah menjadi `part-1`, `part-2`, dst. **di titik cliffhanger atau transisi bab alami** (dilarang memotong di tengah kalimat atau klimaks tanggung).
  4. Untuk episode multi-part:
     - `part-1` s/d `part-(N-1)` diakhiri cliffhanger penarik penasaran ("Lanjut Part berikutnya...").
     - `part-2` s/d `part-N` dibuka hook recap super singkat (1 kalimat pengingat) sebelum melanjutkan cerita.
- **Validasi Keras Sebelum Coding Video:** Jika audio TTS hasil generate pada sebuah part berdurasi **< 45 detik** atau **> 120 detik**, wajib perbaiki naskah/pacing/pemecahan part lebih dulu sebelum lanjut ke Tahap 4.

---

## 4. Alur Kerja Bertahap Wajib (5-Stage Workflow) & Gerbang ACC

Setiap tahap **WAJIB** memberikan ringkasan hasil dan memperoleh persetujuan (**ACC**) user sebelum melangkah ke tahap berikutnya:

### Tahap 1: Riset Cerita & Outline Utuh (*Grill-Me Gate*)
- Jika kisah nyata/sejarah/urban legend terkenal: lakukan riset fakta/kronologi yang akurat (sertakan daftar referensi/sumber agar tidak halusinasi).
- Jika fiksi/hiburan/horor kreatif: bangun premis, alur (*hook → buildup → klimaks → twist/resolusi*), dan nuansa ruangan.
- Ajukan pertanyaan klarifikasi terarah (*grill-me*) mengenai angle, tingkat keseraman/emosi, dan preferensi ending.
- **ACC Gate 1:** User menyetujui outline cerita utuh & arah genre.

### Tahap 2: Naskah Utuh, Pembagian Part (45–120s), Moodboard Ruangan & Peta SFX
- Tulis naskah cerita utuh secara mengalir (*conversational storytelling* ala Alpha).
- Pecah menjadi part-part berdurasi estimasi **45–120 detik** (`part-1`, `part-2`, ...).
- Susun **Moodboard & Efek Scene** per shot untuk setiap part:
  - Preset ruangan Alpha (`horror-dark`, `mystery-cold`, `true-story-warm`, `comedy-vibrant`, `void-spotlight`).
  - Efek cerita di layar (siluet bayangan, kilas balik sepia, foto/kartu bukti, partikel kabut/percikan, *camera shake*, *glitch*, dll.).
  - Rencana penempatan **SFX relevan** (minimal dari `Resources/audio/sfx/` atau SFX tambahan yang sesuai cerita) dan volume BGM rendah (`BGM_VOLUME = 0.08 - 0.12`) agar narasi Alpha tetap jernih.
- **Tag Ekspresi TTS Bahasa Inggris `[ ]` / `style`:** Gunakan deskripsi emosi bahasa Inggris di `tts_script.json` agar Gemini TTS merespons intonasi dengan presisi.
- **ACC Gate 2:** User meninjau & meng-ACC naskah utuh, pembagian part, moodboard, dan rencana SFX.

### Tahap 3: Generate VO Alpha, Timestamps Milidetik & Lip-Sync Akustik
- Jalankan untuk tiap part:
  1. `python tools/generate_gemini_tts.py "<part-dir>/script/tts_script.json" "<part-dir>/audio/<nama_file>.mp3"`
  2. Cek durasi MP3 (`45s <= durasi <= 120s`). Copy master VO ke `<part-dir>/public/audio/vo.mp3`.
  3. `python tools/extract_timestamps.py "<part-dir>/audio/<nama_file>.mp3" "<part-dir>/audio/word_timestamps.json" "<part-dir>/script/timestamps.md"`
  4. `python tools/generate_lipsync.py "<part-dir>/audio/<nama_file>.mp3" "<part-dir>/audio/word_timestamps.json" "<part-dir>/src/lipSyncData.ts" "<part-dir>/audio/speaker_turns.json"`
- Salin `word_timestamps.json` ke `<part-dir>/src/word_timestamps.json`.
- **ACC Gate 3:** Laporkan durasi aktual tiap part, tabel shot/timestamp, dan konfirmasi lip-sync ke user.

### Tahap 4: Coding Remotion, QA Audit & Preview Stills
- Bangun kode adegan per part di `<part-dir>/src/` mengikuti `templates/part-template/`:
  - **2-Layer Visual Architecture:** Ruangan studio Alpha yang responsif mood + layer efek/ilustrasi cerita dinamis.
  - **Standar Animasi:** `SpatialCameraRig` (organic drift + shake saat momen kejut), `KineticWordSubtitle` (karaoke per kata di `bottom: 260`), `AliveCharacterRig` (preserves `style.transform`, tidak pernah pakai animasi mulut modulo seperti `frame % 9`), `StingerOverlay` tematik cerita, dan `ProgressBar` 8px di `bottom: 0`.
  - **Safe Zone 9:16 (1080×1920):** Top headline `top: 170px`, area ilustrasi/efek `top: 300px - 880px`, posisi lantai Alpha `bottom: 370px`, subtitle karaoke `bottom: 260px` (`maxWidth: 860px`), bottom reserve `0 - 200px` bersih dari teks penting.
- Jalankan audit otomatis:
  `node tools/runner.js audit "<part-dir>"`
- Render preview still keyframe untuk setiap shot penting:
  `node tools/runner.js still "<part-dir>" --frame <nomor_frame>`
- **ACC Gate 4:** Sajikan hasil audit QA + path file preview PNG agar user (atau Hermes) dapat meninjau visual sebelum full render.

### Tahap 5: Full Render Video & Penyerahan
- Render video per part **satu per satu** (jangan jalankan paralel di VPS 6 GB RAM):
  `node tools/runner.js render "<part-dir>"`
- Output otomatis tersimpan di `<part-dir>/render/<nama-part>.mp4`.
- Verifikasi file output ada, durasi sesuai (`45–120s`), audio & subtitle sinkron, lalu serahkan hasil akhir ke user.

---

## 5. Sentralisasi Tools & Keamanan File
- **Satu Folder Tools Terpusat:** Semua dependencies Remotion (`node_modules`) dan script berada di `tools/`. Folder proyek cerita (`projects/<slug>/part-X/`) **dilarang** membuat `node_modules/` atau `package.json` duplikat.
- **File Safety:** Dilarang menghapus file audio master, script, atau video render tanpa izin eksplisit user.
- **Struktur Proyek Rapi:**
  ```text
  projects/
  └── YYYYMMDD-<slug-cerita>/
      ├── STORY_MASTER.md          # Riset, outline, & naskah utuh
      ├── part-1/
      │   ├── script/
      │   ├── audio/
      │   ├── public/audio/
      │   ├── src/
      │   ├── previews/
      │   └── render/
      └── part-2/ ...
  ```

---

## 6. Protokol Handoff untuk Hermes Chatbot (`---HERMES_HANDOFF---`)
Jika agen dijalankan melalui perantara chatbot (**Hermes** via `agy -p` / `--conversation`), setiap kali berhenti menunggu ACC user atau menyelesaikan tahap render, **WAJIB** akhiri respons dengan blok terstruktur berikut agar Hermes tahu persis status dan file apa yang harus dikirim ke user:

```text
---HERMES_HANDOFF---
STATUS: <NEEDS_ACC_GATE_1 | NEEDS_ACC_GATE_2 | NEEDS_ACC_GATE_3 | NEEDS_ACC_GATE_4 | COMPLETED | BLOCKED>
PROJECT_DIR: projects/<slug-cerita>
ACTIVE_PARTS: <part-1, part-2, ...>
FILES_TO_SEND:
- <relative/path/to/preview_or_video_1>
- <relative/path/to/preview_or_video_2>
NEXT_ACTION: <instruksi singkat apa yang ditunggu dari user, misal "ACC lanjut Tahap 2" atau "Review preview lalu balas ACC untuk render full video">
---END_HANDOFF---
```
- Jika tidak ada file yang perlu dikirim (misal Gate 1 atau Gate 3), isi `FILES_TO_SEND: none`.
- Pada **ACC Gate 4**, wajib sertakan seluruh preview PNG (`previews/*.png`) di `FILES_TO_SEND`.
- Pada **COMPLETED (Tahap 5)**, wajib sertakan seluruh file MP4 final (`render/*.mp4`) di `FILES_TO_SEND`.
