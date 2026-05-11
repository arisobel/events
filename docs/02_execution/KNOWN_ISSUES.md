# Known Issues

## 🔐 Login / CORS Issues (Codespaces)

### Status: ✅ **RESOLVED**

- Script `make_ports_public.sh` criado
- Frontend detecta URL do backend automaticamente
- Backend aceita origem de Codespaces via regex

---

## 🧪 HTTP Integration Test Harness

### Status: ⚠️ **ACTIVE ISSUE**

### Problem
- Os testes automatizados do MVP foram estabilizados no nível de serviço/dependency
- O harness HTTP/ASGI para requests completas ainda não está confiável neste ambiente

### Impact
- Regras de negócio já estão cobertas
- Camada HTTP ainda precisa de cobertura automatizada dedicada

### Current Mitigation
- `pytest backend/tests` cobre auth, ocupação e tasks no backend
- `npm run build` valida a integridade do frontend

### Planned Resolution
- Investigar `TestClient` / `ASGITransport`
- Adicionar testes API-level assim que o harness estiver estável

---

## 👥 Guest Count vs Reservation Count

### Status: ℹ️ **RULE DEFINED / NOT IMPLEMENTED**

### Context
- O MVP agora expõe `Guest` individual e liderança de grupo na UI principal
- `Reservation` continua no nível do grupo, com `f_total_guests` mantido de forma explícita

### Current Behavior
- Operadores podem cadastrar hóspedes individuais dentro do grupo
- Operadores podem informar `f_total_guests` na reserva
- Ainda não existe implementação da regra escolhida entre esses dois valores

### Defined Rule
- `f_total_guests` deve ser maior ou igual ao número de hóspedes cadastrados
- Se `f_total_guests < hóspedes cadastrados`, o sistema deve sinalizar inconsistência
- A inconsistência não deve bloquear cadastro ou edição

### Impact
- O fluxo principal funciona
- Pode haver divergência intencional ou acidental entre composição do grupo e ocupação reservada

### Planned Resolution
- Adicionar warning visual e/ou de validação não-bloqueante
- Implementar essa checagem na UI e no backend
- Manter `f_total_guests` como campo explícito da reserva

---

## 🧾 Guest Field Standardization

### Status: ℹ️ **RULE DEFINED / NOT IMPLEMENTED**

### Current Behavior
- `Gender` ainda aceita texto livre
- `GuestType` ainda aceita texto livre

### Defined Rule
- `Gender` deve usar enum controlado
- `GuestType` deve usar enum controlado com `adult`, `child`, `infant`, `staff`
- `leader` não entra em `GuestType`; liderança continua separada via `f_is_group_leader`

### Planned Resolution
- Trocar inputs livres por selects
- Validar enums no backend
- Alinhar tipos frontend/backend/testes com os mesmos valores

---

## 📸 Documentation Screenshots

### Status: ⏳ **PENDING (Manual Action)**

### Missing
- login_page.png
- hotels_list.png
- events_list.png
- guests_page.png
- rooms_page.png
- tasks_page.png
- backend_docs.png

### Action Required
- Capturar screenshots reais durante uso do sistema
- Adicionar em `/docs/03_validation/screenshots/`

---

## 🚫 No Functional Blockers

✅ Fluxo MVP interno implementado  
✅ Guests/Reservations/Room Allocations funcionando  
✅ Zero bugs críticos conhecidos no fluxo principal
ℹ️ Próxima implementação funcional relevante: warning de inconsistência e enums controlados no módulo Guests

---

## Update Policy

- registrar apenas problemas verificados
- mover para resolvido assim que houver correção validada
- usar backlog para melhorias e expansão, não para bugs
