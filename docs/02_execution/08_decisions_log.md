# Decisions Log

## [2026-07-03] Financeiro Phase 2 — Extras e Pagamentos Múltiplos

**Context:**
Michel apontou duas necessidades: (1) registrar adicionais cobrados (sala especial, sub-evento) para ver o total geral; (2) permitir vários pagamentos por reserva (parcelas), já que os valores são altos.

**Decisions (confirmadas via AskUserQuestion):**
- **Extras**: `ReservationExtra` (linha por reserva: descrição + valor). Total a cobrar = **hospedagem (`f_amount_total`, negociada) + Σ extras**. Extras entram no `contracted_revenue` e no `expected_revenue` do resumo (são cobranças explícitas).
- **Pagamentos múltiplos**: `Payment` (parcela: valor, data, forma). `Reservation.f_amount_paid` deixa de ser editado manualmente e passa a ser **a soma dos pagamentos**, recalculada pelo service a cada add/remove. O campo vira cache; a tabela `Payment` é a fonte de verdade.
- **Status de pagamento continua manual** (mantém a decisão de warning não-bloqueante) — não é derivado dos valores.
- Modelos `ReservationExtra`/`Payment` no módulo `finance` (não no `guests`), consultados por `f_reservation_id`, sem relationship reverso — evita ciclo de import.
- **`Payment` é intencionalmente a fundação da conta corrente por família**: quando famílias virarem entidade raiz, os pagamentos sobem para o razão da família. Não é trabalho descartável.

**Impact:**
- Migration `c8f1a2b6e934` (t_reservation_extra, t_payment)
- Endpoints GET/POST/DELETE para extras e pagamentos por reserva
- Invoice e summary incluem extras e total geral; 4 testes novos; suíte: 34 verdes
- Painel do Room Grid reformulado (hospedagem + extras + pagamentos + totais)
- **Risco de transição**: reservas legadas com `f_amount_paid` manual (sem Payments) têm o valor sobrescrito ao registrar o primeiro pagamento real — aceitável no estágio MVP

**Participants:** Product (Michel) + Engineering  
**Status:** ✅ Implementado

---

## [2026-07-03] Receita Esperada usa Potencial dos Quartos Precificados

**Context:**
Michel notou que a "Receita esperada" no dashboard do Room Grid mostrava R$ 0 mesmo com quartos precificados e alocados. Causa: `expected_revenue` somava apenas `reservation.f_amount_total` (valor negociado, digitado manualmente), que estava vazio.

**Decision:**
- `expected_revenue` passa a usar **fallback**: para cada reserva, usa `f_amount_total` se preenchido; senão, soma o **potencial** = preço efetivo dos quartos alocados × noites (mesmo preço efetivo do grid/extrato: override do evento > preço base do quarto)
- Adicionado campo `contracted_revenue` ao summary (só valores negociados) para transparência — o dashboard distingue "R$ X esperado (inclui potencial) · R$ Y negociado"
- `received_amount` continua sendo apenas `f_amount_paid` (o que de fato entrou); `pending = expected - received`

**Rationale:**
- Antes de fechar o valor com a família, o gestor precisa ver a receita potencial do evento — é o principal indicador de planejamento
- Preserva a decisão anterior (valor negociado é autoritativo): quando `f_amount_total` existe, ele prevalece sobre o cálculo

**Impact:**
- 2 testes novos (fallback de potencial + override de preço do evento no potencial); suíte total: 30 verdes
- Frontend: card "Receita esperada" indica quando inclui potencial; quadro de stats vira colapsável no mobile (toggle "▼ detalhes")

**Participants:** Product (Michel) + Engineering  
**Status:** ✅ Implementado

---

## [2026-07-03] Feedback do Room Grid — Pacote de Melhorias (edição de evento, entrada padrão, preço por evento)

**Context:**
Revisão do Room Grid pelo Michel gerou 5 pontos. Implementados os 3 menores; 2 maiores estruturados no backlog.

