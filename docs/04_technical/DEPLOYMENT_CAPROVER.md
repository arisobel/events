# CapRover Deployment Preparation

## Status

**Documented only. Not implemented yet.**

This file describes the target deployment model and the repository gaps that must be closed before a production CapRover deploy. No application code, Dockerfile, frontend build configuration, or CapRover configuration has been changed as part of this preparation.

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

### Current Limitations For CapRover

- `infrastructure/captain-definition` currently points only to `./backend/Dockerfile`.
- `captain-definition` is not at repository root, which is where CapRover normally expects it for direct repository deploys.
- `backend/Dockerfile` runs Uvicorn with `--reload`, which is development-oriented.
- The backend container does not run `alembic upgrade head` on startup.
- There is no production frontend Dockerfile or Nginx/static serving configuration.
- Frontend API discovery currently supports only `localhost`, GitHub Codespaces and fallback to `http://localhost:8000`.
- Backend CORS currently accepts Codespaces via regex and does not yet use production domain configuration in the active middleware.
- Redis is configured but not required by the current MVP flow.

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

For the current CapRover package format, run from the repository root:

```powershell
.\deploy-caprover.ps1
```

The script creates:

```text
dist/deploy-caprover-YYYYMMDD-HHMMSS.tar
```

Packaging behavior:

- stages files in a temporary directory
- copies `infrastructure/captain-definition` to the package root as `captain-definition`
- excludes `.git`, `dist`, `node_modules`, frontend build output, caches, `.env`, logs and pid files
- does not change application code or deployment configuration

Current limitation:

- the generated package follows the current `captain-definition`, which points to `./backend/Dockerfile`; it is not yet the final production-ready two-app deployment model.

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

- [ ] Root-level CapRover definition for backend or documented app-specific deploy path.
- [ ] Backend production command without `--reload`.
- [ ] Migration execution strategy.
- [ ] Production CORS configured.
- [ ] Frontend `VITE_API_URL` support.
- [ ] Frontend production Dockerfile/static serving.
- [ ] Production admin bootstrap strategy.
- [ ] Production `SECRET_KEY` configured.
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
