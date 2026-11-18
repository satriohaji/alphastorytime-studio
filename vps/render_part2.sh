#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/home/root-satz/alphastorytime-studio"
cd "$REPO_ROOT"

if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  source "$REPO_ROOT/.env"
  set +a
fi

PROJECT_DIR="$REPO_ROOT/projects/20261117-pasar-setan-gunung-lawu/part-2"
OUTPUT_MP4="$PROJECT_DIR/render/20261117-pasar-setan-gunung-lawu_part-2.mp4"
LOG_FILE="$REPO_ROOT/logs/render_part2_$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$PROJECT_DIR/render"
mkdir -p "$REPO_ROOT/logs"

echo "=== Memulai Full Render Part 2: $(date) ===" | tee "$LOG_FILE"

node tools/runner.js render "$PROJECT_DIR" --crf=19 --concurrency=4 2>&1 | tee -a "$LOG_FILE"

echo "=== Render Selesai: $(date) ===" | tee -a "$LOG_FILE"

if [ -f "$OUTPUT_MP4" ]; then
  SIZE=$(du -h "$OUTPUT_MP4" | cut -f1)
  echo "[SUCCESS] File video dihasilkan: $OUTPUT_MP4 ($SIZE)" | tee -a "$LOG_FILE"

  CAPTION="Pasar Setan Gunung Lawu Part 2 - Final Cut (1080x1920 30FPS)"
  bash tools/send_telegram.sh "$OUTPUT_MP4" "$CAPTION" | tee -a "$LOG_FILE"
fi
