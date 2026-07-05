# Project Progress

## Current State

- **Phase**: Phase 1 - Core Backend + Internal MVP Slice ✅ **IMPLEMENTADO** | Financeiro Backend Phase 1 ✅
- **Last Update**: 02 de Julho de 2026 - Módulo Financeiro Backend Phase 1 implementado
- **Status**: Fluxo core disponível na UI: Hotels → Events → Guests/Reservations → Room Allocations → Tasks
- **Environment**: GitHub Codespaces + Docker
- **Recent**: Módulo `finance` criado — precificação de quartos, pagamento por reserva, endpoints room-grid / financial-summary / invoice (migration `9d2f5c1e7a34`)
- **Current Product Boundary**: operação de hóspedes agora combina `GuestGroup + Guest`; `Reservation` permanece vinculada ao grupo e agora carrega dados financeiros
- **Deployment State**: CapRover pronto para deploy — arquivos de infra criados; validação em staging pendente

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
- [x] Runbook inicial de deploy CapRover criado em `docs/04_technical/DEPLOYMENT_CAPROVER.md`
- [x] Script `deploy-caprover.ps1` criado para gerar pacote `.tar` timestampado em `/dist`
- [x] **CapRover production deploy implementado** — ver seção abaixo

---

### UX: Sequência de Quartos, Sidebar Mobile e Labels (2026-07-03)
- [x] `HotelsPage`: botão "🔁 Sequence" por quarto — duplica o quarto selecionado, incrementa o número por um step configurável e gera de 1 a 50 quartos de uma vez (prévia dos números antes de confirmar)
- [x] `HotelsPage`: componente `Field` — label discreto acima do input nos formulários de hotel e quarto (placeholder deixa de ser a única pista do campo depois de preenchido)
- [x] `AdminLayout`: sidebar retrátil no mobile — vira drawer com hambúrguer, overlay e fecha ao navegar; desktop inalterado
- [ ] Mesmo padrão de labels ainda não aplicado nas demais páginas (Events, Guests, Rooms, Tasks, RoomGrid) — mesmo problema existe lá

---

### Pacote Feedback do Grid (2026-07-03)
- [x] **Edição de evento**: `EventUpdate` completo (datas, tipo, families, entry default) + validação de datas + UI na EventsPage
- [x] **Evento de entrada padrão**: `f_is_entry_default` exclusivo + redirect de entrada (flag → evento em curso → lista); destino room-grid durante o evento, guests fora dele
- [x] **Preço por Evento × Quarto**: `t_event_room_price` com fallback ao preço base; grid/extrato usam preço efetivo; UI clicando no quarto no Room Grid
- [x] Migration `b7e3a9c4d512`; suíte total: 28 testes verdes
- [ ] Backlog estruturado: períodos+hebcal no grid; atribuição pessoa→quarto

---

### Grade Visual de Quartos — RoomGridPage (2026-07-02)
- [x] `financeService` no frontend (`getRoomGrid`, `getFinancialSummary`) + tipos do módulo finance
- [x] `RoomGridPage` em `/events/{id}/room-grid` — linhas = quartos, colunas = noites do evento
- [x] Coluna HOJE destacada; barras coloridas por status de pagamento (verde pago / âmbar parcial / vermelho pendente); ✓ = check-in feito
- [x] Cards de resumo: ocupação %, receita esperada/recebida/pendente
- [x] Clique na barra → painel de detalhe com troca de quarto/datas/check-in (`PUT /room-allocations`)
- [x] Clique em célula livre → criar alocação para reserva existente naquele quarto/data
- [x] Navegação: botão "📅 Room Grid" na EventsPage e RoomsPage
- [ ] Pendente: validação do build no Codespaces (node indisponível na estação local)

---

