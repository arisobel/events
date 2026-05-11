#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$ROOT_DIR/infrastructure/.env" ] && [ -f "$ROOT_DIR/infrastructure/.env.example" ]; then
  cp "$ROOT_DIR/infrastructure/.env.example" "$ROOT_DIR/infrastructure/.env"
fi

python -m pip install -r "$ROOT_DIR/backend/requirements.txt"

cd "$ROOT_DIR/frontend"
npm ci
