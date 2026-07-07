# Project Progress

## Current State

- **Phase**: Phase 1 - Core Backend + Internal MVP Slice ✅ **IMPLEMENTADO** | Financeiro Backend Phase 1 ✅
- **Last Update**: 07 de Julho de 2026 - Decisão estrutural Facilities + Staff registrada; Fatia 1 (Facilities) é a próxima implementação
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

### Cadastro Raiz de Clientes + Pessoas (2026-07-05) ⭐ ESTRUTURAL
> Escolha do usuário: modelo completo "Cliente + Pessoas" (entidade permanente + participação por evento)
- [x] Backend: novo módulo `clients` — `Client` (t_client) e `Person` (t_person), entidades raiz independentes de evento
- [x] FKs opcionais incrementais: `GuestGroup.f_client_id` e `Guest.f_person_id` (nada existente quebra); migration `e1b9c3f5a7d2`
- [x] Service/endpoints: CRUD de clientes e pessoas; `GET /clients/{id}/events` (participações via grupos ligados); `POST /clients/{id}/import-to-event/{event_id}` (cria grupo no evento a partir do cliente, copiando pessoas → hóspedes com `f_person_id` e titular → líder)
- [x] Nacionalidade do cliente reaproveita a bandeira; delete de cliente **desvincula** grupos/hóspedes em vez de apagá-los
- [x] 5 testes novos (`test_clients.py`): CRUD cliente/pessoa, normalização, import cria grupo+hóspedes, delete desvincula; suíte → ~40 esperado (validar no Codespaces)
- [x] Frontend: `clientService` + tipos; **link "Clientes" na sidebar** (ao lado de Hotels/Events); rota `/clients`; `ClientsPage` (busca, CRUD cliente, CRUD pessoas, lista de eventos participados)
- [x] **Ligação bidirecional (2026-07-05)**: "Importar de cliente" na GuestsPage (picker com busca + bandeira) cria grupo a partir do cliente; "★ Salvar como cliente" promove um grupo existente ao cadastro raiz (popula o registro a partir do que já existe). Endpoint novo `POST /clients/from-group/{group_id}`; badge "Cliente ✓" no grupo vinculado; `f_client_id`/`f_person_id` expostos nas respostas. +1 teste (suíte → ~41)
- ⓘ Conceito registrado: Cliente ≠ Grupo (participação por evento). Tabelas separadas e ligadas, não fundidas — preserva composição/datas/preços que mudam por evento. Fluxo dos dois sentidos, sem forçar client-first.

---

