# Project Evolution Log

## Initial State (April 21, 2026)

### Context
Repository created with complete documentation structure but no implementation code yet.

### Documentation Assets Created
- [README.md](../README.md) - high-level product vision
- [PRD.md](PRD.md) - Product Requirements Document
- [ARCHITECTURE.md](ARCHITECTURE.md) - technical architecture decisions
- [ROADMAP.md](ROADMAP.md) - phased development plan
- [DATABASE_MODULES.md](DATABASE_MODULES.md) - database structure by module
- [DATABASE_PHASE1.sql](DATABASE_PHASE1.sql) - Phase 1 SQL schema
- [DATABASE_FULL_DRAFT.sql](DATABASE_FULL_DRAFT.sql) - complete schema draft
- [API_PLAN.md](API_PLAN.md) - REST API endpoint mapping
- [UI_MODULES.md](UI_MODULES.md) - frontend module breakdown

### Current Project State
- **Status**: Documentation complete, implementation starting
- **Stage**: Phase 0 - Bootstrap
- **Focus**: Creating foundational structure for FastAPI backend + React PWA frontend

---

## Architectural Decisions Made

### 1. Architectural Style
**Decision**: Modular Monolith  
**Rationale**: 
- Simpler to develop and deploy for MVP
- Clear module boundaries prepare for future service extraction
- Single codebase reduces operational complexity
- Easier debugging and development workflow

### 2. Core Separation: Hotel vs Event
**Decision**: Hotel as persistent base infrastructure, Event as time-bound operational instance  
**Rationale**:
- Hotels are reusable across multiple events
- Events inherit structure from hotel but add operational layer
- Clear data model separation prevents coupling
- Supports multi-hotel, multi-event SaaS future

### 3. Technology Stack

#### Backend
- **Python 3.11+** - business rules, orchestration, future AI/automation
- **FastAPI** - performance, auto-docs, type hints, async support
- **SQLAlchemy** - mature ORM, supports complex relationships
- **PostgreSQL** - relational integrity, time-series queries, JSONB flexibility
- **Redis** - caching, session storage, realtime pub/sub
- **Alembic** - database migration versioning

#### Frontend
- **React 18** - component reusability, ecosystem maturity
- **TypeScript** - type safety, better developer experience
- **Vite** - fast builds, excellent DX, modern tooling
- **Tailwind CSS** - utility-first, rapid UI development
- **React Router v6** - client-side routing
- **Axios** - HTTP client with interceptors

#### Mobile Strategy
- **PWA first** - no app store friction, instant updates, works on all devices
- **Service Worker** - offline capability, background sync
- **React Native** - optional Phase 3+ for native features

#### Infrastructure
- **Docker** - containerization, reproducible environments
- **Docker Compose** - local development orchestration
- **CapRover** - simple PaaS deployment, automatic HTTPS
- **Let's Encrypt** - free SSL certificates (required for PWA)

### 4. Module Architecture
**Decision**: 15 domain modules with clear boundaries

**Core Modules (Phase 0-1)**:
1. `auth` - authentication, authorization, roles, audit
2. `hotel` - hotel infrastructure, spaces, rooms, kitchens, tables
3. `events` - event instances, periods, configuration
4. `guests` - groups, individual guests, reservations
5. `rooms` - room allocations with date ranges
6. `tasks` - operational tasks, comments, status tracking

**Expansion Modules (Phase 2+)**:
7. `tables` - table allocations by period
8. `schedule` - activities, categories, timeline
9. `religious` - minyanim, prayers, shiurim
10. `staff` - teams, members, shifts
11. `supervision` - kanban, workload management
12. `kashrut` - mashguichim, supervision schedules, checklists
13. `logistics` - suppliers, deliveries, equipment
14. `rules` - space rules, time restrictions, access control
15. `lost_found` - lost/found items, claims, matching

### 5. Backend Layer Structure
**Decision**: Clean architecture with separation of concerns