**Decisions:**
1. **Edição de evento**: `EventUpdate` expandido (datas, tipo, expected_families, entry default). Validação de datas invertidas em create/update. Encolher datas com alocações fora da janela **não bloqueia** (filosofia de warning); a grade recorta na janela naturalmente. Hotel do evento não é editável (mover evento de hotel quebraria alocações).
2. **Evento de entrada padrão**: flag `f_is_entry_default` em `Event`, exclusiva (marcar um desmarca os demais — mesmo padrão do líder de grupo). Resolução de entrada no app: flag manual → senão evento em curso por data → senão lista. **Destino**: durante o evento → Room Grid (tela de monitoramento); fora do período → Guests (preparação).
3. **Preço por Evento × Quarto**: tabela `t_event_room_price` (unique event+room) sobrepõe o preço base de `HotelRoom`. Room-grid e extrato usam o **preço efetivo** (override > base); grid expõe base + flag para a UI distinguir (asterisco violeta). Rotas: GET/PUT/DELETE `/events/{id}/room-prices/{room_id}`. **Preço por período dentro do evento ficou de fora por decisão pendente** — a tabela pode ganhar `f_event_period_id` opcional depois sem quebrar nada.
4. **Yom Tov no grid (hebcal)**: decidido que o grid lerá `EventPeriod` (já existente) e o hebcal entra como importador via backend — estruturado no backlog, não implementado.
5. **Nomes no quarto**: nomes na barra do grid descartados (poluição visual); painel de detalhe mostrará hóspedes; atribuição real pessoa→quarto estruturada no backlog como feature própria.

**Impact:**
- Migration `b7e3a9c4d512` (flag + tabela de preços)
- 6 testes novos (4 events edit, 2 event room price); suíte total: 28 verdes
- UI: edição de evento na EventsPage (checkbox "Evento ativo"), preço por evento clicando no quarto no Room Grid

**Participants:** Product (Michel) + Engineering  
**Status:** ✅ Itens 2, 3, 4 implementados / 📋 Itens 1, 5 no backlog

---

## [2026-07-02] Edição de Hotéis e Quartos

**Context:**
Cadastro de hotéis/quartos só permitia criar. Faltava editar — e não havia forma de definir o preço do quarto pela UI, o que travava o módulo financeiro recém-criado.

**Decisions:**
- `HotelUpdate` deixou de ser um subconjunto arbitrário e passou a cobrir todos os campos de contato/localização + notas
- Criada rota `PUT /hotels/{hotel_id}/rooms/{room_id}` (edição completa do quarto) — validando que o quarto pertence ao hotel da URL
- `update_room_status()` foi mantido para uso pontual, mas a edição rica passa por `update_hotel_room()`
- Frontend reutiliza os mesmos formulários para criar e editar (modo controlado por `editingHotelId`/`editingRoomId`), evitando duplicação de UI
- O seletor de hotel fica travado ao editar um quarto (não se move quarto de hotel por esse caminho)
- Campos `f_price_per_night` e `f_room_type_label` agora são editáveis na UI — este é o ponto onde o operador define a precificação que alimenta a grade e o extrato

**Impact:**
- 6 testes novos em `tests/test_hotel_edit.py`; suíte total: 22 verdes
- Precificação de quartos passa a ser operável de ponta a ponta pela interface

**Participants:** Product + Engineering  
**Status:** ✅ Implementado

---

## [2026-07-02] Módulo Financeiro — Backend Phase 1 Implementado

**Context:**
Primeiro passo do Gestor Financeiro (Priority 1): precificação de quartos, rastreamento de pagamento por reserva e endpoints de leitura consolidada (grade, resumo, extrato).

**Decisions:**
- `HotelRoom` ganha `f_price_per_night` (Numeric 10,2) e `f_room_type_label` (rótulo comercial livre)
- `Reservation` ganha `f_amount_total`, `f_amount_paid` (default 0), `f_payment_status` (pending/partial/paid) e `f_payment_notes`
- **`f_payment_status` é controlado manualmente pelo operador** — não é derivado automaticamente dos valores. Segue a filosofia de "warning não-bloqueante": a UI pode sinalizar inconsistência (ex.: pago = total mas status pendente), mas o sistema não impõe
- `f_amount_total` da reserva é o valor autoritativo (negociado); o extrato também expõe `calculated_total` (noites × preço do quarto) como referência para conferência
- Cálculo de noites: `end_date - start_date` (dia de checkout não conta); alocação de dia único conta como 1 noite
- Novo módulo `finance` **sem models próprios** — é camada de leitura sobre Hotel/Guests/Rooms
- Endpoint de extrato ficou `GET /events/{event_id}/groups/{group_id}/invoice` (o backlog citava `/guest-groups/{id}/invoice`, mas o padrão do código nesta base é aninhar grupos sob eventos)
- Ocupação % = noites alocadas / (total de quartos × noites do evento)

