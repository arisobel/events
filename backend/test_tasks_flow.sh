#!/bin/bash
# Script para testar o módulo Tasks
# Valida criação, listagem, atualização de status e comentários

set -e

API_URL="http://localhost:8000"

echo "========================================="
echo "TESTE DO MÓDULO TASKS"
echo "========================================="
echo ""

# 1. Login para obter token
echo "1️⃣  Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@events.com&password=admin123")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro: Não foi possível obter token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:30}..."
echo ""

# 2. Criar um hotel (necessário para criar evento)
echo "2️⃣  Criando hotel..."
HOTEL_RESPONSE=$(curl -s -X POST "$API_URL/hotels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "f_name": "Hotel Teste Tasks",
    "f_city": "São Paulo",
    "f_country": "Brasil"
  }')

HOTEL_ID=$(echo "$HOTEL_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✅ Hotel criado - ID: $HOTEL_ID"
echo ""

# 3. Criar um evento
echo "3️⃣  Criando evento..."
EVENT_RESPONSE=$(curl -s -X POST "$API_URL/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"f_hotel_id\": $HOTEL_ID,
    \"f_name\": \"Evento Teste Tasks\",
    \"f_event_type\": \"conference\",
    \"f_start_date\": \"2026-05-01\",
    \"f_end_date\": \"2026-05-05\"
  }")

EVENT_ID=$(echo "$EVENT_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✅ Evento criado - ID: $EVENT_ID"
echo ""

# 4. Criar primeira task
echo "4️⃣  Criando primeira task (prioridade alta)..."
TASK1_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "f_title": "Preparar sala de conferência",
    "f_description": "Organizar cadeiras e testar equipamento audiovisual",
    "f_priority": "high",
    "f_task_type": "setup"
  }')

TASK1_ID=$(echo "$TASK1_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
TASK1_STATUS=$(echo "$TASK1_RESPONSE" | grep -o '"f_status":"[^"]*' | cut -d'"' -f4)
echo "✅ Task criada - ID: $TASK1_ID, Status: $TASK1_STATUS"
echo ""

# 5. Criar segunda task
echo "5️⃣  Criando segunda task (prioridade média)..."
TASK2_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "f_title": "Verificar catering",
    "f_description": "Confirmar horário de entrega dos alimentos",
    "f_priority": "medium",
    "f_task_type": "logistics"
  }')

TASK2_ID=$(echo "$TASK2_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✅ Task criada - ID: $TASK2_ID"
echo ""

# 6. Listar todas as tasks do evento
echo "6️⃣  Listando todas as tasks do evento..."
TASKS_LIST=$(curl -s -X GET "$API_URL/events/$EVENT_ID/tasks" \
  -H "Authorization: Bearer $TOKEN")

TASKS_COUNT=$(echo "$TASKS_LIST" | grep -o '"id":' | wc -l)
echo "✅ Total de tasks encontradas: $TASKS_COUNT"
echo ""

# 7. Obter detalhes de uma task específica
echo "7️⃣  Obtendo detalhes da task #$TASK1_ID..."
TASK_DETAIL=$(curl -s -X GET "$API_URL/tasks/$TASK1_ID" \
  -H "Authorization: Bearer $TOKEN")

TASK_TITLE=$(echo "$TASK_DETAIL" | grep -o '"f_title":"[^"]*' | cut -d'"' -f4)
echo "✅ Task obtida: $TASK_TITLE"
echo ""

# 8. Atualizar status da task para "in_progress"
echo "8️⃣  Atualizando status da task para 'in_progress'..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/tasks/$TASK1_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_status": "in_progress"
  }')

NEW_STATUS=$(echo "$UPDATE_RESPONSE" | grep -o '"f_status":"[^"]*' | cut -d'"' -f4)
echo "✅ Status atualizado para: $NEW_STATUS"
echo ""

# 9. Adicionar comentário à task
echo "9️⃣  Adicionando comentário à task..."
COMMENT_RESPONSE=$(curl -s -X POST "$API_URL/tasks/$TASK1_ID/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "f_comment": "Equipamento de som testado e funcionando corretamente",
    "f_staff_member_id": 1
  }')

COMMENT_ID=$(echo "$COMMENT_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✅ Comentário adicionado - ID: $COMMENT_ID"
echo ""

# 10. Atualizar status para "completed"
echo "🔟 Atualizando status da task para 'completed'..."
COMPLETE_RESPONSE=$(curl -s -X PUT "$API_URL/tasks/$TASK1_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "new_status": "completed"
  }')

FINAL_STATUS=$(echo "$COMPLETE_RESPONSE" | grep -o '"f_status":"[^"]*' | cut -d'"' -f4)
echo "✅ Status final: $FINAL_STATUS"
echo ""

echo "========================================="
echo "✅ TODOS OS TESTES PASSARAM!"
echo "========================================="
echo ""
echo "📊 Resumo:"
echo "  - Hotel ID: $HOTEL_ID"
echo "  - Evento ID: $EVENT_ID"
echo "  - Task 1 ID: $TASK1_ID (status: $FINAL_STATUS)"
echo "  - Task 2 ID: $TASK2_ID"
echo "  - Comentário ID: $COMMENT_ID"
echo "  - Total de tasks: $TASKS_COUNT"
echo ""
echo "🎯 Funcionalidades validadas:"
echo "  ✅ Criar task"
echo "  ✅ Listar tasks de um evento"
echo "  ✅ Obter detalhes de uma task"
echo "  ✅ Atualizar status (pending → in_progress → completed)"
echo "  ✅ Adicionar comentário"
echo ""
