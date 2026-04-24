#!/bin/bash

echo "🛑 Stopping services..."

pkill -f uvicorn
pkill -f vite

cd infrastructure
docker-compose down

echo "✅ Stopped!"
