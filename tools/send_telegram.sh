#!/usr/bin/env bash
set -euo pipefail

# Helper to send Photo/Video directly to Telegram chat
# Usage:
#   bash tools/send_telegram.sh <file_path> [caption]

FILE="${1:?File path required}"
CAPTION="${2:-}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load .env if present
if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  source "$REPO_ROOT/.env"
  set +a
fi

# Fallback: check ~/.hermes config if token not in .env
BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"

if [ -z "$BOT_TOKEN" ] && [ -f "$HOME/.hermes/config.yaml" ]; then
  BOT_TOKEN=$(grep -E 'telegram_token|bot_token|token:' "$HOME/.hermes/config.yaml" 2>/dev/null | head -n1 | awk '{print $2}' | tr -d '"' || true)
fi

if [ -z "$BOT_TOKEN" ]; then
  # If no direct bot token, print Hermes MEDIA tag so Hermes Telegram bridge handles it
  echo "MEDIA:$FILE"
  exit 0
fi

if [ -z "$CHAT_ID" ]; then
  echo "MEDIA:$FILE"
  exit 0
fi

EXT="${FILE##*.}"
EXT="$(echo "$EXT" | tr '[:upper:]' '[:lower:]')"

if [ "$EXT" = "png" ] || [ "$EXT" = "jpg" ] || [ "$EXT" = "jpeg" ]; then
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto" \
    -F chat_id="${CHAT_ID}" \
    -F photo="@${FILE}" \
    -F caption="${CAPTION}" > /dev/null
  echo "[SUCCESS] Photo sent to Telegram: $FILE"
elif [ "$EXT" = "mp4" ]; then
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendVideo" \
    -F chat_id="${CHAT_ID}" \
    -F video="@${FILE}" \
    -F caption="${CAPTION}" > /dev/null
  echo "[SUCCESS] Video sent to Telegram: $FILE"
else
  curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendDocument" \
    -F chat_id="${CHAT_ID}" \
    -F document="@${FILE}" \
    -F caption="${CAPTION}" > /dev/null
  echo "[SUCCESS] Document sent to Telegram: $FILE"
fi
