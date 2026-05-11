#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$ROOT_DIR/infrastructure"
BACKEND_PID_FILE="$ROOT_DIR/backend/backend.pid"
FRONTEND_PID_FILE="$ROOT_DIR/frontend/frontend.pid"

compose_cmd() {
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    docker compose "$@"
  fi
}

echo "🛑 Stopping services..."

if [ -f "$BACKEND_PID_FILE" ]; then
  kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null || true
  rm -f "$BACKEND_PID_FILE"
fi

if [ -f "$FRONTEND_PID_FILE" ]; then
  kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null || true
  rm -f "$FRONTEND_PID_FILE"
fi

pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

cd "$INFRA_DIR"
compose_cmd down

echo "✅ Stopped!"