**Impact:**
- Migration `9d2f5c1e7a34` adiciona os 6 campos
- 3 endpoints novos: `/events/{id}/room-grid`, `/events/{id}/financial-summary`, `/events/{id}/groups/{gid}/invoice`
- 7 testes novos em `tests/test_finance.py`; suíte total com 16 verdes
- Phase 2 (ReservationExtra) e frontend (grade visual) permanecem no backlog

**Participants:** Product + Engineering  
**Status:** ✅ Implementado

---

## [2026-07-01] Visão Ampliada do Domínio — Evento Judaico de Hospitalidade

**Context:**
Sessão de alinhamento de produto revelou profundidade muito maior do que o MVP capturou. O sistema é destinado a programas de Pessach em hotéis — uma "cidade temporária kosher" de 7-10 dias com centenas de hóspedes.

**Domain model ampliado:**

Espaços do hotel precisam ser tipados (sinagoga, restaurante, sala exclusiva de refeição, quadra, piscina, academia, salão de shows, sala de aula).

Staff é multifacetado: funcionário operacional, ministrante (rabino/palestrante/monitor/entertainer), Mashguiach (supervisor kosher).

Atividades/micro-eventos têm: espaço + horário + ministrante + público-alvo + tipo (reza, aula, show, esporte, refeição).

**Três perfis de gestão com interfaces distintas:**
- **Gestor Financeiro**: grade de quartos × famílias × períodos, precificação, cobrança, receita. PRIORIDADE 1.
- **Gestor Chef**: refeições, cardápio, estoque, mesas, salas exclusivas
- **Gestor de Campo**: cronograma de atividades, sinagoga, staff, reclamações, solicitações

**Kashrut / Mashguichim**: módulo especializado — turnos de supervisão kosher por cozinha/refeição, cobertura contínua garantida.

**Multi-idiomas**: i18n desde o início, tanto no app do hóspede quanto na gestão. Mercado internacional.

**Decision:**
- Gestor Financeiro é a prioridade 1 de implementação
- Domain model do hotel (espaços tipados) precisa ser expandido antes dos módulos dependentes
- Kashrut registrado como módulo especializado de médio prazo
- Multi-idiomas planejado desde o início da arquitetura do `frontend-guest`

**Impact:**
- ✅ Backlog atualizado com Financial Manager como Priority 1
- ✅ Domain model ampliado documentado aqui
- ⏳ PRD e DOMAIN_MODEL.md devem ser atualizados para refletir os 3 gestores
- ⏳ `HotelSpace` precisa de tipagem formal antes dos módulos de atividade

**Participants:** Product  
**Status:** ✅ Registrado / ⏳ Implementação iniciando pelo Gestor Financeiro

---

## [2026-07-01] TV Displays — Grade do Dia em Telas do Hotel

**Context:**
Necessidade identificada de presença física do sistema nas TVs espalhadas pelo hotel durante o evento.

**Decision:**
- Criar endpoints públicos (sem auth) que retornam o cronograma do dia formatado para exibição
- Segmentado por público: Geral / Homens / Mulheres / Infantil
- Destaque para evento iminente (próximos 30 min)
- Página fullscreen sem chrome, auto-refresh a cada 2 minutos
- URL padrão: `events.lion.app.br/display/{event_id}?audience=all`
- QR code na tela leva para o app do hóspede

**Rationale:**
- Resolve o problema de comunicação presencial sem papel ou quadros físicos
- Aproveita o mesmo modelo de Activities — custo de implementação baixo dado o módulo
- Pode ser configurado em qualquer TV com browser (Chromecast, TV com HDMI+browser, tablet)

