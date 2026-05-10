# Legacy Archive Status

Inventário canônico do arquivo histórico em `docs/legacy/`.

Objetivo:

- deixar explícito o destino de cada arquivo legado
- impedir que `legacy/` volte a funcionar como fonte primária
- apontar a localização canônica do conteúdo migrado

Regra:

- arquivos marcados como `incorporated` tiveram conteúdo absorvido na estrutura nova
- arquivos marcados como `duplicated copy` existem apenas como espelho histórico
- arquivos marcados como `retired` foram explicitamente aposentados

---

## File Status Matrix

| Legacy file | Status | Canonical location / action |
| --- | --- | --- |
| `AGENT_INSTRUCTIONS.md` | incorporated | `docs/00_meta/AGENT_OPERATING_RULES.md` and `docs/04_technical/DEVELOPMENT_CONVENTIONS.md` |
| `AGENT_RULES.md` | incorporated | `docs/00_meta/AGENT_OPERATING_RULES.md` |
| `API_PLAN.md` | duplicated copy | `docs/04_technical/API_PLAN.md` |
| `ARCHITECTURE.md` | duplicated copy | `docs/01_definition/ARCHITECTURE.md` |
| `DATABASE_FULL_DRAFT.sql` | duplicated copy | `docs/04_technical/DATABASE_FULL_DRAFT.sql` |
| `DATABASE_MODULES.md` | duplicated copy | `docs/04_technical/DATABASE_MODULES.md` |
| `DATABASE_PHASE1.sql` | duplicated copy | `docs/04_technical/DATABASE_PHASE1.sql` |
| `DOCS_INDEX.md` | retired | replaced by `docs/README.md` and `docs/00_meta/AGENT_OPERATING_RULES.md` |
| `DOMAIN_MODEL.md` | duplicated copy | `docs/01_definition/DOMAIN_MODEL.md` |
| `KNOWN_ISSUES.md` | incorporated | `docs/02_execution/KNOWN_ISSUES.md` |
| `NEXT_STEPS.md` | incorporated | `docs/02_execution/07_progress.md` and `docs/02_execution/09_backlog.md` |
| `NEXT_STEPS.md.bak` | retired | obsolete backup, retained only for history |
| `PRD.md` | duplicated copy | `docs/01_definition/PRD.md` |
| `PROJECT_EVOLUTION.md` | incorporated | `docs/02_execution/07_progress.md` and `docs/02_execution/08_decisions_log.md` |
| `README_api.md` | retired | empty placeholder; superseded by `docs/04_technical/API_PLAN.md` and FastAPI `/docs` |
| `README_business.md` | retired | scratch SQL notes; superseded by `docs/04_technical/README.md` and database docs |
| `README_database.md` | retired | empty placeholder; superseded by `docs/04_technical/README.md` |
| `README_human.md` | incorporated | `docs/01_definition/PRODUCT_OVERVIEW.md` |
| `README_technical.md` | retired | empty placeholder; superseded by `docs/04_technical/README.md` |
| `ROADMAP.md` | incorporated | `docs/02_execution/09_backlog.md` |
| `TASK_ENGINE.md` | incorporated | `docs/01_definition/OPERATIONAL_MODEL.md` |
| `UI_MODULES.md` | incorporated | `docs/01_definition/UI_SURFACES.md` |
| `VALIDATION_21_04_2026.md` | duplicated copy | `docs/03_validation/VALIDATION_21_04_2026.md` |

---

## Archive Policy

`docs/legacy/` is read-only archive material.

Do not:

- update legacy files as active documentation
- add new sources of truth here
- prefer legacy over the canonical docs tree

If new legacy cleanup is needed, update this file and the canonical target docs together.

