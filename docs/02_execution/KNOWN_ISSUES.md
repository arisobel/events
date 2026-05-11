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

### Status: ℹ️ **OBSERVATION**

### Context
- O MVP agora expõe `Guest` individual e liderança de grupo na UI principal
- `Reservation` continua no nível do grupo, com `f_total_guests` mantido de forma explícita

### Current Behavior
- Operadores podem cadastrar hóspedes individuais dentro do grupo
- Operadores podem informar `f_total_guests` na reserva
- Ainda não existe regra automática de sincronismo entre esses dois valores

### Impact
- O fluxo principal funciona
- Pode haver divergência intencional ou acidental entre composição do grupo e ocupação reservada

### Next Decision Needed
- Definir se `f_total_guests` continuará manual
- Definir se o sistema passará a sugerir ou sincronizar automaticamente esse valor

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
ℹ️ Próxima discussão funcional relevante: política entre hóspedes cadastrados e quantidade total reservada

---

## Update Policy

- registrar apenas problemas verificados
- mover para resolvido assim que houver correção validada
- usar backlog para melhorias e expansão, não para bugs