**Depende de:** Módulo Activities implementado  
**Status:** ✅ Registrado / ⏳ Implementar após Activities

---

## [2026-07-01] App do Hóspede — Superfície Separada, Mobile-First PWA

**Context:**
Com o deploy em produção estabilizado, o próximo horizonte de produto é o App do Hóspede. A decisão é sobre arquitetura e estratégia de plataforma.

**Decision:**
- Criar `frontend-guest/` como segundo frontend no mesmo repositório — app separado, deploy separado (`guest.events.lion.app.br`)
- Mobile-first desde o início: layout por bottom tab bar, cards grandes, uma ação por tela, tipografia generosa
- PWA de primeira classe: `manifest.json` + service worker → instalável no celular sem app store
- Backend compartilhado: mesma API FastAPI; guest app consome os mesmos endpoints com auth próprio
- Separação futura: se um dia virar React Native, o app web separado é a base mais limpa para migração; a lógica de API pode ser extraída para uma lib compartilhada

**Rationale:**
- Auth do hóspede (código do evento + sobrenome + nº do quarto) é fundamentalmente diferente do auth admin — misturar criaria complexidade sem benefício
- Hóspedes acessam quase 100% via smartphone; admins usam desktop/tablet — UX completamente diferente não cabe em um único app sem comprometer um dos dois
- App separado permite deploy, versioning e rollback independentes

**Impact:**
- ⏳ `frontend-guest/` a criar no próximo ciclo
- ⏳ Backend: módulo de Atividades e auth de hóspede como primeiros entregáveis
- ✅ Decisão registrada; backlog atualizado

**Participants:** Michel (filho) — notas de produto; Product + Agent  
**Status:** ✅ Decidido / ⏳ Implementação a iniciar

---

## [2026-06-30] CapRover Production Deploy — Implementação

**Context:**  
Com a documentação de deploy já existente em `docs/04_technical/DEPLOYMENT_CAPROVER.md`, foi solicitada a implementação efetiva da infraestrutura de produção para CapRover via tarball.

**Decision:**  
- Adotar topologia de 4 apps: `events-postgres` (one-click), `events-api` (tarball), `events-web` (tarball), Redis adiado
- Criar `Dockerfile` na raiz do repositório para o backend de produção (contexto CapRover usa raiz do tarball — o `backend/Dockerfile` existente estava com caminhos errados para esse contexto)
- Rodar `alembic upgrade head` automaticamente no startup do container, antes do uvicorn
- Criar `frontend/Dockerfile` com multi-stage build (Node → Nginx) em vez de servir frontend pelo backend
- `VITE_API_URL` resolvido como build arg no Dockerfile do frontend (baked no build), não como env var de runtime
- CORS corrigido para usar `settings.CORS_ORIGINS` via env var — antes estava hardcoded para Codespaces only e bloqueava produção
- `build.ps1` como script único de empacotamento com parâmetro `-Target api|web`, substituindo `deploy-caprover.ps1` para novos deploys (o antigo permanece)
- Domínio de produção: frontend `https://events.lion.app.br`, API `https://api.events.lion.app.br`

**Rationale:**
- `Dockerfile` na raiz resolve o problema de contexto do CapRover — com `dockerfilePath: "./Dockerfile"`, o build context é a raiz do tarball, e os `COPY backend/` ficam corretos
- Migrations no startup elimina passo manual; é seguro com Alembic (idempotente quando não há mudanças)
- Redis adiado porque o MVP atual não usa cache — adicionar agora seria complexidade sem benefício
- `frontend/Dockerfile` separado (em vez de servir static do FastAPI) mantém separação de responsabilidades e facilita escalar/configurar cada app individualmente
- Dois `captain-definition` (raiz para api, `frontend/` para web) permite usar um único script de build para gerar tarballs independentes

