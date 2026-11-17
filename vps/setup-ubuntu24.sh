#!/usr/bin/env bash
set -euo pipefail

# Setup script untuk VPS Ubuntu 24.04 LTS (4 vCPU, 6 GB RAM)
# Jalankan dari root repo: bash vps/setup-ubuntu24.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=============================================================="
echo " AlphaStorytime Studio - Setup VPS Ubuntu 24.04"
echo " Repo: $REPO_ROOT"
echo "=============================================================="

# 1. Buat Swap 4 GB jika belum ada (pengaman RAM 6 GB saat Remotion + Whisper jalan)
if ! swapon --show | grep -q '/swapfile'; then
  echo "[1/7] Membuat swap 4 GB di /swapfile..."
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  if ! grep -q '^/swapfile ' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  fi
else
  echo "[1/7] Swap sudah aktif, lewati."
fi

# 2. Paket sistem + FFmpeg + Python + Dependensi Chromium Headless untuk Ubuntu 24.04
echo "[2/7] Menginstall paket sistem, FFmpeg, Python, dan library Chromium..."
sudo apt-get update
sudo apt-get install -y \
  curl git unzip build-essential ffmpeg \
  python3 python3-venv python3-pip \
  ca-certificates gnupg \
  libnss3 libnspr4 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libxshmfence1 \
  fonts-liberation fonts-noto-color-emoji

# Paket yang berganti nama ke t64 di Ubuntu 24.04
for pkg in libasound2t64 libasound2 libatk1.0-0t64 libatk1.0-0 libcups2t64 libcups2 libgtk-3-0t64 libgtk-3-0; do
  if apt-cache show "$pkg" >/dev/null 2>&1; then
    sudo apt-get install -y "$pkg" || true
  fi
done

# Opsional: install font populer jika tersedia di repo apt
for font_pkg in fonts-inter fonts-poppins fonts-jetbrains-mono; do
  if apt-cache show "$font_pkg" >/dev/null 2>&1; then
    sudo apt-get install -y "$font_pkg" || true
  fi
done
fc-cache -f || true

# 3. Install Node.js 20 LTS jika belum terpasang
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 18 ]; then
  echo "[3/7] Menginstall Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "[3/7] Node.js sudah terpasang: $(node -v)"
fi

# 4. Install dependencies Remotion di tools/remotion
echo "[4/7] Menjalankan npm ci di tools/remotion..."
cd "$REPO_ROOT/tools/remotion"
npm ci || npm install
npx remotion browser ensure
cd "$REPO_ROOT"

# 5. Setup Python virtual environment
echo "[5/7] Menyiapkan Python venv & packages (google-genai, faster-whisper, numpy, av)..."
python3 -m venv "$REPO_ROOT/.venv"
source "$REPO_ROOT/.venv/bin/activate"
pip install --upgrade pip
pip install -r "$REPO_ROOT/vps/requirements.txt"

# 6. Permission script shell
echo "[6/7] Mengaktifkan izin eksekusi script..."
chmod +x "$REPO_ROOT/tools/"*.sh "$REPO_ROOT/vps/"*.sh

# 7. Install Antigravity CLI (agy) jika belum ada
if ! command -v agy >/dev/null 2>&1; then
  echo "[7/7] Menginstall Antigravity CLI (agy)..."
  curl -fsSL https://antigravity.google/cli/install.sh | bash
else
  echo "[7/7] Antigravity CLI (agy) sudah terpasang: $(command -v agy)"
fi

echo ""
echo "=============================================================="
echo " Setup Selesai!"
echo " Langkah berikutnya (cukup sekali):"
echo " 1. Salin .env.example -> .env lalu isi GEMINI_API_KEY yang sama dengan laptop."
echo " 2. Jalankan 'source ~/.bashrc' dan login Antigravity CLI dengan menjalankan 'agy'."
echo " 3. Hubungkan Hermes menggunakan panduan di vps/HERMES_PROMPT_AND_WORKFLOW.md."
echo "=============================================================="
