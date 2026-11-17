# AlphaStorytime Studio (`alphastorytimee`)

Workspace produksi video storytelling vertikal 9:16 (**1080×1920 @ 30 FPS**) berbasis **Remotion + Gemini 3.8 Flash TTS + Whisper + Antigravity**, dirancang agar ringan di Git dan siap dijalankan di **VPS Ubuntu 24.04 (4 vCPU, 6 GB RAM)** dengan **Hermes** sebagai perantara chat.

---

## Fitur Utama Workflow
- **Karakter & Suara Konsisten (`alpha`):**
  - Visual: [AlphaCharacter.tsx](tools/remotion/src/shared/AlphaCharacter.tsx) (hoodie merah emblem `A`, ekspresi lengkap, kedipan mata asimetris, dan lip-sync akustik organik).
  - Suara: Terkunci di [tools/gemini_voices.json](tools/gemini_voices.json) memakai `voice_id: "voice_w6twpenhmuqf"` (`gemini-3.8-flash-tts`), beradaptasi lewat tag `style` sesuai genre (horor, kisah nyata, hiburan).
- **Script Utuh → Smart Part Splitter (45–120 detik/part):**
  - Antigravity selalu menyusun naskah cerita utuh dulu, lalu memecah menjadi `part-1`, `part-2`, dst. di titik cliffhanger alami dengan target **45 detik – 2 menit** per part.
- **2-Layer Studio Stage & Efek Cerita:**
  - Ruangan studio Alpha ([StudioStage.tsx](tools/remotion/src/shared/StudioStage.tsx)) dengan preset mood (`horror-dark`, `mystery-cold`, `true-story-warm`, `comedy-vibrant`, `void-spotlight`) + efek kabut/hujan/glitch/flashback + stinger transisi ([StoryTransitions.tsx](tools/remotion/src/shared/StoryTransitions.tsx)).
- **Protokol Handoff untuk Hermes:**
  - Setiap ACC Gate & penyelesaian render mencetak blok `---HERMES_HANDOFF---` agar Hermes langsung tahu preview PNG / video MP4 mana yang harus dikirim ke chat kamu.

---

## Cara Push ke Git dari Windows (Pertama Kali)

```powershell
cd C:\Users\Lenovo\.gemini\antigravity\scratch\alphastorytime-studio
git init
git add .
git commit -m "Initial AlphaStorytime Studio (Linux VPS & Hermes ready)"
git branch -M main
git remote add origin <URL_REPO_GIT_KAMU>
git push -u origin main
```

---

## Cara Setup & Menjalankan di VPS Ubuntu 24.04

1. **Clone repo & jalankan installer otomatis:**
   ```bash
   git clone <URL_REPO_GIT_KAMU> ~/alphastorytime-studio
   cd ~/alphastorytime-studio
   bash vps/setup-ubuntu24.sh
   ```
2. **Konfigurasi API Key & Login `agy`:**
   ```bash
   cp .env.example .env
   nano .env   # Isi GEMINI_API_KEY yang sama dengan project suara Oli (voice_w6twpenhmuqf)
   source ~/.bashrc
   agy         # Login akun Google 1x, lalu keluar dengan /exit
   ```
3. **Hubungkan Hermes:**
   Ikuti panduan & tempelkan system prompt di [vps/HERMES_PROMPT_AND_WORKFLOW.md](vps/HERMES_PROMPT_AND_WORKFLOW.md).

---

## Perintah Manual (Testing Lokal / VPS)

Aktifkan Python venv (`source .venv/bin/activate` di Linux), lalu dari root repo:

```bash
# 1. Generate VO Alpha (Gemini 3.8 TTS) + speaker_turns.json
python tools/generate_gemini_tts.py projects/20261117-contoh/part-1/script/tts_script.json projects/20261117-contoh/part-1/audio/vo.mp3

# 2. Ekstrak word timestamps (Whisper)
python tools/extract_timestamps.py projects/20261117-contoh/part-1/audio/vo.mp3 projects/20261117-contoh/part-1/audio/word_timestamps.json

# 3. Generate data lip-sync akustik
python tools/generate_lipsync.py projects/20261117-contoh/part-1/audio/vo.mp3 projects/20261117-contoh/part-1/audio/word_timestamps.json projects/20261117-contoh/part-1/src/lipSyncData.ts projects/20261117-contoh/part-1/audio/speaker_turns.json

# 4. Audit QA (durasi 45-120s, safe zone, stinger)
node tools/runner.js audit projects/20261117-contoh/part-1

# 5. Render preview PNG (ACC Gate 4)
node tools/runner.js still projects/20261117-contoh/part-1 --frame 60

# 6. Render video final MP4 (Tahap 5)
node tools/runner.js render projects/20261117-contoh/part-1
```
