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

## 👥 Individual Guest Management Not Yet Exposed

### Status: ℹ️ **KNOWN LIMITATION**

### Problem
- O domínio já possui entidade `Guest`, mas a superfície principal do MVP ainda opera apenas com `GuestGroup` + `Reservation`
- Operadores conseguem registrar quantidade total de hóspedes, mas não conseguem cadastrar formalmente os membros do grupo
- Informações como líder do grupo acabam indo para `notes`/`observações`

### Impact
- Fluxo operacional principal continua funcionando
- Estrutura detalhada de composição do grupo ainda fica implícita
- Não há liderança de grupo estruturada na UI atual

### Planned Resolution
- Expandir `GuestsPage` para incluir CRUD de hóspedes individuais
- Adicionar campo/regra de líder do grupo
- Preservar `Reservation` no nível do grupo

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
ℹ️ Lacuna atual de hóspedes individuais tratada como evolução funcional planejada, não bug

---

## Update Policy

- registrar apenas problemas verificados
- mover para resolvido assim que houver correção validada
- usar backlog para melhorias e expansão, não para bugs