```
api/          → FastAPI routers, request/response handling
core/         → configuration, security, cross-cutting concerns
db/           → database session, base classes
models/       → SQLAlchemy ORM models (data layer)
schemas/      → Pydantic models (validation/serialization)
services/     → business logic layer
modules/      → domain-specific code organized by business module
  {module}/
    models.py    → SQLAlchemy models for this domain
    schemas.py   → Pydantic schemas for this domain
    service.py   → business logic functions
    router.py    → FastAPI routes
```

**Rationale**:
- Clear separation prevents mixing transport layer with business logic
- Each module is self-contained (easier to understand and test)
- Service layer can be reused by API, CLI, background jobs
- Schemas enforce validation at API boundary

### 6. Database Naming Convention
**Decision**: Prefix-based convention from existing schema

- Tables: `t_{module_name}` (e.g., `t_hotel`, `t_event`)
- Fields: `f_{field_name}` (e.g., `f_name`, `f_created_at`)
- Booleans: `CHAR(1)` with 'T'/'F' values (e.g., `f_is_active`)
- Timestamps: `f_created_at`, `f_updated_at` (TIMESTAMP DEFAULT NOW())
- IDs: `id SERIAL PRIMARY KEY`

**Rationale**:
- Consistency with DATABASE_PHASE1.sql documentation
- Clear visual distinction between tables and application code
- Prevents conflicts with SQL reserved words
- Legacy compatibility if needed

### 7. Authentication & Authorization
**Decision**: JWT tokens + Role-Based Access Control (RBAC)

- JWT tokens with python-jose[cryptography]
- Password hashing with passlib + bcrypt
- Refresh token support
- Role-based permissions via `t_user_role` join table
- Audit logging for critical actions via `t_audit_log`

**Rationale**:
- Stateless authentication scales well
- Industry standard security practices
- Flexible permission model for different user types
- Compliance and accountability via audit trail

---

## Implementation Phases

### Phase 0: Bootstrap (Current - Week 1)
**Goal**: Establish project structure and core infrastructure

**Status**: In Progress - Started April 21, 2026

**Backend**:
- ✅ Project structure with 15 module folders
- 🔄 FastAPI app with core configuration
- 🔄 SQLAlchemy database setup
- 🔄 Alembic migrations
- 🔄 Docker setup

**Frontend**:
- 🔄 React + TypeScript + Vite project
- 🔄 Tailwind CSS configuration
- 🔄 React Router setup
- 🔄 PWA configuration (manifest, service worker)
- 🔄 Base layout components

**Infrastructure**:
- 🔄 docker-compose.yml (postgres, redis, backend, frontend)
- 🔄 Dockerfile for backend and frontend
- 🔄 .env.example with all required variables
- 🔄 CapRover captain-definition

**Deliverables**:
- Running application accessible at localhost
- Database with initial schema
- API documentation at /docs
- Frontend login page
- PWA installable

---

## Decision Log

### 2026-04-21: Initial Bootstrap Decision
**Decision**: Implement 6 core modules in Phase 0 (auth, hotel, events, guests, rooms, tasks)  
**Alternatives Considered**: Implement all 15 modules at once  
**Rationale**: Incremental approach validates architecture early, allows iteration, maintains focus  
**Status**: Approved

### 2026-04-21: Database Convention
**Decision**: Use `t_` and `f_` prefixes from DATABASE_PHASE1.sql  
**Alternatives Considered**: Standard naming without prefixes  
**Rationale**: Consistency with existing documentation, prevents SQL reserved word conflicts  
**Status**: Approved

### 2026-04-21: PWA-First Mobile Strategy
**Decision**: Build PWA before considering React Native  
**Alternatives Considered**: React Native from start, Flutter  
**Rationale**: Lower friction for staff adoption, instant updates, single codebase, works everywhere  
**Status**: Approved

### 2026-04-21: Modular Monolith
**Decision**: Start with single backend application, clear module boundaries  
**Alternatives Considered**: Microservices from day one  
**Rationale**: Simpler for MVP, easier debugging, clear extraction path if needed later  
**Status**: Approved

---

## Evolution Tracking

This document will be updated as the project evolves. Each significant decision, architectural change, or phase completion will be logged here.

**Last Updated**: 2026-04-21  
**Current Phase**: Phase 0 - Bootstrap (In Progress)  
**Next Milestone**: Complete Phase 0 implementation
