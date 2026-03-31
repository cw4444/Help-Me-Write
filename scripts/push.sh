#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v git >/dev/null 2>&1; then
  echo "git is missing."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This script must be run inside a git repository."
  exit 1
fi

git status --short
git add .

if git diff --cached --quiet; then
  echo "Nothing to commit."
else
  git commit -m "${1:-Update writing assistant}"
fi

git push
