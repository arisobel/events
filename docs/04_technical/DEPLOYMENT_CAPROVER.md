# CapRover Deployment

## Status

**Infraestrutura implementada. Primeiro deploy em staging pendente.**

Atualizado em 2026-06-30: todos os arquivos de infraestrutura de produção foram criados. O próximo passo é criar as apps no CapRover e executar o primeiro deploy.

---

## Current Repository State

### Present

- `infrastructure/captain-definition` exists.
- `backend/Dockerfile` exists and starts FastAPI with Uvicorn.
- `deploy-caprover.ps1` exists and creates timestamped `.tar` packages in `/dist`.
- `infrastructure/docker-compose.yml` exists for local/dev PostgreSQL, Redis and backend.
- Backend exposes `/`, `/health`, `/docs` and `/redoc`.
- Backend configuration is environment-driven through `backend/app/core/config.py`.
- Frontend is a Vite React app with `npm run build`.

### Implemented (2026-06-30)

- `captain-definition` criado na raiz do repositório — aponta para `./Dockerfile` (app `events-api`).
- `Dockerfile` criado na raiz — backend produção com caminhos corretos para contexto CapRover (`backend/` como subpasta), sem `--reload`, com `alembic upgrade head` no startup.
- `frontend/Dockerfile` criado — multi-stage build: Node 20 para `npm ci && npm run build`, depois Nginx Alpine para servir `/dist`.
- `frontend/nginx.conf` criado — SPA fallback para React Router, cache headers para assets estáticos.
- `frontend/captain-definition` criado — aponta para `./frontend/Dockerfile` (app `events-web`).
- `build.ps1` criado na raiz — gera tarball timestampado em `/dist/`, aceita `-Target api|web`; o mais recente fica na raiz de `/dist/` e os anteriores vão para `/dist/legacy/` (até 5 de cada target).
- CORS corrigido em `backend/app/main.py` — usa `settings.CORS_ORIGINS` (env var) combinado com regex Codespaces; antes estava hardcoded para Codespaces only e ignorava produção.
- `VITE_API_URL` adicionado em `frontend/src/services/api.ts` — tem prioridade sobre detecção de hostname; basta setar o build arg no CapRover.
- Redis adiado — confirmado que o MVP atual não depende de Redis; será adicionado como `events-redis` (one-click app) em ciclo futuro.

### Pending

- Criar apps no CapRover (events-postgres, events-api, events-web).
- Configurar variáveis de ambiente para `events-api`.
- Primeiro deploy e validação de `/health`.
- Criar usuário admin de produção.
- Adicionar Redis quando necessário.

---

## Target CapRover Topology

Use separate CapRover apps:

| App | Purpose | Suggested CapRover app name |
| --- | --- | --- |
| Backend | FastAPI API | `events-api` |
| Frontend | Vite static build served by Nginx | `events-web` |
| PostgreSQL | Managed by CapRover one-click app or external DB | `events-postgres` |
| Redis | Optional for current MVP; needed for future cache/realtime | `events-redis` |

Recommended public domains:

- API: `https://api.events.example.com`
- Web: `https://events.example.com`

CapRover should terminate HTTPS through Let's Encrypt.

---

## Backend Deployment Requirements

### Required Environment Variables

Set these in CapRover for the backend app:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
SECRET_KEY=<strong-random-production-secret>
DEBUG=false
CORS_ORIGINS=["https://events.example.com"]
REDIS_URL=redis://HOST:6379/0
```

Notes:

- `SECRET_KEY` must not use the repository default.
- `DATABASE_URL` must point to the production PostgreSQL service.
- `CORS_ORIGINS` should contain the final frontend origin.
- If Redis is not deployed yet, keep `REDIS_URL` documented but verify whether runtime code requires it before deploy.

### Required Code/Infrastructure Changes Before Deploy

Not implemented yet:

- Move or copy a production `captain-definition` to the repository root for the selected app.
- Replace backend production command with a non-reload Uvicorn command, for example:

```text
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- Decide where migrations run: manual release step in CapRover console, or startup entrypoint that runs `alembic upgrade head` before Uvicorn.
- Update active CORS middleware to allow production frontend domains.
- Confirm `/health` is sufficient for CapRover health checks.

---

## Frontend Deployment Requirements

### Required Build-Time Configuration

The frontend needs a production API URL mechanism before deploy.

Recommended environment variable:

```text
VITE_API_URL=https://api.events.example.com
```

Required change before deploy:

- Update frontend API base URL resolution to prefer `import.meta.env.VITE_API_URL`.
- Keep localhost and Codespaces detection for development.

### Required Infrastructure

Not implemented yet:

- Add a frontend production Dockerfile.
- Build with `npm ci` and `npm run build`.
- Serve `frontend/dist` with Nginx or another static server.
- Add SPA fallback to `index.html` so React Router routes work on refresh.

---

## Database And Migration Plan

### Initial Deploy

1. Create PostgreSQL app/service in CapRover.
2. Create production database and user.
3. Set `DATABASE_URL` in the backend app.
4. Run `alembic upgrade head` inside the backend app/container.
5. Create the initial admin user through a production-safe seed/admin command.

### Open Gap

The repository currently has `backend/scripts/ensure_dev_admin.py`, but that is a development helper. A production admin bootstrap flow must be defined before real deploy.

---

## CapRover Deployment Sequence

### Local Packaging

Use `build.ps1` (criado em 2026-06-30) para gerar os tarballs de produção:

```powershell
# Tarball para events-api
.\build.ps1 -Target api

# Tarball para events-web
.\build.ps1 -Target web
```

Os arquivos gerados ficam em `dist/`:

```text
dist/events-api-YYYYMMDD-HHMMSS.tar
dist/events-web-YYYYMMDD-HHMMSS.tar
```

Comportamento:

- copia o projeto inteiro para um diretório temporário (via `robocopy`)
- exclui `.git`, `dist`, `node_modules`, caches, `.env`, logs e pid files
- copia o `captain-definition` correto para a raiz do pacote (raiz para api, `frontend/captain-definition` para web)
- cria o `.tar` com `tar.exe` e move para `dist/`
- mantém o tarball mais recente de cada target na raiz de `dist/`; arquiva os anteriores em `dist/legacy/`, guardando no máximo 5 de cada target

O script `deploy-caprover.ps1` (legado) continua existindo mas não deve ser usado para novos deploys — ele aponta para `infrastructure/captain-definition` que usa `./backend/Dockerfile` (contexto de desenvolvimento).

### Preparation

1. Create DNS records for API and frontend.
2. Create CapRover apps: `events-api`, `events-web`, `events-postgres` and optionally `events-redis`.
3. Enable HTTPS for API and frontend apps.
4. Configure backend environment variables.
5. Configure frontend build-time API URL.

### Backend First Deploy

1. Deploy backend image/app.
2. Run migrations.
3. Hit `https://api.events.example.com/health`.

Expected:

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

4. Confirm API docs at `https://api.events.example.com/docs`.

### Frontend Deploy

1. Deploy frontend static app.
2. Open `https://events.example.com`.
3. Login with the production admin user.
4. Validate the MVP path: Hotels, Events, Guests/Reservations, Room Allocations and Tasks.

---

## Production Readiness Checklist

### Must Have Before First Real Deploy

- [x] Root-level CapRover definition for backend (`captain-definition` + `./Dockerfile`).
- [x] Backend production command without `--reload` (`uvicorn --workers 2`).
- [x] Migration execution strategy (automático no startup: `alembic upgrade head`).
- [x] Production CORS configured (`settings.CORS_ORIGINS` via env var `CORS_ORIGINS`).
- [x] Frontend `VITE_API_URL` support (build arg no `frontend/Dockerfile`, checado em `api.ts`).
- [x] Frontend production Dockerfile/static serving (`frontend/Dockerfile` + nginx + SPA fallback).
- [ ] Production admin bootstrap strategy (criar via console CapRover após primeiro deploy).
- [ ] Production `SECRET_KEY` configured (setar nas env vars do CapRover antes do deploy).
- [ ] PostgreSQL persistence/backup plan.

### Should Have Before Pilot Use

- [ ] GitHub Actions for backend tests and frontend build.
- [ ] API-level integration tests.
- [ ] Backup/restore runbook.
- [ ] Basic access log and error log review process.
- [ ] Explicit rollback procedure.

---

## Current Recommendation

Do not deploy the current repository directly to CapRover as production.

The safest next implementation step is to make deployment explicit as two apps:

1. Backend API app with production Uvicorn command and migrations plan.
2. Frontend static app with `VITE_API_URL` and SPA fallback.

After those are implemented, validate in a staging CapRover app before using real event data.