### Edição de Hotéis e Quartos (2026-07-02)
- [x] `HotelUpdate` expandido — agora edita documento, telefone, email, endereço, cidade, estado, país e notas (antes só nome/trade/phone/email/active)
- [x] `HotelRoomUpdate` expandido — número, tipo, rótulo comercial, andar, bloco, capacidade, preço/noite, status e notas
- [x] Service `update_hotel_room` + rota `PUT /hotels/{hotel_id}/rooms/{room_id}` (não existia edição de quarto)
- [x] Frontend `hotelService.updateHotel` e `updateHotelRoom`
- [x] `HotelsPage` com edição de hotel e quarto reutilizando os formulários; campo de **preço/noite** e **rótulo comercial** agora editáveis na UI (destrava a precificação do módulo financeiro)
- [x] 6 testes novos em `tests/test_hotel_edit.py`

---

### Módulo Financeiro — Backend Phase 1 (2026-07-02)
- [x] `HotelRoom.f_price_per_night` e `HotelRoom.f_room_type_label` (modelo + schemas + migration)
- [x] `Reservation.f_amount_total`, `f_amount_paid`, `f_payment_status` (pending/partial/paid), `f_payment_notes`
- [x] Migration Alembic `9d2f5c1e7a34`
- [x] Novo módulo `app/modules/finance` (schemas + service + router, sem models próprios)
- [x] `GET /events/{id}/room-grid` — quartos do hotel × alocações com grupo e status financeiro
- [x] `GET /events/{id}/financial-summary` — receita esperada/recebida/pendente, ocupação %, contagem por status
- [x] `GET /events/{event_id}/groups/{group_id}/invoice` — extrato por família com linhas por alocação, noites, subtotais e saldo
- [x] 7 testes novos em `tests/test_finance.py` — suíte total: 16 verdes

---

## In Progress 🚧

### CapRover Deployment — Infra Implementada (2026-06-30)
- [x] Mapear estado atual de `captain-definition`, `backend/Dockerfile`, `docker-compose.yml` e frontend Vite
- [x] Documentar topologia alvo para CapRover em apps separados
- [x] Documentar variáveis de ambiente e checklist de readiness
- [x] Implementar empacotamento local via `deploy-caprover.ps1`
- [x] `Dockerfile` na raiz — backend produção com caminhos corretos para contexto CapRover, sem `--reload`, migrations automáticas no startup
- [x] `captain-definition` na raiz — aponta para `./Dockerfile` (app `events-api`)
- [x] `frontend/Dockerfile` — multi-stage: build Node + serve Nginx com SPA fallback
- [x] `frontend/nginx.conf` — SPA fallback para React Router, cache headers para assets
- [x] `frontend/captain-definition` — aponta para `./frontend/Dockerfile` (app `events-web`)
- [x] `build.ps1` — substitui `deploy-caprover.ps1` com suporte a `-Target api|web`, mantém últimos 5 tarballs em `/dist/`
- [x] CORS corrigido em `backend/app/main.py` — usa `settings.CORS_ORIGINS` (env var) + regex Codespaces; era hardcoded para Codespaces only
- [x] `VITE_API_URL` adicionado em `frontend/src/services/api.ts` — checado antes de qualquer detecção de hostname
- [ ] Criar apps no CapRover (events-postgres, events-api, events-web)
- [ ] Configurar variáveis de ambiente no CapRover para events-api
- [ ] Validar deploy em staging CapRover
- [ ] Criar usuário admin de produção

**Status**: Arquivos de infra prontos; próximo passo é criar as apps no CapRover e executar o primeiro deploy

---

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

### Priority 1: Deploy CapRover
- [ ] Criar apps no CapRover: `events-postgres` (one-click), `events-api`, `events-web`
- [ ] Configurar env vars em `events-api` (DATABASE_URL, SECRET_KEY, CORS_ORIGINS, DEBUG)
- [ ] Configurar VITE_API_URL como build arg no app `events-web`
- [ ] Rodar `.\build.ps1 -Target api` e fazer upload do tarball para `events-api`
- [ ] Rodar `.\build.ps1 -Target web` e fazer upload do tarball para `events-web`
- [ ] Validar `/health` na API e fluxo de login no frontend

### Priority 2: CI + Integração
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
- ⚠️ Deploy CapRover ainda não foi validado em staging — arquivos prontos, mas o primeiro deploy real ainda não ocorreu
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
- Backend automated tests: **28 passing**
- Frontend build: **passing** (validado por último em Codespaces; node/docker indisponíveis na estação Windows atual)

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