**Impact:**  
- ✅ `Dockerfile` criado na raiz
- ✅ `captain-definition` criado na raiz (events-api)
- ✅ `frontend/Dockerfile` criado (multi-stage Node + Nginx)
- ✅ `frontend/nginx.conf` criado (SPA fallback + cache headers)
- ✅ `frontend/captain-definition` criado (events-web)
- ✅ `build.ps1` criado na raiz
- ✅ CORS corrigido em `backend/app/main.py`
- ✅ `VITE_API_URL` adicionado em `frontend/src/services/api.ts`
- ⏳ Primeiro deploy no CapRover ainda pendente

**Participants:** Product + Agent  
**Status:** ✅ Implementado / ⏳ Validação em staging pendente

---

## [2026-05-12] CapRover Deployment Preparation Scope

**Context:**  
O projeto precisa ser preparado para deploy no CapRover, mas a solicitação atual restringe o trabalho a documentação. O repositório já possui `infrastructure/captain-definition` e `backend/Dockerfile`, porém o estado atual ainda reflete desenvolvimento local/Codespaces e não um deploy de produção completo.

**Decision:**  
- Registrar o preparo de CapRover somente em documentação neste ciclo
- Tratar o deploy alvo como apps separados: backend API, frontend estático, PostgreSQL e Redis opcional
- Não alterar código, Dockerfiles, `captain-definition` ou scripts nesta etapa
- Usar `docs/04_technical/DEPLOYMENT_CAPROVER.md` como runbook canônico para a próxima implementação
- Considerar o deploy CapRover como não pronto para produção até que frontend, CORS, comando backend, migrations e bootstrap admin sejam implementados

**Rationale:**
- Evita publicar um backend com comando de desenvolvimento e sem frontend de produção
- Mantém a arquitetura de modular monolith com unidades de deploy simples
- Permite planejar variáveis de ambiente, domínios, migrations e rollback antes de tocar na infraestrutura

**Impact:**  
- ✅ Estado atual e lacunas foram documentados
- ✅ Backlog recebeu checklist de readiness CapRover
- ⏳ Próxima etapa técnica deve implementar o runbook
- ⏳ Validação em staging CapRover ainda pendente

**Participants:** Product + Agent  
**Status:** ⏳ Documentado / não implementado

---

## [2026-05-11] Guest Consistency Rule and Controlled Enums

**Context:**  
Depois da abertura de `Guest` individual na UI principal, surgiram duas definições de produto antes da próxima rodada de implementação: fechar a regra entre `reservation.f_total_guests` e o número de hóspedes cadastrados no grupo, e padronizar `Gender`/`GuestType` para evitar texto livre inconsistente.

**Decision:**  
- `reservation.f_total_guests` continua sendo um campo explícito no nível da reserva
- A regra desejada passa a ser: `f_total_guests` deve ser **maior ou igual** ao número de `Guest` cadastrados no grupo
- Quando `f_total_guests < hóspedes cadastrados`, o sistema deve **apontar inconsistência**, mas **não bloquear** cadastro ou edição
- `Gender` deixa de ser texto livre e passa a usar enum controlado
- `GuestType` deixa de ser texto livre e passa a usar enum controlado
- `leader` **não** entra em `GuestType`; liderança continua separada via `f_is_group_leader`
- `GuestType` deve incluir `adult`, `child`, `infant` e `staff`

**Rationale:**
- Permite lançamento progressivo de grupos incompletos sem travar a operação
- Evita inconsistência silenciosa entre ocupação reservada e composição nominal do grupo
- Melhora qualidade de dados para filtros, relatórios e regras futuras
- Preserva separação conceitual entre “tipo de hóspede” e “papel de liderança”
- `staff` cobre casos reais do domínio, como mashguichim, rabinos e outros workers hospedados sem cobrança padrão

**Impact:**  
- ⏳ Próximo ciclo deve implementar warning visual de inconsistência entre reserva e hóspedes cadastrados
- ⏳ Formulários de `Guest` devem trocar inputs livres por selects controlados
- ⏳ Backend deve validar e expor enums consistentes
- ✅ A modelagem central `GuestGroup -> Guest -> Reservation` permanece estável

**Participants:** Product + Agent  
**Status:** ⏳ Pré-desenvolvimento

---

## [2026-05-10] Guest Expansion Strategy: Group First, Guest Second

