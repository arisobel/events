#!/bin/bash
set -e

echo "=== Testando Fluxo de Eventos ==="
echo ""

# 1. Login
echo "1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro: Não foi possível obter token"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ Token obtido!"
echo ""

# 2. Listar eventos
echo "2. Listando eventos..."
curl -s -X GET http://localhost:8000/events \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== Teste de Eventos Completo! ==="
