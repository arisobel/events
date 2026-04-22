#!/bin/bash

echo "🔓 Tornando portas públicas no GitHub Codespaces..."

# Obter o nome do codespace atual
CURRENT_CODESPACE=$(gh codespace list --json name | jq -r '.[0].name')

if [ -z "$CURRENT_CODESPACE" ]; then
    echo "❌ Erro: Não foi possível detectar o codespace atual"
    exit 1
fi

echo "📍 Codespace: $CURRENT_CODESPACE"

# Tornar portas públicas
echo "🔓 Tornando porta 8000 (backend) pública..."
gh codespace ports visibility 8000:public -c "$CURRENT_CODESPACE" 2>&1

echo "🔓 Tornando porta 5173 (frontend) pública..."
gh codespace ports visibility 5173:public -c "$CURRENT_CODESPACE" 2>&1

echo "✅ Portas configuradas!"
echo ""
echo "🌐 URLs:"
echo "Frontend: https://symmetrical-space-orbit-7v97p96xxp9fp744-5173.app.github.dev"
echo "Backend:  https://symmetrical-space-orbit-7v97p96xxp9fp744-8000.app.github.dev"