**Context:**  
O MVP interno atual opera corretamente no nível de `GuestGroup -> Reservation -> RoomAllocation`, mas a operação real já evidenciou a próxima lacuna: líderes de grupo e membros individuais ainda precisam ser registrados em observações textuais. O domínio já possui entidade `Guest`, porém ela ainda não está exposta na UI/API principal.

**Decision:**  
- Manter `GuestGroup` como unidade operacional principal
- Expandir o módulo de hóspedes abrindo `Guest` como subentidade de grupo
- Manter `Reservation` vinculada ao grupo, não ao hóspede individual
- Introduzir conceito explícito de líder do grupo
- Tratar esta expansão como próxima fase funcional antes de outros refinamentos opcionais de UX

**Rationale:**
- Preserva o fluxo operacional já validado no MVP
- Resolve a principal ambiguidade atual do módulo de hóspedes
- Evita modelar reservas pessoa a pessoa cedo demais
- Cria base melhor para check-in, documentação e requests futuros

**Impact:**  
- ✅ CRUD de hóspedes individuais implementado
- ✅ `GuestsPage` evoluiu de tela de grupos/reservas para grupos + membros
- ✅ Notas livres deixaram de ser o único lugar para registrar líder e composição do grupo
- ✅ O desenho central do MVP permanece estável

**Participants:** Product + Agent  
**Status:** ✅ Implementado

---

## [2026-04-24] Tasks Event-Scoped Architecture

**Context:**  
Havia duplicação entre TasksPage.tsx (rota `/events/:eventId/tasks`) e TasksPage_Simple.tsx (rota `/tasks`). A rota genérica `/tasks` não fazia sentido arquitetural pois tasks devem estar sempre vinculadas a um evento específico.

**Decision:**  
- Manter apenas TasksPage.tsx com rota event-scoped: `/events/:eventId/tasks`
- Remover TasksPage_Simple.tsx (287 linhas eliminadas)
- Remover rota `/tasks` do App.tsx
- Estabelecer regra: **"Tasks devem sempre estar vinculadas a um eventId"**

**Impact:**  
- ✅ Eliminou duplicação de código
- ✅ Estabeleceu hierarquia clara: Hotel → Event → Tasks
- ✅ Simplificou arquitetura do frontend
- ✅ Forçou event-scoped tasks via UX
- ✅ Base sólida para expansão futura

**Participants:** Agent  
**Status:** ✅ Implementado e validado

---

## [2026-04-22] Codespaces Ports Public by Default

**Context:**  
Login estava falhando no frontend devido a portas privadas no GitHub Codespaces. Portas privadas requerem autenticação de túnel, causando erros CORS mesmo com configuração correta.

**Decision:**  
- Criar script `make_ports_public.sh` para automatizar configuração
- Tornar portas 8000 (backend) e 5173 (frontend) públicas
- Documentar solução em KNOWN_ISSUES.md
- Adicionar validação de portas nos scripts de inicialização

**Impact:**  
- ✅ Login funcionando 100% no Codespaces
- ✅ Setup simplificado para novos desenvolvedores
- ✅ Eliminou classe de erros CORS
- ⚠️ Portas públicas = dados não sensíveis apenas

**Participants:** Agent  
**Status:** ✅ Implementado

---

## [2026-04-21] Modular Monolith Architecture

**Context:**  
Decisão inicial de arquitetura para o sistema. Precisávamos escolher entre microservices, monolito ou abordagem híbrida.

**Decision:**  
Adotar **Modular Monolith** com:
- Módulos organizados por domínio (auth, hotel, events, etc)
- Clara separação de responsabilidades
- Comunicação via service interfaces (não diretamente via tabelas)
- Single deployment unit

**Rationale:**
- Simplicidade de desenvolvimento e deploy para MVP
- Módulos com fronteiras claras preparam para possível extração futura
- Single codebase reduz complexidade operacional
- Facilita debugging e desenvolvimento
- Permite evolução para microservices se necessário

**Impact:**  
- ✅ Estrutura `/backend/app/modules/*` implementada
- ✅ Cada módulo com models, router, schemas, service
- ✅ Zero acoplamento entre módulos detectado
- ✅ Arquitetura escalável sem over-engineering

