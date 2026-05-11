# Project Progress

## Current State

- **Phase**: Phase 1 - Core Backend + Internal MVP Slice ✅ **IMPLEMENTADO**
- **Last Update**: 11 de Maio de 2026 - critérios pré-desenvolvimento definidos para consistência e enums do módulo Guests
- **Status**: Fluxo core disponível na UI: Hotels → Events → Guests/Reservations → Room Allocations → Tasks
- **Environment**: GitHub Codespaces + Docker
- **Recent**: Gestão individual de hóspedes adicionada ao backend, frontend e testes
- **Current Product Boundary**: operação de hóspedes agora combina `GuestGroup + Guest`; `Reservation` permanece vinculada ao grupo

---

## Completed ✅

### Backend Modules (6/6 Phase 1)
- [x] **Auth Module** - JWT authentication, registro, login completo
- [x] **Hotel Module** - CRUD de hotéis, espaços e quartos
- [x] **Events Module** - CRUD completo de eventos
- [x] **Guests Module** - grupos, hóspedes individuais, líder do grupo, reservas, leitura e atualização
- [x] **Rooms Module** - alocação de quartos, leitura, atualização e validação de conflito
- [x] **Tasks Module** - CRUD + status tracking + comentários

### Frontend MVP Surface
- [x] **LoginPage** - autenticação funcional
- [x] **HotelsPage** - lista hotéis + criação de hotel + criação de quartos
- [x] **EventsPage** - lista eventos + criação de evento + navegação por evento
- [x] **GuestsPage** - grupos, hóspedes individuais, líder do grupo, reservas e edição básica
- [x] **RoomsPage** - alocação de quartos e edição básica
- [x] **TasksPage** - CRUD de tasks com filtros por status e prioridade

### MVP Internal Flow
- [x] Login funcional
- [x] Criar hotel pela UI
- [x] Criar quarto pela UI
- [x] Criar evento pela UI
- [x] Criar grupo de hóspedes
- [x] Cadastrar hóspedes individuais dentro do grupo
- [x] Definir líder do grupo de forma estruturada
- [x] Criar reserva por grupo
- [x] Alocar quarto para reserva
- [x] Navegar para tasks do evento e operar o fluxo

### Validation
- [x] `pytest backend/tests` com 7 testes verdes
- [x] `npm run build` do frontend sem erros
- [x] Fluxo de autenticação coberto por testes automatizados
- [x] Fluxo mínimo de ocupação coberto por testes automatizados
- [x] Fluxo de hóspedes individuais e liderança coberto por testes automatizados
- [x] Sanity do módulo de tasks coberto por testes automatizados

### Documentation & Cleanup
- [x] README/SETUP atualizados para o fluxo MVP
- [x] Docs vivos atualizados para refletir o MVP interno
- [x] Stub legado removido: `/backend/app/api/routes/hotel.py`

---

## In Progress 🚧

### Guest Rules Pre-Development
- [x] Definir regra de consistência entre `f_total_guests` e hóspedes cadastrados
- [x] Escolher abordagem não-bloqueante para inconsistência
- [x] Definir que `Gender` e `GuestType` passam a usar enums controlados
- [x] Incluir `staff` em `GuestType`
- [ ] Implementar warning visual e validação correspondente
- [ ] Implementar enums na UI/API do módulo Guests

**Status**: Critérios funcionais definidos; implementação ainda não iniciada

---

### MVP Hardening
- [ ] Adicionar testes HTTP/integration em cima da aplicação ASGI
- [ ] Capturar screenshots reais do fluxo MVP
- [ ] Refinar UX de detalhes de hotel e visualização de ocupação

**Status**: Base funcional pronta; endurecimento e evidência visual pendentes

---

## Next Actions (Short Horizon) 📋

### Priority 1: CI + Integração
- [ ] Configurar GitHub Actions para `pytest` + `npm run build`
- [ ] Adicionar testes API-level para rotas críticas do MVP
- [ ] Documentar troubleshooting dos testes de integração

### Priority 2: Validation Package
- [ ] Capturar screenshots em `docs/03_validation/screenshots/`
- [ ] Criar relatório de validação do MVP interno
- [ ] Validar fluxo completo em Codespaces de ponta a ponta

### Priority 3: Guest Flow Refinement
- [x] Revisar consistência entre `group.guests.length` e `reservation.f_total_guests`
- [ ] Implementar warning quando `reservation.f_total_guests < group.guests.length`
- [ ] Trocar `Gender` e `GuestType` por enums controlados
- [ ] Decidir se check-in futuro será no nível do hóspede, do grupo ou híbrido
- [ ] Melhorar visualização do líder do grupo e composição do grupo na UI

### Priority 4: UX Polish
- [ ] Implementar `HotelDetailPage.tsx`
- [ ] Exibir quartos/espaços de hotel com navegação mais clara
- [ ] Melhorar contexto visual entre reservas e alocações

---

## Risks / Blockers

### Active
- ⚠️ Não há bloqueadores funcionais ativos para o MVP interno

### Residual Risks
- ⚠️ Testes automatizados atuais estão no nível de serviço/dependency; cobertura HTTP ainda não foi estabilizada
- ⚠️ Evidência visual do fluxo (screenshots) ainda está pendente
- ⚠️ A regra entre número de hóspedes cadastrados e `f_total_guests` já foi decidida, mas ainda não foi implementada
- ⚠️ `Gender` e `GuestType` ainda estão livres na UI atual, sem enum controlado

---

## Technical Debt

### High Priority
- [ ] CI/CD básico
- [ ] Cobertura HTTP/integration
- [ ] Logging estruturado

### Medium Priority
- [ ] Melhorar validação de input e mensagens de erro
- [ ] Melhorar navegação contextual do frontend
- [ ] Revisar warnings de deprecação em datetime/SQLAlchemy

### Low Priority
- [ ] Métricas
- [ ] Health checks mais ricos
- [ ] Caching estratégico

---

## Metrics

### Verification
- Backend automated tests: **7 passing**
- Frontend build: **passing**

### Module Completion
- Phase 0 (Bootstrap): **100%** ✅
- Phase 1 (Core Backend): **100%** ✅

### Features Delivered
- Autenticação: ✅ 100%
- Gestão de Hotéis: ✅ 100%
- Gestão de Eventos: ✅ 100%
- Gestão de Hóspedes/Reservas: ✅ MVP
- Gestão de Hóspedes Individuais: ✅ MVP
- Alocação de Quartos: ✅ MVP
- Gestão de Tasks: ✅ 100%

---

## Notes

- O projeto já está além de POC e hoje se posiciona como **MVP interno enxuto**
- O coração do produto agora está funcional: operação + reservas + alocação + tasks
- O módulo Guests agora cobre `Group + Guest`, mantendo `Reservation` no nível do grupo
- Próximo foco recomendado: implementar a regra de consistência não-bloqueante e os enums controlados do módulo Guests
- Em paralelo, o projeto segue com necessidades de endurecimento de integração automatizada e pacote de validação
