# Project Progress

## Current State

- **Phase**: Phase 1 - Core Backend + Internal MVP Slice ✅ **IMPLEMENTADO**
- **Last Update**: 10 de Maio de 2026 - próxima fase do módulo Guests definida em documentação
- **Status**: Fluxo core disponível na UI: Hotels → Events → Guests/Reservations → Room Allocations → Tasks
- **Environment**: GitHub Codespaces + Docker
- **Recent**: Módulos Guests/Rooms fechados, frontend expandido e base de testes automatizados criada
- **Current Product Boundary**: operação de hóspedes ainda é centrada em `GuestGroup`; `Guest` individual existe no domínio, mas ainda não está exposto na UI/API principal do MVP

---

## Completed ✅

### Backend Modules (6/6 Phase 1)
- [x] **Auth Module** - JWT authentication, registro, login completo
- [x] **Hotel Module** - CRUD de hotéis, espaços e quartos
- [x] **Events Module** - CRUD completo de eventos
- [x] **Guests Module** - grupos, reservas, leitura e atualização
- [x] **Rooms Module** - alocação de quartos, leitura, atualização e validação de conflito
- [x] **Tasks Module** - CRUD + status tracking + comentários

### Frontend MVP Surface
- [x] **LoginPage** - autenticação funcional
- [x] **HotelsPage** - lista hotéis + criação de hotel + criação de quartos
- [x] **EventsPage** - lista eventos + criação de evento + navegação por evento
- [x] **GuestsPage** - grupos, reservas e edição básica
- [x] **RoomsPage** - alocação de quartos e edição básica
- [x] **TasksPage** - CRUD de tasks com filtros por status e prioridade

### MVP Internal Flow
- [x] Login funcional
- [x] Criar hotel pela UI
- [x] Criar quarto pela UI
- [x] Criar evento pela UI
- [x] Criar grupo de hóspedes
- [x] Criar reserva por grupo
- [x] Alocar quarto para reserva
- [x] Navegar para tasks do evento e operar o fluxo

### Validation
- [x] `pytest backend/tests` com 6 testes verdes
- [x] `npm run build` do frontend sem erros
- [x] Fluxo de autenticação coberto por testes automatizados
- [x] Fluxo mínimo de ocupação coberto por testes automatizados
- [x] Sanity do módulo de tasks coberto por testes automatizados

### Documentation & Cleanup
- [x] README/SETUP atualizados para o fluxo MVP
- [x] Docs vivos atualizados para refletir o MVP interno
- [x] Stub legado removido: `/backend/app/api/routes/hotel.py`

---

## In Progress 🚧

### Guest Module Expansion Planning
- [x] Confirmar que `GuestGroup` permanece como unidade operacional do MVP
- [x] Registrar que `Guest` individual será a próxima subentidade a ser aberta
- [ ] Detalhar contrato de `Guest` no backend (CRUD básico + líder do grupo)
- [ ] Detalhar superfície mínima do frontend para gerir hóspedes dentro do grupo
- [ ] Definir testes mínimos da expansão sem quebrar o fluxo atual

**Status**: Direção funcional definida; implementação prática ainda não iniciada

---

### MVP Hardening
- [ ] Adicionar testes HTTP/integration em cima da aplicação ASGI
- [ ] Capturar screenshots reais do fluxo MVP
- [ ] Refinar UX de detalhes de hotel e visualização de ocupação

**Status**: Base funcional pronta; endurecimento e evidência visual pendentes

---

## Next Actions (Short Horizon) 📋

### Priority 1: Group -> Guest Expansion
- [ ] Formalizar `Guest` como subentidade de `GuestGroup`
- [ ] Permitir cadastro individual de hóspedes dentro do grupo
- [ ] Adicionar atributo/campo de líder do grupo em vez de depender de observação textual
- [ ] Manter `Reservation` vinculada ao grupo, não ao hóspede individual
- [ ] Desenhar navegação mínima: grupo -> hóspedes -> reserva -> alocação

### Priority 2: CI + Integração
- [ ] Configurar GitHub Actions para `pytest` + `npm run build`
- [ ] Adicionar testes API-level para rotas críticas do MVP
- [ ] Documentar troubleshooting dos testes de integração

### Priority 3: Validation Package
- [ ] Capturar screenshots em `docs/03_validation/screenshots/`
- [ ] Criar relatório de validação do MVP interno
- [ ] Validar fluxo completo em Codespaces de ponta a ponta

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
- ⚠️ Gestão individual de hóspedes ainda depende de convenções textuais em notas/observações quando o operador precisa registrar líder ou composição do grupo

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
- [ ] Fechar lacuna entre `GuestGroup` operacional e `Guest` individual persistido no domínio

### Low Priority
- [ ] Métricas
- [ ] Health checks mais ricos
- [ ] Caching estratégico

---

## Metrics

### Verification
- Backend automated tests: **6 passing**
- Frontend build: **passing**

### Module Completion
- Phase 0 (Bootstrap): **100%** ✅
- Phase 1 (Core Backend): **100%** ✅

### Features Delivered
- Autenticação: ✅ 100%
- Gestão de Hotéis: ✅ 100%
- Gestão de Eventos: ✅ 100%
- Gestão de Hóspedes/Reservas: ✅ MVP
- Gestão de Hóspedes Individuais: ⏳ Planejada
- Alocação de Quartos: ✅ MVP
- Gestão de Tasks: ✅ 100%

---

## Notes

- O projeto já está além de POC e hoje se posiciona como **MVP interno enxuto**
- O coração do produto agora está funcional: operação + reservas + alocação + tasks
- Próximo marco recomendado: expandir o módulo Guests de `Group` para `Group + Guest` sem quebrar o fluxo operacional atual
- Após essa expansão, o próximo foco volta para endurecimento de integração automatizada e pacote de validação/piloto