**Participants:** Agent, Architecture Review  
**Status:** ✅ Implementado

---

## [2026-04-21] Hotel vs Event Separation

**Context:**  
Necessidade de modelar relação entre infraestrutura física (hotel) e instâncias operacionais (eventos).

**Decision:**  
- **Hotel** = entidade persistente (base infrastructure)
- **Event** = entidade temporal vinculada a um hotel
- Hotels são reutilizáveis entre múltiplos eventos
- Events herdam estrutura do hotel mas adicionam camada operacional

**Rationale:**
- Permite uso da mesma infraestrutura em diferentes eventos
- Suporta modelo SaaS futuro (multi-hotel, multi-event)
- Separação clara entre configuração e operação
- Previne acoplamento indevido

**Impact:**  
- ✅ Database schema reflete separação
- ✅ Módulos independentes (hotel, events)
- ✅ Suporta expansão futura

**Participants:** Domain Modeling  
**Status:** ✅ Implementado

---

## [2026-04-21] JWT Authentication Strategy

**Context:**  
Necessidade de autenticação stateless para suportar PWA e múltiplos clientes.

**Decision:**  
- JWT tokens para autenticação
- Token expiration de 30 dias (configurável)
- Refresh tokens não implementados no MVP (pode adicionar depois)
- Token armazenado em localStorage (frontend)

**Rationale:**
- Stateless = não requer sessões server-side
- Suporta PWA offline (token local)
- Simplicidade para MVP
- Padrão industry-standard

**Impact:**  
- ✅ Auth module implementado
- ✅ Protected routes funcionando
- ⚠️ Sem refresh tokens (risco: re-login necessário após expiração)

**Participants:** Security Review  
**Status:** ✅ Implementado  
**Future Enhancement:** Adicionar refresh tokens

---

## [2026-04-21] Database Naming Convention

**Context:**  
Necessidade de convenção clara para tabelas e colunas no PostgreSQL.

**Decision:**  
- Prefixo `t_` para todas as tabelas (ex: `t_user`, `t_hotel`)
- Prefixo `f_` para todas as colunas (ex: `f_username`, `f_email`)

**Rationale:**
- Evita conflitos com palavras reservadas SQL
- Clareza visual no código SQL
- Consistência em todo schema

**Impact:**  
- ✅ Alembic migrations seguem convenção
- ✅ SQLAlchemy models mapeiam corretamente
- ✅ 22 tabelas criadas seguindo padrão

**Participants:** Database Design  
**Status:** ✅ Implementado

---

## [2026-04-21] PWA-First Mobile Strategy

**Context:**  
Staff precisa acessar sistema via mobile para execução de tasks. Decisão entre PWA ou app nativo.

**Decision:**  
- **PWA-first** approach
- React Native como opção futura se necessário
- Service workers para offline support (Phase 2)

**Rationale:**
- Zero friction (sem app store)
- Updates instantâneos
- Multiplataforma automaticamente
- Menor custo de desenvolvimento
- Suficiente para MVP

**Impact:**  
- ⏳ PWA features pendentes (Phase 2)
- ✅ Frontend já responsivo
- ✅ Preparado para PWA conversion

**Participants:** Product Strategy  
**Status:** ⏳ Planejado para Phase 2

---

## [2026-04-21] FastAPI + SQLAlchemy Stack

**Context:**  
Escolha de framework backend Python.

**Decision:**  
- **FastAPI** como framework web
- **SQLAlchemy** como ORM
- **Alembic** para migrations

**Rationale:**
- FastAPI: performance, type hints, auto-docs
- SQLAlchemy: ORM maduro, suporta relacionamentos complexos
- Alembic: controle de versão de schema
- Ecosistema Python robusto

**Impact:**  
- ✅ Backend implementado
- ✅ /docs automático funcionando
- ✅ Type safety com Pydantic
- ✅ Migrations versionadas

**Participants:** Technical Architecture  
**Status:** ✅ Implementado

---

## [2026-04-21] React + TypeScript + Vite Frontend

**Context:**  
Escolha de stack frontend.

**Decision:**  
- **React 18** + **TypeScript**
- **Vite** como build tool
- **Tailwind CSS** para styling