### Módulo Cronograma (Schedule) — Fatia 1 (2026-07-06) ⭐ ESTRUTURAL
> Backbone do App do Hóspede e dos Displays de TV. Modelo calibrado pelo programa impresso real de Pessach enviado pelo Michel (colunas = dias c/ Yom Tov/Chol Hamoed/Shabat; linhas = atividades com hora/título/local; cor por categoria).
- [x] **Backend** `schedule`: modelo `Activity` (t_activity) — título, tipo, público, local, `f_date` + `f_start_time`/`f_end_time` ("HH:MM"), descrição, sort; migration `a3d9e5c7b410`
- [x] Tipos derivados do doc real: **religioso** (marrom), **refeicao** (verde), **infantil** (laranja), **palestra** (bege), **entretenimento**, **geral** — cores da UI batendo com o impresso
- [x] Público: all/men/women/children/**youth** (Jovens); filtro por público inclui automaticamente os marcados 'all'
- [x] CRUD `GET/POST /events/{id}/activities`, `PUT/DELETE /activities/{id}` com filtros day/type/audience; validação HH:MM no schema (Literal p/ tipo e público)
- [x] **Frontend** `SchedulePage`: abas por dia (colunas do programa), lista por horário colorida por tipo, criar/editar/excluir; botão "Cronograma" na nav de Guests/Rooms/Tasks; rota `/events/:id/schedule`
- [x] Testes `test_schedule.py`: CRUD, ordenação por horário, filtro dia/tipo, filtro de público incluindo 'all', rejeição de HH:MM inválido
- ⓘ Gestão do cronograma é **operacional** (não financeira): qualquer usuário ativo gerencia. Endpoints públicos (display/TV) e cabeçalho de períodos judaicos ficam para próximas fatias.

---

### Room Grid: dropdown de status agora read-only (2026-07-06)
- [x] Com status derivado + baixa pelo cliente, o dropdown manual de status virou redundante → trocado por **badge read-only** que exibe o status derivado ao vivo (pago vs. total), coerente com backend. Rótulo do botão ajustado para "Salvar hospedagem".

---

### RBAC — Papéis e Gating Financeiro (2026-07-06) ⭐
> 3 papéis: admin (tudo), gestor_financeiro (vê valores), gestor_campo (operação sem R$). Gate = "ver financeiro" (admin ou financeiro).
- [x] `require_financial_access` e `require_admin` (RoleChecker) já com base pronta (Role/UserRole/get_user_roles existiam)
- [x] **Seed no startup** (`ensure_rbac_seed`): cria os 3 papéis (idempotente) e promove o 1º usuário a admin no primeiro run — evita lockout ao ligar o gating
- [x] **Enforcement backend**: finance router **inteiro** gated (room-grid, summary, invoice, preços, extras, pagamentos); em clients, gated statement/open-reservations/ledger. RoleChecker consulta o **banco** (não o JWT) → token antigo do admin não trava
- [x] Endpoints admin: `GET /auth/users`, `GET /auth/roles`, `POST /auth/users`, `POST/DELETE /auth/users/{id}/roles/{role_id}` (todos admin-only)
- [x] **Frontend**: `AuthContext` expõe `hasRole/isAdmin/canSeeFinancials`; gate do bloco financeiro na GuestsPage, da conta corrente na ClientsPage, e da rota+botões do Room Grid (`RoleRoute access="financial"`); sidebar "Usuários" só admin; entrada por papel (campo não cai no room-grid)
- [x] **Página Usuários & Papéis** (`/admin/users`, admin-only): criar usuário, atribuir/remover papéis por toggle
- [x] 4 testes novos (`test_rbac.py`): seed+bootstrap, gate nega sem papel/permite com, admin bypassa, assign/remove
- ⓘ Usuário **sem papel** = campo-equivalente (opera, não vê R$). Papéis chegam no `/auth/me` e no JWT

---

### Baixa de pagamento pelo cliente (vincula crédito → reserva) (2026-07-05)
- [x] `GET /clients/{id}/open-reservations` — reservas do cliente com saldo em aberto (para o seletor)
- [x] Na conta corrente, o lançamento manual ganhou seletor **"Aplicar a (dar baixa)"**: um **crédito** vinculado a uma reserva vira **Payment na reserva** (via finance) em vez de ajuste avulso — dá baixa no evento, status deriva para pago/parcial e a grade reflete
- [x] Sem reserva selecionada (ou débito), continua como **ajuste avulso** (LedgerEntry manual). Botão vira "Registrar pagamento"; campo Descrição vira "Forma (PIX/dinheiro…)"
- ⓘ Resolve a inconsistência: crédito solto no cliente zerava o saldo mas não dava baixa no evento; agora dá. Créditos avulsos antigos podem ser reaplicados (excluir + relançar com o seletor)

---

### Fixes: 500 no extrato + status de pagamento derivado (2026-07-05)
- [x] **Bug 500 no `/clients/{id}/statement`**: o campo `date` do `StatementEntry` fazia **shadowing** do tipo `date` → Pydantic inferia `NoneType` e qualquer data real quebrava. Corrigido com alias `date as date_type` no annotation (chave JSON continua `date`). Reproduzido e validado com pydantic isolado.
- [x] **Grade vermelha apesar de pago parcial**: `f_payment_status` era manual e ficava "pending". Agora é **derivado ao vivo** (`_derive_payment_status`: pago vs. total geral) na **grade**, no **invoice** e no **financial-summary** — além de recalculado no `_recompute_amount_paid` ao registrar/excluir pagamento. Dados existentes passam a refletir sem re-tocar o pagamento.
- ⓘ Consequência: o dropdown manual de status no painel do Room Grid ficou **cosmético** (grade/invoice ignoram e derivam). Candidato a virar read-only ou sumir.

---

### Conta Corrente por Cliente — Extrato (2026-07-05) ⭐ ESTRUTURAL
> Escolha do usuário: modelo "Derivado + ajustes manuais"
- [x] Backend: `LedgerEntry` (t_ledger_entry) guarda só **ajustes manuais** (depósito, desconto, dívida antiga, multa); migration `f2c8a4e6b1d3`
- [x] `get_client_statement` **deriva** débitos (total geral das reservas) e créditos (pagamentos já registrados) reutilizando `finance.get_group_invoice` / `get_reservation_payments` — sem duplicar lógica nem digitar pagamento duas vezes; soma os ajustes manuais por cima
- [x] Saldo = créditos − débitos (negativo = cliente deve), **atravessando eventos**; entradas ordenadas por data com fonte (reservation/payment/manual)
- [x] Endpoints: `GET /clients/{id}/statement`, `POST/DELETE /clients/{id}/ledger-entries`; +2 testes (deriva reserva+pagamento+manual; CRUD manual)
- [x] Frontend: seção **"Conta corrente"** na ClientsPage (expandir cliente) — tabela do extrato (data/descrição/débito/crédito), resumo débitos/créditos/saldo, form de lançamento manual + excluir manual
- ⓘ Build/deploy agora no **CapRover** (não Codespaces); suíte total esperada ~43
- [ ] (Futuro) na ClientsPage, filtrar extrato por evento; exportar; e decidir sync de edição de Pessoa raiz

---

### Polish Mobile da GuestsPage (2026-07-05)
- [x] Barra de navegação do topo em **linha única** (← Events / Rooms / Tasks com scroll horizontal se preciso; nome do evento oculto no mobile via `hidden sm:inline`); botão "+ New Group" fixo à direita (`shrink-0`)
- [x] No mobile, botões de ação viram **ícones** (SVG inline, componentes `GroupIcon`/`PersonIcon`) e voltam a texto no desktop (`sm:inline`): **New Group** = grupo + "+"; **Edit group** = grupo; **+ Guest** = pessoa + "+"; **Delete** = lixeira. "+ Reservation" segue como texto
- ⓘ Ícones: o projeto **não usa lib de ícones** (nem FontAwesome/lucide/heroicons) — só emoji + SVG inline (paths do FA Free colados inline, sem instalar nada). Sugestão futura se quiser padronizar: `lucide-react`
- [x] Botões de controle do grupo (Edit group / + Guest / + Reservation / Delete) em **uma linha só** (`flex-nowrap overflow-x-auto`); **Delete virou ícone de lixeira** (SVG) para poupar espaço
- [x] Lista de hóspedes **colapsável no mobile**: "Guests (N)" virou botão de toggle (chevron ▸ só no mobile); fechada por padrão no mobile, sempre visível no desktop (`md:block`); "+ Guest" abre a seção automaticamente
- ⓘ Só CSS/estado — nenhuma mudança de backend

---

### Bandeira de Nacionalidade do Grupo (2026-07-05)
- [x] `GuestGroup.f_nationality` (ISO 3166-1 alpha-2) + normalização para maiúsculo no schema (migration `d4a7f0c1e256`)
- [x] `utils/countries.ts`: lista comum (24, aparece primeiro) + lista completa (~90 países) para busca; helpers `countryFlagEmoji`, `flagImageUrl` (Twemoji SVG via CDN), `countryName`
- [x] **Bandeira como imagem SVG (Twemoji @14.0.2 via jsDelivr)** — funciona no Windows (onde o emoji de bandeira vira "BR"); componente `Flag` renderiza a imagem e **cai para emoji** se o CDN falhar (offline)
- [x] **`CountryPicker`**: seletor com busca (autocomplete, acento-insensível), bandeira em imagem em cada opção; comuns primeiro, lista completa ao digitar; opção "Clear selection"
- [x] Picker no cadastro e edição do grupo (GuestsPage); `Flag` ao lado do nome do grupo, na barra do Room Grid e no painel de detalhe
- [x] `group_nationality` exposto no room-grid (backend)
- [x] 1 teste backend novo (`test_group_nationality_normalized_and_exposed_in_room_grid`); suíte → 35 esperado (validar no Codespaces)
- [x] **Labels nos formulários do grupo** (criação + edição): componente `LabeledField` mostra o nome do campo acima do input
- ⓘ Twemoji via CDN = dependência de rede externa (aceitável p/ ferramenta interna); flags ficam em cache no navegador
- ⓘ Build/pytest pendentes de execução no Codespaces (node/pytest indisponíveis na estação Windows)

---

### Financeiro na Página de Guests + Layout Horizontal (2026-07-03)
- [x] Card da reserva na `GuestsPage` mostra **Total geral / Extras / Pago / Saldo / status** (via invoice do grupo, carregado em paralelo sem bloquear a lista)
- [x] Hóspedes passam a um **grid responsivo** (1/2/3 colunas) no desktop — economiza espaço vertical; card em edição ocupa a linha toda
- [x] Visibilidade financeira marcada para gate por RBAC (backlog)
- [ ] Alocar hóspede em quarto específico (ex.: Michel no 1215) → backlog "Pessoa→Quarto"

---

### Refinos do Painel Financeiro (2026-07-03)
- [x] Botão "↺ Calcular pela ocupação" preenche o valor da hospedagem somando preço × noites de **todos os quartos da reserva** (editável depois, para negociação)
- [x] Painel deixa explícito que o financeiro é **da reserva inteira** (grupo), não do quarto clicado — lista os quartos da reserva + noites·quarto
- [x] Formulário de pagamento ganhou **campo de data** (default hoje), além de valor e forma
- [ ] Bandeira de nacionalidade do grupo → backlog

---

### Financeiro Phase 2 — Extras e Pagamentos Múltiplos (2026-07-03)
- [x] Modelo `ReservationExtra` (sala especial, sub-evento, serviço) + CRUD; total geral = hospedagem + Σ extras
- [x] Modelo `Payment` (parcelas): vários pagamentos por reserva; `f_amount_paid` recalculado como a soma automática
- [x] Migration `c8f1a2b6e934`; endpoints `/reservations/{id}/extras` e `/reservations/{id}/payments` (GET/POST/DELETE)
- [x] Invoice e financial-summary passam a incluir extras (contratado + esperado) e o total geral
- [x] Painel do Room Grid reformulado: hospedagem/status/observação + lista de extras + lista de pagamentos + rodapé com Hospedagem/Extras/Total geral/Pago/Saldo
- [x] `Payment` é a fundação da conta corrente por família (backlog)
- [x] 4 testes novos; suíte total: 34 verdes
- ⚠️ Transição: reservas legadas com `f_amount_paid` manual (sem linhas de Payment) têm o valor sobrescrito ao registrar o primeiro pagamento real

---

### UI de Pagamento no Room Grid (2026-07-03)
- [x] Painel de detalhe da alocação ganhou seção "Pagamento da reserva": valor total, valor pago, status (pendente/parcial/pago), saldo calculado e observação
- [x] Ao abrir a alocação, busca a reserva (`GET /reservations/{id}`) para pré-preencher os valores atuais; salva via `PUT /reservations/{id}`
- [x] Fecha o ciclo financeiro: os cards "Recebido"/"Pendente" e as cores do grid passam a refletir pagamentos reais registrados pela UI (antes só via API)
- [x] Tipos de reserva no `api.ts` ganharam os campos financeiros (estavam ausentes no front)
- [x] Status de pagamento permanece manual (consistente com a decisão de warning não-bloqueante)

---

### Ajustes de Layout do Grid — Sticky Header e Mobile (2026-07-03)
- [x] Cabeçalho do grid (linha de dias) fixo ao rolar verticalmente — container com scroll próprio + `sticky top-0`
- [x] Botão Refresh agora na mesma linha de Allocations/Guests no mobile
- [x] Legendas em linha única rolável no mobile (texto aglutinado)
- [ ] Backlog estruturado: hóspedes/famílias raiz, conta corrente, i18n, RBAC (com entrada por papel)

---

### Receita Potencial + Ajustes Mobile do Grid (2026-07-03)
- [x] `financial-summary`: receita esperada usa potencial (preço efetivo × noites) quando a reserva não tem valor negociado; campo `contracted_revenue` novo para separar negociado vs potencial
- [x] Card "Receita esperada" no grid indica quando inclui potencial e quanto já foi negociado
- [x] Room Grid mobile: coluna do quarto só com número; quadro de stats colapsável (toggle "▼ detalhes")
- [x] EventsPage mobile: botões em grid 2 colunas, sem estouro
- [x] Suíte: 30 testes verdes

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
- [x] `build.ps1` — substitui `deploy-caprover.ps1` com suporte a `-Target api|web`; deixa o tarball mais recente na raiz de `/dist/` e arquiva os anteriores em `/dist/legacy/` (até 5 de cada target)
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

### Priority 1: Facilities + Staff — Fatia 1 (decisão 2026-07-07)
> Modelo decidido e registrado no 08_decisions_log.md; fatias 1–5 no 09_backlog.md (bloco estrutural)
- [ ] PUT/DELETE de `HotelSpace` (GET/POST já existem)
- [ ] Retipar `f_space_type` com vocabulário do domínio (sinagoga, restaurante, salao_refeicao, …)
- [ ] UI de cadastro de espaços por hotel (casa com `HotelDetailPage.tsx` do UX Polish)
- [ ] Testes backend do CRUD de espaços

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
- Backend automated tests: **34 passing** (+1 novo p/ nacionalidade → 35 esperado, validar no Codespaces)
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
