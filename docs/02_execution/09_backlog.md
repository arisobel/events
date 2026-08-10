# Backlog

## 🎫 Bloco Estrutural — Agência, Voucher e i18n — 🔴 PRIORIDADE ATUAL (decidido 2026-08-09)
> Expansão do produto para o eixo comercial: proxy/gateway de vendas entre agência(s), hotéis e party-planners. Decisões na entrada 2026-08-09 do 08_decisions_log.md. Voucher real de agência usado como spec (dois números: Booking Reference da agência + Provider Reference do fornecedor; voucher sem R$; branding da agência).

### 🌐 Fase A1 — i18n (PT-BR, EN, HE com RTL) — 🟢 INFRA ENTREGUE 2026-08-09
> Absorve o item "Multi-idiomas (i18n)" decidido em 2026-07-01 e parado desde então. Pré-requisito do Voucher.
>
> ⚠️ **Ajuste técnico registrado**: implementado **sem react-i18next** — o build usa `npm ci` com package-lock e não há node/npm local para regenerar o lock (adicionar dependência quebraria o deploy). i18n próprio em `src/i18n/` (~100 linhas): dicionários **tipados** (ptBR = fonte das chaves; en/he são `Record<TranslationKey, string>` → **tradução faltando é erro de compilação**), interpolação `{var}`, fallback pt-BR. Chamadas `t('chave', {vars})` migram fácil se a lib entrar um dia.
- [x] Infra: `src/i18n/` (provider + `useI18n` + `t` tipado); detecção navegador → localStorage → **preferência salva no usuário** (`t_user.f_language`, migration `e8f0a2b4c596`; `PUT /auth/me/language`; AuthContext aplica no login — cross-device)
- [x] Seletor de idioma na sidebar (persiste no usuário) e na LoginPage (pré-login)
- [x] **RTL base**: `document.documentElement.dir/lang` dinâmicos (he → rtl); layouts flex flipam automaticamente — smoke visual em produção pendente
- [x] Extração inicial: AdminLayout (nav/rodapé/logout) + LoginPage completa em PT/EN/**HE**
- [x] 3 testes backend (`test_language_pref.py`) — suíte total: 87 verdes
- [ ] Extrair strings das demais páginas (próximas: Clients, Guests/Reservations — fluxo do voucher; depois incrementalmente)
- [ ] Revisar layouts críticos em RTL após smoke visual (drawer mobile da sidebar fica à esquerda em RTL — ajustar se incomodar)
- [ ] Novas telas nascem traduzidas (regra de desenvolvimento)
- [ ] (Decidir) mensagens de erro do backend: traduzir no front por código de erro vs. backend multilíngue

### 🎫 Fase A2 — Voucher v1 (PDF, sobre a Reservation atual)
> Entrega o documento do exemplo real em cima do fluxo existente; migra naturalmente para o Booking na Fase B.
- [ ] Entidade `Agency` (emissora): nome, logo, contatos, e-mail/telefone de emergência, blocos de texto padrão (front desk / emergency / remarks / T&C) **por idioma**, template de numeração
- [ ] **Numeração por template configurável** por agência (ex.: `{PREFIX}-{YYYY}-{SEQ}`; fallback sequencial); sequência atômica por agência
- [ ] Campos novos na `Reservation`: `f_booking_reference` (da agência), `f_provider_reference` (do hotel/fornecedor), `f_board_type` (B/B, HB, FB — avaliar reuso de `f_package_type`), `f_agency_id`
- [ ] **Geração de PDF no servidor** (para anexo de e-mail futuro): escolher lib (candidata WeasyPrint/HTML→PDF); fontes com suporte a hebraico; layout RTL quando idioma = HE
- [ ] Conteúdo: hotel + endereço, arrival/departure, noites, quartos, hóspedes nominais, room type comercial, board type, provider reference, notes/emergency/remarks/T&C da agência — **sem valores financeiros**
- [ ] Idioma do voucher escolhido na emissão (independente do idioma do operador)
- [ ] Reemissão: mesma referência + versão (v2, v3…) — confirmar comportamento
- [ ] UI: botão "Emitir voucher" na reserva (GuestsPage/detalhe) + download do PDF
- [ ] Endpoint autenticado de download; audit de emissão (quem/quando) — candidato a estrear o `AuditLog`

**Estimativa**: 10-16h (Agency + numeração + PDF + UI)

### 🏦 Fase B — Contexto Comercial (Booking / Provider / Margem) — decisões antes de implementar
> 📚 **Referência de RBAC estudada (2026-08-10): `arisobel-labs/pwa-fair`** — ver `docs/10_migration/W0_AUTH_AUDIT_RBAC_CONTRACT.md` daquele repo. Padrões a importar: (1) capacidades derivadas `permissions_for(role)` serializadas no `/auth/me` (front deixa de hardcodar papéis); (2) **escopo contextual no usuário** (`nucleo_id`/`current_fair_id` ≈ nosso futuro `f_agency_id`): papel = "o quê", escopo = "onde"; (3) contrato W0 (matriz operação×papel + códigos de erro) escrito e aprovado ANTES do DDL; (4) auth events append-only (estreia do nosso AuditLog); (5) hardening: lockout, reset de senha, sessões revogáveis/token hasheado. Manter nosso N:N de papéis (mais flexível que o papel único deles).
- [ ] **Contrato RBAC/tenancy no formato W0** (matriz operação × papel × escopo-agência) — aprovar antes de qualquer tabela nova
- [ ] **Escopo por agência (tenancy entre agências)**: usuário pertence a uma Agency; bookings/clientes visíveis só à agência dona — **definir regras antes de qualquer tabela nova** (⚠️ implicação de "múltiplas agências emissoras")
- [ ] `permissions_for` + capacidades no `/auth/me` (pode ser antecipado — independe do Booking)
- [ ] `Provider`: hotel interno (aponta para t_hotel) / hotel externo / serviço (flores, banda, passeio…)
- [ ] `Booking` (agência ↔ cliente, referência própria) + `BookingItem` (serviço × provider × provider_reference × custo × **preço de venda** → margem)
- [ ] Item de hotel interno aponta para a `Reservation` operacional (os dois mundos se ligam sem se fundir); venda avulsa **não** cria Event (decisão 8)
- [ ] Lado "a pagar" ao fornecedor + margem por booking (primo do P&L de evento); conta corrente do cliente passa a enxergar bookings
- [ ] Papel RBAC "agente de vendas"; voucher passa a ser emitido do Booking
- [ ] Status do booking (requested/confirmed/paid/cancelled) + política de cancelamento

### 🎪 Fase C — Party-Planner e Parceiros
- [ ] Party-planner como organizadora que compõe bookings de múltiplos fornecedores num evento (conexão com Event + EventExpense/P&L)
- [ ] Login de parceiros (hotel confirma reserva, planner monta pacote) **só se houver demanda real** — modelo de dados já preparado

---

## Immediate (Next Cycle) - 1-2 semanas

### CapRover Deployment Readiness
- [x] Criar `deploy-caprover.ps1` para gerar pacote `.tar` versionado por timestamp em `/dist`
- [ ] Criar estratégia final de apps CapRover separados: backend, frontend, PostgreSQL e Redis opcional
- [ ] Mover/criar `captain-definition` de produção no local esperado pelo fluxo de deploy escolhido
- [ ] Ajustar comando de produção do backend para rodar sem `--reload`
- [ ] Definir e implementar estratégia de migrations em produção
- [ ] Configurar CORS de produção usando domínio real do frontend
- [ ] Adicionar suporte frontend a `VITE_API_URL`
- [ ] Criar Dockerfile de produção para frontend estático com fallback SPA
- [ ] Definir bootstrap seguro de usuário admin em produção
- [ ] Validar `/health`, `/docs` e fluxo MVP em staging CapRover

**Estimativa**: 5-8h  
**Valor**: torna o MVP publicável em ambiente controlado sem depender de Codespaces/local

---

### Guest Consistency + Enums
- [ ] Implementar regra visual de consistência: `reservation.f_total_guests >= group.guests.length`
- [ ] Exibir warning não-bloqueante quando `f_total_guests < hóspedes cadastrados`
- [ ] Definir comportamento visual da inconsistência sem impedir operação
- [ ] Trocar `Gender` de texto livre para enum controlado
- [ ] Trocar `GuestType` de texto livre para enum controlado com `adult`, `child`, `infant`, `staff`
- [ ] Preservar `f_is_group_leader` como atributo separado de `GuestType`
- [ ] Cobrir a nova regra e os enums em testes backend/frontend

**Estimativa**: 4-7h  
**Valor**: melhora consistência operacional sem engessar a operação real do evento

---

### CI + Automated Verification
- [ ] Configurar GitHub Actions para `pytest backend/tests`
- [ ] Configurar GitHub Actions para `npm run build`
- [ ] Adicionar execução combinada de backend + frontend no pipeline

**Estimativa**: 3-5h  
**Valor**: endurece o MVP interno recém-fechado

---

### API-Level Integration Tests
- [ ] Investigar e estabilizar harness de testes HTTP/ASGI
- [ ] Cobrir login, grupos, reservas, alocações e tasks via API
- [ ] Manter testes de serviço como baseline rápida

**Estimativa**: 4-6h  
**Valor**: reduz risco entre regra de negócio e camada HTTP

---

### Validation Package
- [ ] Capturar screenshots do fluxo MVP
- [ ] Criar relatório de validação do MVP interno
- [ ] Validar fluxo completo em Codespaces

**Estimativa**: 2-3h  
**Valor**: transforma implementação em evidência demonstrável

---

### Guest Flow Refinement
- [x] Revisar política para sincronismo entre hóspedes cadastrados e `reservation.f_total_guests`
- [ ] Implementar a política escolhida em UI/backend
- [ ] Decidir se o líder do grupo também deve ser referenciado explicitamente em `GuestGroup`
- [ ] Preparar terreno para check-in futuro sem quebrar reservas no nível do grupo

**Estimativa**: 3-5h  
**Valor**: transforma a nova camada de hóspedes em base sólida para próximas operações

---

### UX Polish
- [ ] Implementar `HotelDetailPage.tsx`
- [ ] Melhorar a visualização entre reservas e alocações
- [ ] Adicionar mais contexto de hotel/evento nas telas do fluxo

**Estimativa**: 3-5h  
**Valor**: melhora usabilidade sem reabrir o core do MVP

---

## Immediate — Próximo Ciclo

### 🔴 PRIORITY 1: Módulo Financeiro — Grade de Quartos
> Gestor estratégico/financeiro: substitui a planilha principal de alocação e receita

**Backend — Phase 1 (Grade de ocupação):** ✅ **IMPLEMENTADO 2026-07-02**
- [x] Adicionar precificação a `HotelRoom`: `f_price_per_night`, `f_room_type_label`
- [x] Adicionar campos financeiros a `Reservation`: `f_amount_total`, `f_amount_paid`, `f_payment_status` (pending/partial/paid), `f_payment_notes`
- [x] Endpoint `GET /events/{id}/room-grid` — retorna grade: quartos × períodos × família alocada + status financeiro
- [x] Endpoint `GET /events/{id}/financial-summary` — totais: receita esperada, recebida, pendente, ocupação %
- [x] Endpoint `GET /events/{event_id}/groups/{group_id}/invoice` — extrato por família: quartos, períodos, total, pago, saldo (extras ficam para Phase 2)

**Backend — Phase 2 (Extras e pagamentos múltiplos):** ✅ **IMPLEMENTADO 2026-07-03**
- [x] Modelo `ReservationExtra`: item extra por reserva (sala especial, sub-evento, serviço) com valor
- [x] Endpoint de adição/remoção de extras por reserva
- [x] Incluir extras no extrato da família (total geral = hospedagem + extras) e no resumo financeiro
- [x] Modelo `Payment`: vários pagamentos por reserva; `f_amount_paid` vira a soma automática (base da conta corrente futura)
- [x] Endpoints de adição/remoção de pagamentos por reserva

**Frontend (Gestão — Financeiro):**
- [x] Grade visual de quartos × datas (estilo planilha/calendar grid) com cor por status de pagamento — `RoomGridPage` (2026-07-02)
- [x] Painel financeiro do evento: ocupação % + receita total/recebida/pendente — cards no topo da grade (2026-07-02)
- [ ] Tela de extrato por família com registro de pagamentos
- [x] UI para registrar pagamento (editar `f_amount_total`/`f_amount_paid`/`f_payment_status` da reserva) — no painel do Room Grid (2026-07-03)
- [ ] Swap direto entre dois quartos ocupados (precisa de endpoint dedicado — conflito na validação com dois updates sequenciais)

**Estimativa**: 8-12h backend / 6-10h frontend  
**Valor**: substitui a planilha Excel do gestor financeiro; visibilidade total de ocupação e receita

---

### 🕎 Períodos do Evento no Grid e no Cronograma + Importação hebcal
> Originado em sessão 2026-07-02: mostrar Yom Tov / Chol Hamoed abaixo da linha de dias do Room Grid
>
> **Reforço 2026-07-07 (Michel):** a informação de qual dia é Yom Tov/Shabat é **fundamental também nas abas de dias do Cronograma** (SchedulePage) — o programa impresso real marca isso nas colunas. Alvo: badge/cor na aba do dia + horários-chave (velas/havdalá) como referência para as rezas. Candidato a fatia logo após a Fatia 3 de Staff.
>
> Decisão de arquitetura: o grid e o cronograma leem `EventPeriod` (já existe modelo + rotas GET/POST); hebcal é **importador**, não dependência em tempo real

**Backend:**
- [ ] Endpoint `POST /events/{id}/periods/import-jewish-holidays` — proxy para API hebcal.com (JSON), cria `EventPeriod`s no intervalo do evento
- [ ] Localização do hotel (cidade/geo) para horários corretos — depende de dados confiáveis no cadastro do hotel
- [ ] (Decidir) importar também horários de velas/havdalá ou só datas — perguntas em aberto: Israel vs diáspora (2º dia Yom Tov)
- [ ] PUT/DELETE de períodos (hoje só GET/POST)

**Frontend:**
- [ ] Faixa de períodos abaixo do header do Room Grid (nome + tipo colorido)
- [ ] UI de gestão de períodos do evento + botão "Importar datas judaicas"

**Estimativa**: 4-6h  
**Valor**: contexto religioso-operacional direto na tela chave; reuso futuro nos displays de TV

---

### 🛏️ Atribuição Pessoa → Quarto
> Originado em sessão 2026-07-02: "quem dorme em qual quarto?" — hoje o vínculo para no grupo
>
> Responde pergunta operacional frequente (check-in individual, emergências, "em qual quarto está fulano?")

- [ ] (Decidir) modelo: `guest.f_room_allocation_id` (simples) vs tabela própria com histórico
- [ ] Backend: atribuir/remover hóspede de uma alocação; validar capacidade do quarto (warning não-bloqueante)
- [ ] Painel de detalhe do Room Grid: listar hóspedes do quarto; inferir automaticamente quando o grupo tem 1 quarto só
- [ ] Busca "onde está fulano?" por nome → quarto

**Estimativa**: 4-6h  
**Valor**: fecha o ciclo de ocupação no nível da pessoa; base para check-in individual futuro

---

### 🧩 Hóspedes/Famílias a Nível Raiz (desacoplamento de eventos) ⭐ ESTRUTURAL — 🟡 EM ANDAMENTO (2026-07-05)
> Originado em sessão 2026-07-03: famílias recorrem entre eventos (Pessach todo ano) — recadastrar a cada evento é ruim
>
> **Decisão tomada (2026-07-05):** modelo "Cliente + Pessoas". Primeira fatia entregue.

**✅ Entregue (2026-07-05):**
- [x] Módulos raiz `Client` + `Person` (t_client / t_person); FKs opcionais `GuestGroup.f_client_id` / `Guest.f_person_id`; migration `e1b9c3f5a7d2`
- [x] CRUD backend + `GET /clients/{id}/events` + `POST /clients/{id}/import-to-event/{event_id}`
- [x] Sidebar "Clientes" + `ClientsPage` (CRUD cliente/pessoas, busca, participações)

**✅ Entregue (2026-07-05, 2ª leva):**
- [x] UI "Importar de cliente" na GuestsPage (picker com busca + bandeira)
- [x] "★ Salvar como cliente" — promove grupo existente → cliente (`POST /clients/from-group/{group_id}`); badge "Cliente ✓" no grupo vinculado

**Falta:**
- [ ] (Decidir) sincronização de edições: mudar dados de uma Pessoa raiz reflete nos hóspedes já importados? (hoje é cópia no momento do import/promote, sem sync contínuo)
- [ ] Na ClientsPage, permitir importar direto para um evento (hoje o import parte da tela do evento)

---

### 🧩 Hóspedes/Famílias a Nível Raiz — notas originais da proposta
> **Decisão pendente antes de implementar** — muda o modelo de dados central

**Problema atual:**
- `GuestGroup.f_event_id` e `Guest.f_group_id` amarram grupo/hóspede a UM evento
- Uma família que volta em outro evento precisa ser recadastrada do zero

**Abordagem recomendada — "entidade permanente + participação por evento":**
- Novo módulo raiz `people` (menu ao lado de Hotels/Events): `Household` (família permanente) + `Person` (pessoa permanente, dados que não mudam: nome, documento, nascimento)
- `GuestGroup` ganha `f_household_id` opcional; `Guest` ganha `f_person_id` opcional — a participação-por-evento passa a referenciar a entidade raiz
- Fluxo: ao montar um grupo no evento, "importar de família existente" (copia dados + vincula) OU criar do zero e opcionalmente "promover" para família raiz
- Migração incremental: FKs opcionais, nada quebra; dados atuais seguem funcionando

**Backend:**
- [ ] Modelos `Household` + `Person` (raiz, sem event)
- [ ] FKs opcionais `f_household_id` / `f_person_id` em GuestGroup/Guest
- [ ] CRUD raiz + endpoint "importar família para evento"
- [ ] (Decidir) o que é dado permanente (pessoa) vs. dado do evento (participação)

**Frontend:**
- [ ] Menu + página `PeoplePage` (lista de famílias/pessoas)
- [ ] No fluxo de Guests do evento: seletor "importar família existente"

**Estimativa**: 10-16h  
**Valor**: elimina recadastro; base para histórico do hóspede e para a conta corrente

---

### 💳 Conta Corrente por Cliente (financeiro entre eventos) ⭐ ESTRUTURAL — ✅ IMPLEMENTADO (2026-07-05)
> Modelo escolhido: "Derivado + ajustes manuais". Extrato consolidado por Cliente, atravessando eventos.

**✅ Entregue (2026-07-05):**
- [x] `LedgerEntry` (t_ledger_entry) para ajustes manuais; migration `f2c8a4e6b1d3`
- [x] `get_client_statement`: deriva débitos (total das reservas) + créditos (pagamentos) reutilizando o finance, soma manuais; saldo atravessa eventos
- [x] `GET /clients/{id}/statement`, `POST/DELETE /clients/{id}/ledger-entries`; seção "Conta corrente" na ClientsPage
- [ ] (Futuro) filtro por evento no extrato, exportação, e decisão de sync ao editar Pessoa raiz

**Notas originais da proposta (referência):**

**Conceito (razão / ledger):**
- Conta corrente por `Household`: **débitos** = valores dos eventos (o que a família deve), **créditos** = pagamentos/depósitos
- Saldo corrente = créditos − débitos, atravessando eventos
- "Leve desacoplamento": o financeiro por reserva continua, mas alimenta lançamentos na conta da família

**Backend:**
- [ ] Modelo `LedgerEntry` — família, tipo (débito/crédito), valor, data, descrição, ref. opcional a evento/reserva
- [ ] Débito gerado quando o valor de uma reserva/evento é fechado; crédito ao registrar pagamento
- [ ] Endpoint de extrato consolidado da família (todos os eventos) + saldo
- [ ] (Decidir) débito automático a partir de `f_amount_total`, ou lançamento manual pelo gestor

**Frontend:**
- [ ] Extrato da família na `PeoplePage`: lista de lançamentos + saldo
- [ ] Registrar pagamento (crédito) e ver histórico entre eventos

**Estimativa**: 8-12h  
**Valor**: visão financeira real do relacionamento com a família ao longo do tempo; suporta cobrança de saldo acumulado

---

### 🏳️ Bandeira de Nacionalidade do Grupo/Família ✅ **IMPLEMENTADO 2026-07-05**
> Originado em sessão 2026-07-03 (lateral): em evento internacional, identificar de relance a nacionalidade da família
- [x] Adicionar `f_nationality` (código ISO 3166-1 alpha-2, ex.: BR, AR, US, IL) a `GuestGroup` (migration `d4a7f0c1e256`)
- [x] Seletor de país no cadastro/edição do grupo (GuestsPage)
- [x] Exibir bandeira (emoji derivado do código ISO — sem assets de imagem) na barra do Room Grid, no painel e na lista de grupos
- [x] Conjunto de países comuns pré-listado (BR, AR, US, IL, UY, MX…) + lista completa (~90) em `utils/countries.ts`
- [x] Seletor com busca/autocomplete (`CountryPicker`) e bandeira em imagem
- [x] Bandeira renderizada como imagem SVG (Twemoji via CDN) — funciona no Windows; fallback para emoji offline

**Estimativa**: 2-3h  
**Valor**: leitura rápida da composição internacional do evento; combina com o i18n e o app do hóspede

---

### 🌐 Multi-idiomas (i18n)
> ⚠️ **Absorvido pela Fase A1 do bloco "🎫 Agência, Voucher e i18n" (2026-08-09)** — ver lá o escopo atual (inclui **HE/RTL** e idioma por usuário, decididos). Mantido aqui só como referência histórica da decisão de 2026-07-01.

---

### 🔐 RBAC — Usuários e Papéis ✅ IMPLEMENTADO (2026-07-06)
> 3 papéis: admin, gestor_financeiro, gestor_campo. Gate financeiro ligado.
- [x] Papéis + seed no startup (bootstrap admin no 1º usuário)
- [x] Proteção de endpoints por papel (finance router + financeiro de clients) e rotas/UI no frontend (`RoleRoute`, `canSeeFinancials`)
- [x] Tela de gestão de usuários e papéis (`/admin/users`, admin-only)
- [x] Entrada por papel (campo não cai no room-grid)
- [x] Visibilidade financeira gated (GuestsPage, ClientsPage conta corrente, Room Grid)
- [ ] (Futuro) gestor_chef + módulo cozinha/mesas; troca de senha na UI; RBAC mais fino por ação

**Valor entregue**: segrega financeiro de operação; produção deixa de expor R$ a todos os logins

---

### 📺 Displays de TV — Grade do Dia
> Telas espalhadas pelo hotel mostrando cronograma e evento iminente, segmentadas por público
>
> Originado em sessão 2026-07-01

**Conceito:**
- Endpoint público (sem auth) que retorna/renderiza o cronograma do dia
- Consumido por TVs do hotel — auto-refresh a cada N minutos
- Segmentado por público: Geral / Homens / Mulheres / Infantil
- Destaque para o evento iminente (próxima atividade em até 30 min)

**Backend:**
- [ ] `GET /display/{event_id}/today` — atividades do dia, ordenadas por horário
- [ ] `GET /display/{event_id}/now` — atividade atual + próxima (para destaque)
- [ ] Parâmetro `?audience=all|men|women|children` para filtrar por público
- [ ] Sem autenticação — endpoint público read-only

**Frontend (Display):**
- [ ] Página `DisplayPage` fullscreen, sem chrome (sem menu, sem header)
- [ ] Layout landscape: hora + título + local + público + próximo evento
- [ ] Auto-refresh a cada 2 minutos
- [ ] Versão QR code: link do display → leva para o app do hóspede
- [ ] URL padrão: `events.lion.app.br/display/{event_id}?audience=all`

**Depende de:** Módulo Activities (cronograma de atividades)  
**Estimativa**: 3-4h backend / 4-6h frontend  
**Valor**: presença física do sistema no hotel; visibilidade para hóspedes sem precisar do app

---

## 🧠 Bloco Estrutural — Espaços, Staff e Contabilidade do Evento — 🟢 FATIAS 1-5 ENTREGUES (backend completo; UI das fatias 4/5 pendente)
> Origem: brain-dump do Michel (2026-07-06). **Decisões de modelo tomadas em 2026-07-07** — ver entrada "Facilities + Staff — Modelo Estrutural e Sequenciamento" no 08_decisions_log.md. Facilities e Staff são os dois últimos pilares da fundação; a Fatia 5 marca o início formal da fase de execução (Tasks). Ver conexões com [Organização de Mesas], [Schedule Module] e com o Financeiro já entregue.

**Sequenciamento decidido:**
```
Fatia 1: Facilities CRUD + UI          ← PRÓXIMA — sem decisões pendentes
Fatia 2: Activity → Space              ← cronograma ancorado em lugares
Fatia 3: Employee raiz + engajamento   ← inclui staff hospedado via Person→Guest
Fatia 4: Ministrante na Activity       ← une os dois cadastros no cronograma
Fatia 5: Task → Space + Task → Staff   ← fronteira da fase de execução
```

### 🏛️ Fatia 1 — Facilities: dar vida ao `t_hotel_space` existente ✅ **IMPLEMENTADO 2026-07-07**
> Atividades, tasks e refeições acontecem em lugares: Lobby, Restaurantes A/B/C, Piscina, Quadras, Praia, Salão da Sinagoga, salões de refeição. Hoje `Activity.f_location` guarda **texto livre** — sem vínculo estruturado.

**O que JÁ existia (não recriar):**
- `t_hotel_space` (HotelSpace): `f_name`, `f_space_type`, `f_capacity`, `f_floor`, `f_block` — vinculado ao Hotel, **com GET/POST `/hotels/{id}/spaces` funcionando**
- `t_event_space` (EventSpace): liga espaço↔evento com `f_usage_type` (modelado, sem endpoints/UI)
- `t_hotel_table` e `t_hotel_kitchen` já referenciam `f_space_id`

**Entregue (2026-07-07):**
- [x] PUT/DELETE `/hotels/{id}/spaces/{space_id}`; DELETE bloqueia com 409 se o espaço estiver em uso (kitchens, tables, event spaces)
- [x] `f_space_type` retipado com vocabulário do domínio via Literal no schema (sinagoga, restaurante, salao_refeicao, salao_shows, sala_aula, piscina, quadra, praia, lobby, academia, outro); Response mantém `str` para não travar leitura de linhas legadas — **sem migration** (coluna já era String(50))
- [x] **UI de espaços na HotelsPage**: botão "+ Add Space", "View Spaces" por hotel, lista com tipo/capacidade/andar/bloco, criar/editar/excluir; `utils/spaces.ts` com vocabulário + rótulos PT
- [x] 9 testes novos (`test_spaces.py`): CRUD, tipo fora do vocabulário rejeitado, update parcial, delete bloqueado por referência (kitchen e event space) — **suíte total: 60 verdes**
- ⓘ pytest agora roda na estação Windows local (deps instaladas; bcrypt fixado em 4.0.1 local por incompatibilidade passlib×bcrypt 5); build TS continua só no CapRover/Codespaces

### 📅 Fatia 2 — Cronograma ancorado em lugares ✅ **IMPLEMENTADO 2026-07-07**
> **Decidido (2026-07-07):** `Activity.f_space_id` FK **direto** para `t_hotel_space`; `f_location` texto livre vira fallback/legado. `EventSpace` não é pré-requisito — é filtro complementar do picker quando existir.
- [x] FK opcional `f_space_id` em `Activity` e em `Task` (antecipado da Fatia 5) — migration `b4c6d8e0f152`; backend valida que o espaço pertence ao hotel do evento (`validate_space_for_event` no hotel service; 400 se inválido)
- [x] Respostas de Activity/Task expõem `space_name` resolvido (relationship + property no model)
- [x] SchedulePage: seletor "Espaço" no form (texto livre só aparece sem espaço selecionado; escolher espaço limpa o texto livre); lista mostra 📍 nome do espaço
- [x] TasksPage: seletor "Space" no form de criação; chip 📍 do espaço na lista
- [x] Warning **não-bloqueante** de conflito: badge "⚠ Conflito de espaço" quando duas atividades do dia usam o mesmo espaço em horários sobrepostos (atividade sem fim = pontual; ignora filtro de tipo)
- [x] 7 testes novos (`test_space_links.py`) — **suíte total: 67 verdes**
- [ ] (Futuro) agenda/ocupação por espaço: "o que está acontecendo no Salão Jequitibás agora?" — base para displays de TV por local

### 👷 Fatia 3 — Employee raiz + engajamento por evento ✅ **IMPLEMENTADO 2026-07-07**
> **Decidido (2026-07-07):** `Employee` como entidade raiz (atravessa eventos) com `f_person_id` **opcional** → `Person`. Espelha o padrão Cliente+Pessoas: Person = identidade; Client = receita; Employee = custo. Função e custo ficam no **engajamento por evento** (função muda entre eventos); custo padrão no Employee com override no engajamento (mesmo padrão do preço de quarto).
- [x] Backend: módulo `staff` — `Employee` (t_employee) + `EventStaffAssignment` (t_event_staff); migration `d6e8f0a2c374`
- [x] **Custo derivado** para o P&L: total fechado (autoritativo) > diária efetiva (override > padrão do Employee) × dias trabalhados (inclusivo nas duas pontas — kasherização D-5 funciona); expostos `work_days`/`effective_daily_cost`/`derived_total_cost`
- [x] **Gate financeiro em salários** (RBAC): campos de custo zerados na resposta sem acesso financeiro; escrita de custo exige papel financeiro (403). Operação (quem/quando/função) visível a todo usuário ativo
- [x] **Staff hospedado**: `POST /staff/employees/{id}/lodge/{event_id}` — cria/reusa grupo "Staff" (`f_group_type=staff`) e adiciona o colaborador como `Guest` (GuestType=staff, `f_person_id` propagado quando houver) — entra na alocação/room grid sem código novo; idempotente
- [x] Delete de employee bloqueado (409) se houver engajamentos (histórico de custo)
- [x] Frontend: `StaffPage.tsx` (rota `/staff`, link "Staff" na sidebar) — busca, CRUD, engajamentos por evento com custos gated por `canSeeFinancials`, botão "🛏 Hospedar"
- [x] 7 testes novos (`test_staff.py`) — **suíte total: 74 verdes**
- [ ] (Próximas fatias) turnos dentro do engajamento; vínculo Employee↔Person via picker na UI (hoje só por API); despesa de staff no P&L (bloco 📊)

### 🎤 Fatia 4 — Ministrante na Activity — 🟢 BACKEND IMPLEMENTADO (sessão paralela BH, migration `e7a9c1b3d586`)
- [x] `Activity.f_instructor_id` FK opcional → Employee + `instructor_name` na resposta — concretiza a decisão 2026-07-01
- [ ] **UI pendente**: picker de ministrante no form do SchedulePage + exibição na lista do cronograma

### 🔗 Fatia 5 — Reconexão das Tasks (início da fase de execução) — 🟢 BACKEND IMPLEMENTADO (sessão paralela BH, migration `e7a9c1b3d586`)
> `Task.f_assigned_to_staff_id`, `TaskComment.f_staff_member_id` e `TaskStatusHistory.f_changed_by_staff_id` são Integers **sem FK** desde a criação — o esqueleto sempre esperou este cadastro.
>
> ⓘ Conceito confirmado com Michel (2026-07-07): **Task ≠ Activity**. Activity = programa público do evento (hóspede/displays); Task = trabalho interno da equipe (nunca vai ao público). Isso resolve "tasks públicas vs. privadas" por arquitetura, sem flag de visibilidade. Ex.: kasherização D-5 = tasks puras (due_datetime não é preso à janela do evento); montagem de um jantar = task **ligada** à activity.
- [x] `Task.f_assigned_to_staff_id` virou FK real → `t_event_staff` (**executor**); valores órfãos anulados na migration antes da constraint
- [x] **Líder/ponto focal**: `Task.f_leader_staff_id` FK opcional → engajamento; `leader_staff_name` na resposta
- [x] **Link Task ↔ Activity**: `Task.f_activity_id` FK opcional; `activity_title` na resposta
- [x] ~~FK opcional `f_space_id` em `Task`~~ → antecipado para a Fatia 2 (entregue)
- [ ] **UI pendente**: seletores de executor/líder (engajamentos do evento) e de atividade no form da TasksPage; exibição de executor/líder/atividade nos cards; "tasks da atividade" no cronograma
- [ ] A partir daqui: turnos, PWA do staff e supervisão constroem em cima

**Substitui/absorve** o item "Módulo Funcionários (Staff)" mais abaixo — mantê-los sincronizados.

---

### 📊 Fechamento Financeiro do Evento — mini-contabilidade (P&L por evento)
> Objetivo: **lucro do evento** = receita − despesas. Receita já existe (créditos dos clientes = pagamentos das reservas). Falta o lado das **despesas/custos**.

**O que JÁ existe (lado da receita):**
- `Payment` por reserva + conta corrente por cliente (créditos derivados) → base da **receita** do evento

**Falta (lado da despesa):**
- [ ] Modelo `EventExpense` (t_event_expense): `f_event_id`, `f_category`, `f_description`, `f_amount`, `f_date`, `f_vendor?`, `f_notes`
- [ ] Categorias de custo: **salários/staff**, **insumos/comida**, **transfers**, **sub-eventos**, **gerais/overhead** (livre + enum sugerido)
- [ ] Despesa de staff **derivada** do custo dos engajamentos (`EventStaffAssignment`) + ajustes manuais — mesmo padrão "derivado + ajustes manuais" da conta corrente (decorre da decisão 2026-07-07; depende da Fatia 3)
- [ ] Endpoint de **P&L do evento**: receita (pagamentos) − despesas (por categoria) = resultado; % margem
- [ ] Frontend: aba "Fechamento" no evento — receita total, despesas por categoria, lucro; gated por `require_financial_access`
- [ ] (Futuro) consolidação multi-evento; comparar orçado × realizado

**Conexões:** Staff (custo de salário) e sub-eventos/transfers/refeições alimentam as despesas; Espaços podem carregar custo por uso (aluguel de salão externo, etc.). Fecha o ciclo: operação (espaços/staff/cronograma) → custo → lucro.

**Estimativa (as três, quando forem para execução)**: ~6-9h Espaços · ~8-12h Staff · ~8-12h P&L
**Valor**: transforma o sistema de operacional em **ferramenta de gestão de resultado** do evento — visão de lucro real para a alta administração

---

## Short Term - 3-6 semanas

### Auth: Troca de Senha + Roles na UI
- [ ] Endpoint `POST /auth/change-password` (hoje só via docker exec)
- [ ] UI de perfil com troca de senha
- [ ] Tela de gerenciamento de usuários e patentes (admin)
- [ ] Proteger rotas por role no frontend (gestão vs. outras patentes)

**Valor**: operação básica sem acesso à VPS; base para múltiplos perfis de acesso

---

### Módulo Funcionários (Staff)
> ⚠️ Absorvido pelo bloco "👷 Cadastro de Staff/Colaboradores" (2026-07-06) acima — ver lá a decisão de vínculo com `Person` raiz e a ponte com alocação de quartos. Mantido aqui como referência das notas originais.
> Originado nas notas de Michel (Gestão — Cadastro Funcionários)
- [ ] Backend: modelo `Employee` — dados pessoais, função, períodos de trabalho, salário
- [ ] Backend: CRUD + vínculo com evento
- [ ] Frontend: `StaffPage.tsx` — lista, cadastro, edição
- [ ] Visualização de turnos por evento

**Valor**: substitui controle manual de equipe; base para alocação de staff em atividades

---

### Eventos: Detalhamento Operacional
> Originado nas notas de Michel (Gestão — Eventos)
- [ ] Adicionar campos ao evento: `local`, `necessidades` (comida, staff), `publico_alvo` (crianças/adultos/misto/todos)
- [ ] Calendário visual de eventos por hotel
- [ ] Duração calculada (data início/fim já existem)

**Valor**: enriquece o contexto operacional do evento sem mudar a estrutura central

---

### Hóspedes: Dados Financeiros da Reserva
> Originado nas notas de Michel (Gestão — Cadastro Hóspedes)
- [ ] Adicionar a `Reservation`: `valor_pago`, `dias_hospedados`
- [ ] Exibir total por grupo/família na UI
- [ ] (Decidir) divisão por famílias: sub-agrupamento dentro do GuestGroup?

**Valor**: fecha o ciclo operacional do hóspede; base para o módulo financeiro

---

### Organização de Mesas
> Originado nas notas de Michel (Gestão — Organização Mesas/Salas). Nota 2026-07-07 (Michel): a montagem de mesas é atividade-base das refeições — crítica nos **Sedarim** de Pessach, mas necessária em todo dia importante (Chaguim, Shabat).
>
> **Duas abordagens em avaliação (decidir antes de implementar):**
> 1. **Vínculo simples**: grupo ↔ número de mesa por refeição/período (rápido de entregar, resolve "em qual mesa minha família está?")
> 2. **Montagem visual**: arrastar e vincular mesas num layout do salão — tem mais charme e apelo (preferência do Michel); `t_hotel_table` já tem `f_space_id` (salão) e `f_shape`, faltaria posição x/y
>
> Caminho provável: entregar (1) como base de dados e evoluir para (2) como camada visual sobre os mesmos dados — o vínculo não é jogado fora.
- [ ] Backend: modelo `TableAssignment` — mesa, família/grupo, refeição/período
- [ ] Frontend: `TablesPage.tsx` — atribuição de mesas por família
- [ ] “Em qual mesa minha família está?” — query por grupo
- [ ] (Fase 2) layout visual do salão com posição das mesas e drag-and-drop
- [ ] Conexão com Tasks: a montagem física das mesas vira task (ligada ao espaço do salão; e à refeição via Task↔Activity da Fatia 5)

**Valor**: resolve uma das perguntas mais frequentes em eventos desse tipo

---

### Schedule Module (Cronograma de Atividades) — 🟡 EM ANDAMENTO (2026-07-06)
> Base para o App do Hóspede e para a Gestão. Modelo calibrado pelo programa impresso real de Pessach (colunas = dias com Yom Tov/Chol Hamoed/Shabat; linhas = atividades com hora, título, local; cor por categoria).

**✅ Entregue (2026-07-06):**
- [x] Backend: modelo `Activity` (t_activity) — título, tipo, público, local, `f_date` + `f_start_time`/`f_end_time` ("HH:MM"), descrição, sort; migration `a3d9e5c7b410`
- [x] Tipos derivados do doc real: religioso, refeicao, infantil, palestra, entretenimento, geral (cores batendo com o programa impresso)
- [x] Público: all/men/women/children/youth (filtro por público inclui os 'all')
- [x] Backend: CRUD (`GET/POST /events/{id}/activities`, `PUT/DELETE /activities/{id}`) com filtros por dia/tipo/público; validação HH:MM
- [x] Frontend (gestão): `SchedulePage.tsx` — abas por dia (colunas do programa), lista por horário colorida por tipo, criar/editar/excluir + botão "Cronograma" na nav do evento
- [x] Testes backend (`test_schedule.py`): CRUD, ordenação por horário, filtro por dia/tipo, filtro de público incluindo 'all', rejeição de HH:MM inválido

**Falta (próximas fatias):**
- [ ] Períodos judaicos no cabeçalho (Yom Tov/Chol Hamoed/Shabat) — casa com o item 🕎 do backlog
- [ ] Segmentação por idioma nas Palestras (Português/Inglês) — hoje vai em observação
- [ ] Endpoints públicos `GET /display/{event_id}/today|now` (sem auth) para App do Hóspede e Displays de TV
- [ ] Nusach (Sefaradi/Ashkenazi) como campo próprio vs. no título

**Valor**: backbone do cronograma que tanto o hóspede quanto a gestão vão consumir

---

## Mid Term - 2-3 meses

### App do Hóspede ⚠️ Decisão arquitetural pendente
> Originado nas notas de Michel (Usuário: Hóspede) — superfície nova e independente
>
> **Decisão necessária**: seção separada no mesmo frontend (`/guest/...`) ou novo app (`guest.events.lion.app.br`)?

**Auth do hóspede:**
- [ ] Login via código do evento + sobrenome + número do quarto (sem username/senha)
- [ ] Token de sessão isolado do auth administrativo

**Tela inicial:**
- [ ] Atividades ocorrendo agora e próximas (consome Schedule Module)

**Cronograma:**
- [ ] Visualização filtrada por tipo (religioso, infantil, refeições, entretenimento)
- [ ] Filtros configuráveis pelo contratante/gestor

**Reservas:**
- [ ] Restaurantes — calendário com horários disponíveis
- [ ] Salas — calendário + forma de pagamento
- [ ] Gerenciar minhas reservas

**Achados e Perdidos:**
- [ ] Upload de imagem + descrição
- [ ] Visualizar registros de outros hóspedes

**Infos:**
- [ ] Telefones e ramais importantes (cadastrados pela gestão)

**Serviços:**
- [ ] Babá, enfermeira e outros serviços disponíveis (configurável)

**”Em qual mesa minha família está?”:**
- [ ] Query por sobrenome/número do quarto → retorna mesa atribuída

**Valor**: transforma o produto de interno para hóspede — diferencial do sistema

---

### Módulo Financeiro
> Originado nas notas de Michel (Gestão — Financeiro) — escopo a definir
- [ ] **Definir escopo**: só visualização de receitas, ou também controle de pagamentos?
- [ ] Dashboard financeiro por evento: total de reservas, valor pago, saldo
- [ ] Extrato por hóspede/família
- [ ] (Futuro) integração com formas de pagamento

**Valor**: fecha o ciclo para a alta administração — visão de receita por evento

---

### Supervision Dashboard (Alta Administração)
- [ ] Visão consolidada de todos os eventos ativos
- [ ] Métricas: ocupação, tarefas pendentes, staff alocado
- [ ] Alertas operacionais

---

### Módulo Achados e Perdidos
- [ ] Backend: modelo `LostItem` — descrição, imagem, data, status (perdido/encontrado/devolvido)
- [ ] Upload de imagem (storage local ou S3)
- [ ] API pública (hóspede sem auth pode consultar)

---

## Long Term - 3-6 meses

### PWA Features
- [ ] Offline support para o App do Hóspede
- [ ] Push notifications para atividades e reservas
- [ ] Background sync

### Multi-tenancy Preparation
- [ ] `tenant_id` em entidades relevantes
- [ ] Isolação de dados por operadora de evento
- [ ] Seleção de tenant em auth

### Intelligence Layer
- [ ] Sugestões de alocação de quartos/mesas
- [ ] Detecção automática de conflitos de agenda
- [ ] Automação assistida de tarefas recorrentes

---

## Notes

- O foco imediato volta a ser “estabilizar e validar o MVP”, agora com a camada `Guest` já entregue
- O core de ocupação e a gestão individual de hóspedes já estão funcionais; próximos passos devem equilibrar robustez, demonstração e refinamento de regras
- A próxima regra funcional já definida é: inconsistência entre hóspedes cadastrados e total reservado gera warning, não bloqueio
- **2026-07-01**: Notas de produto de Michel incorporadas — App do Hóspede e expansão da Gestão entram como horizontes estruturantes do produto
