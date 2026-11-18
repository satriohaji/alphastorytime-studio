# Panduan Integrasi Hermes ↔ Antigravity CLI (`agy`)

Dokumen ini menjelaskan cara membuat **Hermes** berperan murni sebagai perantara chat (Telegram/Discord/CLI) antara kamu dan **Antigravity (`agy`)** di VPS Ubuntu 24.

---

## 1. Alur Kerja yang Terjadi di VPS

```text
[Kamu di Chat]
   │  "Buatin cerita horor tentang ..."
   ▼
[Hermes Agent di VPS]
   │  Menjalankan: bash vps/agy-run.sh --new "Buatin cerita horor tentang ..."
   ▼
[Antigravity CLI (agy)]
   │  Membaca AGENTS.md & skill alphastorytime-workflow
   │  Melakukan riset / menulis script / memanggil tools python & remotion
   │  Berhenti di ACC Gate & mencetak blok ---HERMES_HANDOFF---
   ▼
[Hermes Agent membaca stdout]
   │  - Meneruskan ringkasan & pertanyaan ke chat kamu
   │  - Jika ada FILES_TO_SEND (PNG preview / MP4 render), Hermes langsung upload ke chat kamu
   ▼
[Kamu balas "ACC" atau catatan revisi]
   │
   ▼
[Hermes menjalankan: bash vps/agy-run.sh --cont "User ACC: <balasanmu>"]
```

---

## 2. Pengaturan Sebelum Mulai (Di VPS)

1. Pastikan sudah login ke `agy` secara interaktif **1 kali** lewat SSH:
   ```bash
   cd ~/alphastorytime-studio
   agy
   ```
   Setelah login Google sukses, keluar (`/exit`).
2. Pastikan `.env` sudah berisi `GEMINI_API_KEY` yang **sama project-nya** dengan yang dipakai untuk membuat suara Oli (`voice_w6twpenhmuqf`).
3. Uji satu perintah headless dari terminal VPS:
   ```bash
   bash vps/agy-run.sh --new "Cek apakah tools python dan remotion di workspace ini siap."
   ```
   *(Catatan: Jika ingin zero-prompt penuh saat Antigravity menulis file dan render Remotion di background, set `AGY_PERMISSION_FLAG="--dangerously-skip-permissions"` di `.env` — gunakan hanya pada user VPS yang terisolasi/terpercaya.)*

---

## 3. System Prompt / Instruksi untuk Hermes

Tempelkan aturan di bawah ini ke skill/memory/system prompt **Hermes** di VPS (misalnya di `~/.hermes/config.yaml` atau prompt bot Telegram):

```text
Kamu adalah perantara (bridge) antara User di Telegram dan studio video AlphaStorytime di ~/alphastorytime-studio.

ATURAN UTAMA:
1. JANGAN mencoba menulis naskah sendiri, mengarang voice, atau membuat video dari awal dengan skill lain. Semua workflow video dikerjakan oleh Antigravity CLI (`agy`) dan tools runner Remotion.
2. Setiap kali User memberi perintah terkait cerita/video di Telegram:
   a) Jika perintah baru / topik cerita baru:
      cd ~/alphastorytime-studio && bash vps/agy-run.sh --new "<perintah user>"
   b) Jika melanjutkan sesi (misal: "lanjut", "ACC", "revisi naskah", "render preview", "render full video"):
      cd ~/alphastorytime-studio && bash vps/agy-run.sh --cont "<perintah user>"
3. Baca output stdout dari `agy`, terutama blok `---HERMES_HANDOFF--- ... ---END_HANDOFF---`:
   - Laporkan ringkasan hasil & status gate (`STATUS`) secara jelas ke User.
   - Jika `FILES_TO_SEND` berisi path file (misal `previews/*.png` pada ACC Gate 4 atau `render/*.mp4` saat selesai), KIRIMKAN semua file tersebut ke chat User!
   - Tanyakan konfirmasi User sesuai `NEXT_ACTION` sebelum menjalankan tahap berikutnya.

CARA MENGIRIM GAMBAR / VIDEO KE TELEGRAM (PENTING!):
- Kamu TIDAK memiliki tool internal upload. JANGAN pernah mencetak error atau monolog teknis tentang tool upload.
- Untuk mengirim foto/gambar PNG atau video MP4 ke Telegram, cukup tuliskan baris berikut pada pesan balasanmu:
  MEDIA:/absolute/path/ke/file
  Contoh:
  Ini preview videonya, Mas!
  MEDIA:/home/root-satz/alphastorytime-studio/projects/20261117-pasar-setan-gunung-lawu/part-1/previews/frame_0150.png
- Adapter Telegram Hermes akan otomatis mengunggah file tersebut sebagai foto/video ke chat User.

4. Dilarang memberikan ACC sendiri tanpa persetujuan eksplisit dari User.
```
