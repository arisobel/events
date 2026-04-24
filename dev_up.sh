#!/bin/bash

echo "🚀 Starting Event Platform..."

# 1. Infra (Postgres + Redis) - background
echo "📦 Starting infrastructure..."
cd infrastructure
docker-compose up -d postgres redis

# 2. Backend - background
echo "🧠 Starting backend..."
cd ../backend
alembic upgrade head
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &

# 3. Frontend - background
echo "💻 Starting frontend..."
cd ../frontend
nohup npm run dev > frontend.log 2>&1 &

# 4. Ports public (Codespaces)
echo "🌐 Making ports public..."
cd ..
./make_ports_public.sh 2>/dev/null

echo ""
echo "✅ System started!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo ""
echo "Logs:"
echo "  backend.log"
echo "  frontend.log"
