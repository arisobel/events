# Decisions Log

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