**Rationale:**
- React: ecosistema maduro, componentização
- TypeScript: type safety, melhor DX
- Vite: builds rápidos, HMR excelente
- Tailwind: produtividade, consistência visual

**Impact:**  
- ✅ Frontend implementado
- ✅ Zero erros TypeScript
- ✅ Build e dev server rápidos
- ✅ UI consistente

**Participants:** Frontend Architecture  
**Status:** ✅ Implementado

---

## [2026-05-10] Documentation Restructuring

**Context:**  
Documentação fragmentada em múltiplos arquivos (NEXT_STEPS.md, PROJECT_EVOLUTION.md, ROADMAP.md) causava ambiguidade e duplicação.

**Decision:**  
Implementar estrutura definida em AGENT_SKILL_ORCHESTRATION.md:
- `/docs/00_meta/` - Meta-documentação e skills
- `/docs/01_definition/` - PRD, DOMAIN_MODEL, ARCHITECTURE
- `/docs/02_execution/` - Progress, Backlog, Decisions
- `/docs/03_validation/` - Relatórios de validação
- `/docs/04_technical/` - Documentação técnica
- `/docs/legacy/` - Arquivos antigos

**Rationale:**
- Single source of truth por categoria
- Reduz redundância
- Facilita navegação
- Documentação = operational memory

**Impact:**  
- ✅ Estrutura criada
- ✅ Arquivos core organizados
- ✅ Progress consolidado em 07_progress.md
- ✅ Backlog estruturado em 09_backlog.md
- ✅ Decisões registradas em 08_decisions_log.md

**Participants:** Agent  
**Status:** ✅ Implementado

---

## [2026-05-10] Internal MVP Occupancy Slice

**Context:**  
O projeto já tinha um vertical slice funcional para autenticação, hotéis, eventos e tasks, mas ainda não fechava o ciclo principal de operação com reservas e alocação de quartos.

**Decision:**  
- tratar `GuestGroup` como unidade operacional mínima do MVP
- usar `Reservation` como vínculo temporal do grupo ao evento
- usar `RoomAllocation` como alocação concreta da reserva em quartos
- expandir a UI para cobrir criação de hotel, quartos, eventos, grupos, reservas e alocações

**Impact:**  
- ✅ core do MVP interno ficou utilizável sem intervenção manual no banco
- ✅ módulos Guests e Rooms passaram de parciais para funcionais
- ✅ fluxo principal agora é `Hotels -> Events -> Guests/Reservations -> Room Allocations -> Tasks`
- ✅ base automatizada de testes passou a cobrir auth, ocupação e tasks

**Participants:** Agent  
**Status:** ✅ Implementado

---

## [2026-05-10] Legacy Documentation Disposition

**Context:**  
Após a reestruturação inicial, ainda existiam documentos relevantes presos em `docs/legacy/`, o que mantinha ambiguidade sobre quais arquivos continuavam válidos e quais estavam apenas preservados por histórico.

**Decision:**  
- manter `docs/legacy/` como arquivo histórico read-only
- reincorporar conteúdo ainda útil em documentos canônicos da árvore nova
- registrar o status de cada arquivo legado em `docs/legacy/README.md`

**Impact:**  
- ✅ regras operacionais migradas para `00_meta/AGENT_OPERATING_RULES.md`
- ✅ modelo operacional migrado para `01_definition/OPERATIONAL_MODEL.md`
- ✅ visão humana do produto migrada para `01_definition/PRODUCT_OVERVIEW.md`
- ✅ mapa de superfícies migrado para `01_definition/UI_SURFACES.md`
- ✅ convenções técnicas migradas para `04_technical/DEVELOPMENT_CONVENTIONS.md`
- ✅ todos os arquivos restantes em `legacy/` agora têm destinação explícita

**Participants:** Agent  
**Status:** ✅ Implementado

---

## Notes

- Decisões documentadas em ordem cronológica reversa (mais recentes primeiro)
- Cada decisão inclui contexto, decisão, impacto e status
- Decisões arquiteturais são rastreáveis
- Este log é vivo e será atualizado continuamente
