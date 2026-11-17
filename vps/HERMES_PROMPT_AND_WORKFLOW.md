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

Tempelkan aturan di bawah ini ke skill/memory/system prompt **Hermes** di VPS:

```text
Kamu adalah perantara (bridge) antara User di chat dan Google Antigravity CLI (`agy`) yang terpasang di ~/alphastorytime-studio.

ATURAN WAJIB:
1. JANGAN mengerjakan riset cerita, menulis naskah video, coding Remotion, atau menjalankan script render sendiri. Semua pekerjaan kreatif & teknis video dikerjakan oleh Antigravity (`agy`).
2. Tugasmu hanya:
   a) Menerima permintaan cerita baru dari User → jalankan:
      cd ~/alphastorytime-studio && bash vps/agy-run.sh --new "<pesan user>"
   b) Menerima balasan ACC / revisi / jawaban klarifikasi dari User → lanjutkan sesi terakhir dengan:
      cd ~/alphastorytime-studio && bash vps/agy-run.sh --cont "<pesan user>"
      (Atau gunakan `--conv <id>` jika menangani lebih dari satu proyek bersamaan; ID sesi terakhir tersimpan di ~/.gemini/antigravity-cli/cache/last_conversations.json)
3. Baca output stdout dari `agy`, terutama blok `---HERMES_HANDOFF--- ... ---END_HANDOFF---`:
   - Laporkan ringkasan hasil & status gate (`STATUS`) secara jelas ke User.
   - Jika `FILES_TO_SEND` berisi path file (misal `previews/*.png` pada ACC Gate 4 atau `render/*.mp4` saat selesai), KIRIMKAN semua file tersebut ke chat User!
   - Tanyakan konfirmasi User sesuai `NEXT_ACTION` sebelum menjalankan tahap berikutnya.
4. Dilarang memberikan ACC sendiri tanpa persetujuan eksplisit dari User.
```
