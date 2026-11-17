#!/usr/bin/env bash
set -euo pipefail

# Helper bridge untuk Hermes memanggil Antigravity CLI (agy) di repo ini.
# Pemakaian:
#   bash vps/agy-run.sh --new   "<prompt cerita baru>"
#   bash vps/agy-run.sh --cont  "<balasan ACC / revisi>"
#   bash vps/agy-run.sh --conv <conversation_id> "<balasan ACC / revisi>"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

export PATH="$HOME/.local/bin:$PATH"

if [ -f "$REPO_ROOT/.venv/bin/activate" ]; then
  # Pastikan tool python (.venv) aktif ketika agy mengeksekusi perintah
  source "$REPO_ROOT/.venv/bin/activate"
fi

if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  source "$REPO_ROOT/.env"
  set +a
fi

# Mode izin eksekusi: default 'auto' (bisa ubah AGY_PERMISSION_FLAG='--dangerously-skip-permissions' di .env jika mau zero-prompt)
PERM_FLAG="${AGY_PERMISSION_FLAG:---mode=auto}"

MODE="${1:-}"
shift || true

mkdir -p "$REPO_ROOT/logs"
LOG_FILE="$REPO_ROOT/logs/agy_$(date +%Y%m%d_%H%M%S).log"

case "$MODE" in
  --new)
    PROMPT="${1:?Prompt wajib diisi}"
    agy $PERM_FLAG -p "$PROMPT" | tee "$LOG_FILE"
    ;;
  --cont)
    PROMPT="${1:?Prompt wajib diisi}"
    agy $PERM_FLAG -c -p "$PROMPT" | tee "$LOG_FILE"
    ;;
  --conv)
    CONV_ID="${1:?Conversation ID wajib diisi}"
    shift
    PROMPT="${1:?Prompt wajib diisi}"
    agy $PERM_FLAG --conversation "$CONV_ID" -p "$PROMPT" | tee "$LOG_FILE"
    ;;
  *)
    echo "Usage:"
    echo "  bash vps/agy-run.sh --new \"<prompt>\""
    echo "  bash vps/agy-run.sh --cont \"<balasan>\""
    echo "  bash vps/agy-run.sh --conv <id> \"<balasan>\""
    exit 1
    ;;
esac
