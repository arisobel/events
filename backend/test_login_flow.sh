#!/bin/bash

echo "=== Teste do Fluxo de Login ==="
echo ""

# 1. Testar login
echo "1. Fazendo login com admin/admin123..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123")

echo "$LOGIN_RESPONSE" | python -m json.tool
echo ""

# Extrair o token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ ERRO: Não foi possível obter o token de acesso"
    exit 1
fi

echo "✅ Token obtido com sucesso"
echo ""

# 2. Testar /auth/me
echo "2. Buscando dados do usuário atual..."
curl -s -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python -m json.tool
echo ""

# 3. Testar /hotels
echo "3. Listando hotéis..."
curl -s -X GET "http://localhost:8000/hotels" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python -m json.tool
echo ""

echo "=== Teste Completo! ==="
