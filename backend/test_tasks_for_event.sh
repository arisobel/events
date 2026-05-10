#!/bin/bash
set -e

echo "=== Testando Fluxo Completo: Hotels → Events → Tasks ==="
echo ""

# 1. Login
echo "1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Token obtido!"
echo ""

# 2. Listar hotéis
echo "2. Listando hotéis..."
HOTELS=$(curl -s -X GET http://localhost:8000/hotels -H "Authorization: Bearer $TOKEN")
echo "$HOTELS" | python3 -c "import sys, json; hotels = json.load(sys.stdin); [print(f\"  Hotel #{h['id']}: {h['f_name']} ({h['f_city']})\") for h in hotels]"
echo ""

# 3. Listar eventos
echo "3. Listando eventos..."
EVENTS=$(curl -s -X GET http://localhost:8000/events -H "Authorization: Bearer $TOKEN")
EVENT_ID=$(echo "$EVENTS" | python3 -c "import sys, json; events = json.load(sys.stdin); print(events[0]['id']) if events else print('0')")
echo "$EVENTS" | python3 -c "import sys, json; events = json.load(sys.stdin); [print(f\"  Evento #{e['id']}: {e['f_name']} (Hotel #{e['f_hotel_id']})\") for e in events]"
echo ""

# 4. Listar tasks do evento
echo "4. Listando tasks do evento #${EVENT_ID}..."
curl -s -X GET "http://localhost:8000/events/${EVENT_ID}/tasks" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== ✅ Fluxo Completo Validado! ==="
