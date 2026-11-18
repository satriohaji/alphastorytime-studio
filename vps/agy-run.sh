#!/usr/bin/env bash
set -euo pipefail

# Helper bridge untuk Hermes / Telegram memanggil Antigravity CLI (agy) di repo ini.
# Pemakaian:
#   bash vps/agy-run.sh --bg --new  "<prompt cerita baru>"   (Asynchronous / Anti-timeout)
#   bash vps/agy-run.sh --bg --cont "<balasan ACC / revisi>" (Asynchronous / Anti-timeout)
#   bash vps/agy-run.sh --status                            (Cek status proses background)
#   bash vps/agy-run.sh --stop                              (Hentikan proses background)
#   bash vps/agy-run.sh --new   "<prompt cerita baru>"       (Synchronous)
#   bash vps/agy-run.sh --cont  "<balasan ACC / revisi>"     (Synchronous)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

export PATH="$HOME/.local/bin:$PATH"

if [ -f "$REPO_ROOT/.venv/bin/activate" ]; then
  source "$REPO_ROOT/.venv/bin/activate"
fi

if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  source "$REPO_ROOT/.env"
  set +a
fi

mkdir -p "$REPO_ROOT/logs"
PID_FILE="$REPO_ROOT/logs/agy.pid"

# Mode izin eksekusi: default '--dangerously-skip-permissions' untuk headless non-interaktif
PERM_FLAG="${AGY_PERMISSION_FLAG:---dangerously-skip-permissions}"

MODE="${1:-}"
shift || true

# 1. STATUS CHECK (Cepat, non-blocking, selesai dalam 0.1s untuk Telegram)
if [ "$MODE" = "--status" ]; then
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
      LATEST_LOG=$(ls -t "$REPO_ROOT/logs"/agy_*.log 2>/dev/null | head -n1 || true)
      echo "[RUNNING] Proses Antigravity aktif di background (PID: $PID)."
      if [ -n "$LATEST_LOG" ] && [ -f "$LATEST_LOG" ]; then
        echo "--- 6 Baris Log Terakhir ---"
        tail -n 6 "$LATEST_LOG"
      fi
      exit 0
    fi
  fi
  echo "[IDLE] Tidak ada proses produksi yang sedang berjalan."
  exit 0
fi

# 2. STOP PROCESS
if [ "$MODE" = "--stop" ]; then
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
      kill "$PID" || true
      rm -f "$PID_FILE"
      echo "[SUCCESS] Proses PID $PID berhasil dihentikan."
      exit 0
    fi
    rm -f "$PID_FILE"
  fi
  echo "[INFO] Tidak ada proses aktif untuk dihentikan."
  exit 0
fi

# 3. ASYNCHRONOUS BACKGROUND LAUNCHER (Default untuk --bg, --async, --new, --cont, --conv)
# Menghindari timeout 180s di Telegram dengan merilis kontrol segera ke terminal/bot
if [ "$MODE" = "--bg" ] || [ "$MODE" = "--async" ] || [ "$MODE" = "--new" ] || [ "$MODE" = "--cont" ] || [ "$MODE" = "--conv" ]; then
  if [ "$MODE" = "--bg" ] || [ "$MODE" = "--async" ]; then
    SUBMODE="${1:?Submode wajib diisi (--new, --cont, --conv)}"
    shift
  else
    SUBMODE="$MODE"
  fi
  
  if [ "$SUBMODE" = "--conv" ]; then
    CONV_ID="${1:?Conversation ID wajib diisi}"
    shift
    PROMPT="${1:?Prompt wajib diisi}"
    shift || true
  else
    PROMPT="${1:?Prompt wajib diisi}"
    shift || true
  fi

  LOG_FILE="$REPO_ROOT/logs/agy_$(date +%Y%m%d_%H%M%S).log"

  # Spawn subshell lepas di background
  (
    echo "=== Memulai Produksi Background: $(date) ===" > "$LOG_FILE"
    if [ "$SUBMODE" = "--new" ]; then
      agy $PERM_FLAG -p "$PROMPT" >> "$LOG_FILE" 2>&1 || true
    elif [ "$SUBMODE" = "--cont" ]; then
      agy $PERM_FLAG -c -p "$PROMPT" >> "$LOG_FILE" 2>&1 || true
    elif [ "$SUBMODE" = "--conv" ]; then
      agy $PERM_FLAG --conversation "$CONV_ID" -p "$PROMPT" >> "$LOG_FILE" 2>&1 || true
    fi
    echo "=== Produksi Selesai: $(date) ===" >> "$LOG_FILE"

    # Kirim notifikasi / video terbaru ke Telegram jika ada
    LATEST_VIDEO=$(find "$REPO_ROOT/projects" -type f -name "*.mp4" -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d" " || true)
    if [ -n "$LATEST_VIDEO" ] && [ -f "$REPO_ROOT/tools/send_telegram.sh" ]; then
      bash "$REPO_ROOT/tools/send_telegram.sh" "$LATEST_VIDEO" "🎬 Video baru berhasil selesai diproduksi!" || true
    fi
    rm -f "$PID_FILE"
  ) > /dev/null 2>&1 &

  BG_PID=$!
  echo "$BG_PID" > "$PID_FILE"

  echo "[SUCCESS] Perintah diterima & dijalankan di background (PID: $BG_PID)."
  echo "Proses ini berjalan mandiri di VPS tanpa risiko timeout."
  echo "Periksa status kapan saja: bash vps/agy-run.sh --status"
  echo "Hasil video akan otomatis dikirim ke Telegram Anda ketika rendering selesai!"
  exit 0
fi

# 4. SYNCHRONOUS FALLBACK (Hanya jika secara eksplisit dipanggil dengan flag --sync)
if [ "$MODE" = "--sync" ]; then
  SUBMODE="${1:?Submode wajib diisi (--new, --cont, --conv)}"
  shift
  PROMPT="${1:?Prompt wajib diisi}"
  LOG_FILE="$REPO_ROOT/logs/agy_$(date +%Y%m%d_%H%M%S).log"

  case "$SUBMODE" in
    --new)
      agy $PERM_FLAG -p "$PROMPT" | tee "$LOG_FILE"
      ;;
    --cont)
      agy $PERM_FLAG -c -p "$PROMPT" | tee "$LOG_FILE"
      ;;
    --conv)
      CONV_ID="${1:?Conversation ID wajib diisi}"
      shift
      PROMPT="${1:?Prompt wajib diisi}"
      agy $PERM_FLAG --conversation "$CONV_ID" -p "$PROMPT" | tee "$LOG_FILE"
      ;;
  esac
  exit 0
fi

echo "Usage:"
echo "  bash vps/agy-run.sh --new \"<prompt>\"   (Default Background / Anti-Timeout)"
echo "  bash vps/agy-run.sh --cont \"<balasan>\" (Default Background / Anti-Timeout)"
echo "  bash vps/agy-run.sh --status"
echo "  bash vps/agy-run.sh --stop"
echo "  bash vps/agy-run.sh --sync --new \"<prompt>\" (Synchronous / Interactive)"
exit 1
