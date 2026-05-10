# Development Conventions

Convenções técnicas canônicas para implementação.

Este documento incorpora as partes ainda úteis de `docs/legacy/AGENT_INSTRUCTIONS.md`.

---

## Architectural Baseline

- modular monolith
- separação clara por domínio
- router layer separada de service layer
- models como camada de persistência
- schemas para validação e serialização

Evitar:

- lógica de negócio em routers
- acoplamento HTTP dentro de services
- mistura de responsabilidades entre módulos

---

## Backend Conventions

### File Structure

Preferir, por módulo:

- `models.py`
- `schemas.py`
- `service.py`
- `router.py`

### Naming

- arquivos Python em `snake_case`
- funções e variáveis em `snake_case`
- classes em `PascalCase`

### Service Layer

- receber `db: Session` quando necessário
- retornar objetos de domínio ou resultados simples
- não retornar respostas HTTP diretamente

### Router Layer

- validar input
- usar dependency injection
- devolver códigos HTTP adequados
- serializar via schemas

---

## Database Conventions

As convenções canônicas de banco ficam alinhadas com a documentação em `04_technical/`:

- tabelas com prefixo `t_`
- colunas com prefixo `f_`
- foreign keys nomeadas por contexto
- timestamps consistentes

Para detalhes completos, ver:

- `DATABASE_MODULES.md`
- `DATABASE_PHASE1.sql`
- `DATABASE_FULL_DRAFT.sql`

---

## Frontend Conventions

### Components

- componentes funcionais
- TypeScript por padrão
- separação entre pages, services e context

### API Access

- consumir backend pela camada de serviço
- evitar chamadas diretas à API dentro de componentes de página

### Styling

- Tailwind CSS como padrão atual
- responsividade mobile-first

---

## Development Sequence

Para features novas, seguir de preferência esta ordem:

1. modelo de dados
2. schemas
3. service layer
4. router/API
5. tipos frontend
6. serviço frontend
7. interface
8. validação integrada

---

## Testing Expectation

- validar comportamento real após mudanças
- priorizar testes na service layer quando houver lógica de negócio
- registrar gaps de teste em `07_progress.md`, `09_backlog.md` ou `KNOWN_ISSUES.md`

---

## Documentation Expectation

Mudanças técnicas relevantes devem refletir a estrutura atual:

- estado em `02_execution/07_progress.md`
- decisões em `02_execution/08_decisions_log.md`
- backlog em `02_execution/09_backlog.md`
- issues em `02_execution/KNOWN_ISSUES.md`

