#!/usr/bin/env bash
set -euo pipefail

if ! command -v nvm >/dev/null 2>&1; then
  echo "nvm is missing. Install it first:"
  echo 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash'
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node is missing. Installing the latest LTS via nvm..."
  nvm install --lts
fi

cd "$(dirname "$0")/.."

echo "Node: $(node -v)"
echo "npm:  $(npm -v)"

npm install
npm run dev
