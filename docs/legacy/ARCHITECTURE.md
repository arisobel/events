# 🏗️ ARCHITECTURE — Event Operations Platform

## 1. Architectural Style

The system follows a **modular monolith architecture**.

It is a single deployable application structured into well-defined modules aligned with business domains.

This approach provides:

- simplicity of deployment
- strong domain boundaries
- lower operational complexity than microservices

The system can evolve into microservices in the future if necessary.

---

## 2. Core Principles

The architecture follows these principles:

- high cohesion within modules
- low coupling between modules
- clear domain boundaries
- explicit interfaces between modules

Each module:

- owns its business logic
- owns its data (logically, even within same DB)
- exposes a clear interface

This aligns with modular monolith best practices, where modules encapsulate business capabilities and communicate through defined contracts :contentReference[oaicite:0]{index=0}

---

## 3. Core Technical Stack

### Backend
- Python
- FastAPI
- SQLAlchemy

### Database
- PostgreSQL

### Realtime and Cache
- Redis
- WebSockets (FastAPI)

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Mobile Strategy
- PWA-first approach
- React Native optional (future)

### Infrastructure
- Docker
- CapRover

---

## 4. Why This Stack

- Python → strong for orchestration and business rules
- FastAPI → fast, typed, structured APIs
- PostgreSQL → ideal for relational and time-based data
- React + TS → scalable UI
- PWA → low friction for staff usage
- CapRover → fast deployment + HTTPS

---

## 5. System Layers

The system is organized into:

- API Layer (HTTP / WebSocket)
- Domain Layer (business logic)
- Persistence Layer (database access)
- Frontend UI Layer
- PWA Execution Layer (staff interface)

---

## 6. Backend Module Boundaries

Modules are aligned with domain contexts:

- auth
- hotel
- events
- guests
- families
- groups
- rooms
- tables
- schedule
- religious
- staff
- tasks (CORE)
- supervision (mashguichim)
- kashrut
- logistics
- rules
- lost_found

---

## 7. Module Design Rules

- modules must not access each other's database tables directly
- modules interact via service interfaces
- avoid cross-module coupling
- each module should be independently understandable

Modules represent **future service boundaries**.

---

## 8. Relation to Domain Model

This architecture follows `DOMAIN_MODEL.md`.

- each module maps to domain entities
- domain rules live inside modules
- no business logic outside domain layer

---

## 9. Core System Focus

The system is centered on:

> **execution engine (Tasks + Staff)**

All other modules support this core.

---

## 10. Frontend Structure

Main areas:

- admin/backoffice
- operations dashboard
- staff PWA (primary interface)
- supervisor dashboard
- future guest portal

---

## 11. Realtime Scenarios

Realtime updates include:

- task creation
- task status changes
- room status updates
- schedule updates
- supervision alerts
- logistics changes

---

## 12. Security

- JWT authentication
- role-based access control (RBAC)
- audit logging

---

## 13. Deployment Model

### Services

- backend API
- frontend static (Nginx)
- PostgreSQL
- Redis

### HTTPS

Mandatory for:

- PWA installation
- service workers

Handled via CapRover + Let's Encrypt.

---

## 14. Evolution Strategy

Start with modular monolith.

Avoid premature microservices.

Extract services only when:

- clear scaling need
- operational bottlenecks
- team structure requires it

This follows the industry pattern:

> modular monolith first, evolve later :contentReference[oaicite:1]{index=1}

---

## 15. Key Insight

This is not a CRUD system.

It is:

> a real-time operational execution platform

---

## 16. Final Principle

> Domain drives architecture  
> Architecture drives code  
> Code follows rules