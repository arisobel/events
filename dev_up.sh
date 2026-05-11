#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$ROOT_DIR/infrastructure"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PID_FILE="$BACKEND_DIR/backend.pid"
FRONTEND_PID_FILE="$FRONTEND_DIR/frontend.pid"

compose_cmd() {
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    docker compose "$@"
  fi
}

is_port_listening() {
  local port="$1"
  ss -ltn "( sport = :$port )" 2>/dev/null | grep -q ":$port"
}

is_pid_running() {
  local pid_file="$1"
  if [ ! -f "$pid_file" ]; then
    return 1
  fi

  local pid
  pid="$(cat "$pid_file")"
  if [ -z "$pid" ]; then
    return 1
  fi

  kill -0 "$pid" 2>/dev/null
}

wait_for_container() {
  local container_name="$1"
  local retries="${2:-30}"
  local delay="${3:-2}"
  local status=""

  for _ in $(seq 1 "$retries"); do
    status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_name" 2>/dev/null || true)"
    if [ "$status" = "healthy" ] || [ "$status" = "running" ]; then
      return 0
    fi
    sleep "$delay"
  done

  echo "❌ Timed out waiting for container: $container_name"
  return 1
}

ensure_infra_env() {
  if [ ! -f "$INFRA_DIR/.env" ] && [ -f "$INFRA_DIR/.env.example" ]; then
    cp "$INFRA_DIR/.env.example" "$INFRA_DIR/.env"
    echo "📝 Created infrastructure/.env from template"
  fi
}

echo "🚀 Starting Event Platform..."

ensure_infra_env

echo "📦 Starting infrastructure..."
cd "$INFRA_DIR"
compose_cmd up -d postgres redis
wait_for_container "events_postgres"
wait_for_container "events_redis"

echo "🗄️ Applying database migrations..."
cd "$BACKEND_DIR"
DEBUG=false alembic upgrade head

echo "👤 Ensuring development admin user..."
DEBUG=false python scripts/ensure_dev_admin.py

echo "🧠 Starting backend..."
if is_pid_running "$BACKEND_PID_FILE" || is_port_listening 8000; then
  echo "ℹ️ Backend already listening on port 8000"
else
  rm -f "$BACKEND_PID_FILE"
  cd "$BACKEND_DIR"
  nohup env DEBUG=true uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
  echo $! > "$BACKEND_PID_FILE"
  echo "✅ Backend started on port 8000"
fi

echo "💻 Starting frontend..."
if is_pid_running "$FRONTEND_PID_FILE" || is_port_listening 5173; then
  echo "ℹ️ Frontend already listening on port 5173"
else
  rm -f "$FRONTEND_PID_FILE"
  cd "$FRONTEND_DIR"
  if [ ! -d node_modules ]; then
    npm ci
  fi
  nohup npm run dev > frontend.log 2>&1 &
  echo $! > "$FRONTEND_PID_FILE"
  echo "✅ Frontend started on port 5173"
fi

if [ -n "${CODESPACES:-}" ] || [ -n "${CODESPACE_NAME:-}" ]; then
  echo "🌐 Making ports public..."
  cd "$ROOT_DIR"
  ./make_ports_public.sh 2>/dev/null || true
fi

echo ""
echo "✅ System started!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo ""
echo "Logs:"
echo "  backend/backend.log"
echo "  frontend/frontend.log"
