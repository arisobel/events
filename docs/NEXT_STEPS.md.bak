# Next Steps

Current project phase: **Phase 0 - Bootstrap**

Last Updated: **April 21, 2026**

---

## Backend Tasks

### Infrastructure Setup
- [x] Create backend folder structure
- [ ] Complete requirements.txt with all dependencies
- [ ] Create backend/Dockerfile
- [ ] Create backend/.dockerignore
- [ ] Create backend/.gitignore

### Core Configuration
- [ ] Implement app/core/config.py (Pydantic Settings)
- [ ] Implement app/core/security.py (JWT + password hashing)
- [ ] Implement app/db/session.py (SQLAlchemy engine + SessionLocal)
- [ ] Implement app/db/base.py (Base + model imports)

### Database Migrations
- [ ] Initialize Alembic (alembic init)
- [ ] Configure alembic.ini
- [ ] Update alembic/env.py
- [ ] Create initial migration structure

### Module: auth
- [ ] models.py - User, Role, UserRole, AuditLog
- [ ] schemas.py - UserCreate, UserLogin, Token, UserResponse
- [ ] service.py - authenticate_user, create_user, log_audit
- [ ] router.py - POST /auth/login, GET /auth/me
- [ ] dependencies.py - get_current_user, require_role

### Module: hotel
- [ ] models.py - Hotel, HotelSpace, HotelRoom, HotelKitchen, HotelTable
- [ ] schemas.py - HotelCreate/Update/Response, etc.
- [ ] service.py - CRUD operations
- [ ] router.py - GET/POST /hotels, GET /hotels/{id}/spaces, etc.

### Module: events
- [ ] models.py - Event, EventPeriod, EventSpace, EventConfiguration
- [ ] schemas.py - EventCreate/Update/Response, etc.
- [ ] service.py - CRUD + period management
- [ ] router.py - GET/POST /events, periods endpoints

### Module: guests
- [ ] models.py - GuestGroup, Guest, Reservation, SpecialRequest
- [ ] schemas.py - full schema set
- [ ] service.py - group/guest/reservation management
- [ ] router.py - event-scoped endpoints

### Module: rooms
- [ ] models.py - RoomAllocation
- [ ] schemas.py - RoomAllocationCreate/Response
- [ ] service.py - allocate_room, check_availability
- [ ] router.py - allocation endpoints

### Module: tasks
- [ ] models.py - Task, TaskComment, TaskStatusHistory
- [ ] schemas.py - TaskCreate/Update/Response
- [ ] service.py - task management, status transitions
- [ ] router.py - task CRUD + comments

### Main Application
- [ ] Create app/main.py
- [ ] Configure CORS middleware
- [ ] Include all routers
- [ ] Add healthcheck endpoint
- [ ] Add root endpoint

### Database Migration
- [ ] Generate initial migration (alembic revision --autogenerate)
- [ ] Review migration
- [ ] Test migration up/down

### Testing
- [ ] Create tests/ structure
- [ ] Write conftest.py
- [ ] Write test_auth.py
- [ ] Write test_health.py

---

## Frontend Tasks

### Project Setup
- [x] Create frontend folder structure
- [ ] Create package.json
- [ ] Create frontend/Dockerfile (multi-stage)
- [ ] Create frontend/.dockerignore
- [ ] Create frontend/.gitignore

### Configuration Files
- [ ] vite.config.ts (with PWA plugin)
- [ ] tsconfig.json (strict mode)
- [ ] tailwind.config.js
- [ ] postcss.config.js

### Core Application
- [ ] src/main.tsx
- [ ] src/App.tsx
- [ ] src/styles/index.css

### Routing
- [ ] src/routes/index.tsx
- [ ] Public routes (login)
- [ ] Protected routes
- [ ] 404 fallback

### Authentication
- [ ] src/hooks/useAuth.tsx (AuthContext + provider)
- [ ] src/services/api.ts (axios instance)
- [ ] src/services/auth.service.ts

### API Services
- [ ] src/services/hotel.service.ts
- [ ] src/services/event.service.ts
- [ ] src/services/task.service.ts

### TypeScript Types
- [ ] src/types/auth.ts
- [ ] src/types/hotel.ts
- [ ] src/types/event.ts
- [ ] src/types/task.ts
- [ ] src/types/common.ts

### Layout Components
- [ ] src/components/Layout.tsx
- [ ] src/components/Header.tsx
- [ ] src/components/Sidebar.tsx
- [ ] src/components/Button.tsx
- [ ] src/components/Input.tsx
- [ ] src/components/Loading.tsx

### Pages
- [ ] src/pages/Login.tsx
- [ ] src/pages/Dashboard.tsx
- [ ] src/pages/Hotels/HotelList.tsx
- [ ] src/pages/Events/EventList.tsx
- [ ] src/pages/Tasks/TaskList.tsx (Staff PWA)

### PWA Configuration
- [ ] public/manifest.json
- [ ] public/icons/ (app icons)
- [ ] src/pwa/registerServiceWorker.ts

### Custom Hooks
- [ ] src/hooks/useApi.ts
- [ ] src/hooks/useLocalStorage.ts

---

## Infrastructure Tasks

### Docker Setup
- [ ] infrastructure/docker-compose.yml
  - [ ] postgres service
  - [ ] redis service
  - [ ] backend service
  - [ ] frontend service
- [ ] infrastructure/.env.example

### CapRover Deployment
- [ ] infrastructure/captain-definition

### Documentation
- [x] docs/PROJECT_EVOLUTION.md
- [x] docs/NEXT_STEPS.md
- [x] docs/AGENT_INSTRUCTIONS.md
- [ ] Update main README.md with setup instructions
- [ ] Create backend/README.md
- [ ] Create frontend/README.md

---

## Verification Checklist

### Backend Verification
- [ ] Backend starts without errors
- [ ] Database connection successful
- [ ] API docs accessible at /docs
- [ ] Healthcheck returns 200
- [ ] Can create user via API
- [ ] Can login and receive JWT
- [ ] Protected endpoints work
- [ ] Migrations execute

### Frontend Verification
- [ ] Frontend builds without errors
- [ ] Frontend accessible at localhost
- [ ] Login page renders
- [ ] Can login successfully
- [ ] Dashboard renders after login
- [ ] PWA manifest detected
- [ ] Service worker registers

### Integration Verification
- [ ] Frontend calls backend API
- [ ] CORS configured correctly
- [ ] Auth flow end-to-end
- [ ] Can CRUD hotels via UI
- [ ] Can CRUD events via UI
- [ ] Can CRUD tasks via UI

### Infrastructure Verification
- [ ] Docker Compose starts all services
- [ ] Services communicate
- [ ] PostgreSQL data persists
- [ ] Hot reload works (backend)
- [ ] Hot reload works (frontend)

---

## Phase 0 Completion Criteria

✅ Phase 0 complete when:

1. All backend core tasks completed
2. All frontend core tasks completed
3. All infrastructure tasks completed
4. All verification items pass
5. Documentation updated
6. Single command startup: `docker-compose up`
7. End-to-end user flow works (login → view → create)

---

**Current Progress**: 5% (documentation + basic structure)  
**Est. Completion**: End of Week 1
