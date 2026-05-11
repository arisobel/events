#!/usr/bin/env bash

set -euo pipefail

echo "🔓 Tornando portas públicas no GitHub Codespaces..."

if ! command -v gh >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
    echo "⚠️ gh/jq não estão disponíveis; publique as portas manualmente pela aba PORTS."
    exit 0
fi

CURRENT_CODESPACE="${CODESPACE_NAME:-}"
if [ -z "$CURRENT_CODESPACE" ]; then
    CURRENT_CODESPACE=$(gh codespace list --json name | jq -r '.[0].name')
fi

if [ -z "$CURRENT_CODESPACE" ] || [ "$CURRENT_CODESPACE" = "null" ]; then
    echo "⚠️ Não foi possível detectar o codespace atual."
    exit 0
fi

echo "📍 Codespace: $CURRENT_CODESPACE"

set_port_public() {
    local port="$1"
    local label="$2"

    echo "🔓 Tornando porta $port ($label) pública..."
    for _ in $(seq 1 5); do
        if gh codespace ports visibility "$port:public" -c "$CURRENT_CODESPACE" >/dev/null 2>&1; then
            echo "✅ Porta $port publicada"
            return 0
        fi
        sleep 2
    done

    echo "⚠️ Não foi possível publicar automaticamente a porta $port. Use a aba PORTS do Codespaces se necessário."
    return 0
}

set_port_public 8000 "backend"
set_port_public 5173 "frontend"

echo "✅ Portas processadas!"
echo ""
echo "🌐 URLs esperadas:"
echo "Frontend: https://${CURRENT_CODESPACE}-5173.app.github.dev"
echo "Backend:  https://${CURRENT_CODESPACE}-8000.app.github.dev"
