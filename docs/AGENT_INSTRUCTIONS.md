# Agent Development Instructions

This document contains consolidated rules and principles for developing the Event Operations Platform. All development work must adhere to these guidelines.

---

## Core Architectural Principles

### 1. Modular Monolith
- The system is a **single application** with clearly separated domain modules
- Each module has its own models, schemas, services, and routers
- Modules communicate through service layer, not direct database access
- Module boundaries must be respected — no cross-module model imports in business logic
- Prepare for future service extraction but don't prematurely optimize

### 2. Hotel vs Event Separation
**Critical Concept**: This is the foundation of the entire system.

- **Hotel** = persistent physical infrastructure (rooms, spaces, kitchens, tables)
  - Hotels exist independently of events
  - A single hotel can host multiple events over time
  - Hotel data is reusable across events
  
- **Event** = time-bound operational instance linked to a hotel
  - Events have start and end dates
  - Events reference hotel infrastructure but add operational layer
  - Events contain: guests, reservations, tasks, schedule, configuration
  
- **Operation** = real-time execution layer
  - Tasks, staff assignments, status updates happen in operational layer
  - Tasks can reference hotel spaces/rooms but belong to an event
  - Operational data is event-scoped

**Example**:
```
Hotel "Grand Palace" (persistent)
  ├─ Event "Pessach 2026" (April 12-20, 2026)
  │   ├─ Guests, Reservations, Tasks, Schedule
  │   └─ Uses Hotel's rooms, spaces, tables
  └─ Event "Sukkot 2026" (October 3-10, 2026)
      ├─ Different guests, different tasks, different schedule
      └─ Uses same Hotel infrastructure
```

### 3. Task-Centric Operations
- Tasks are the primary execution mechanism
- Tasks link to events, spaces, rooms, teams, staff members
- Tasks have priorities (critical, high, medium, low)
- Tasks have lifecycle (pending → in_progress → completed / cancelled)
- Task status changes must be tracked in history
- Comments and attachments belong to tasks

### 4. Layer Separation

**Backend layers (must be kept separate):**
```
Router Layer (api/)
   ↓ receives HTTP requests, validates input via schemas
Service Layer (services/ or modules/{module}/service.py)
   ↓ contains business logic, orchestrates operations
Data Layer (models/, db/)
   ↓ persistence, database operations
```

**Rules:**
- Routers **must not** contain business logic (only validation and response formatting)
- Services **must not** know about HTTP (no Request, Response objects in service functions)
- Models **must not** contain business logic (only data structure and relationships)
- Schemas are for validation/serialization, not business logic

### 5. Clean Code Principles
- **Clarity over cleverness** — code should be readable
- **Explicit over implicit** — no magic, clear naming
- **Separation of concerns** — each function does one thing
- **Type hints everywhere** — Python type hints, TypeScript strict mode
- **No god objects** — keep classes and functions focused
- **DRY but not at the expense of clarity** — avoid premature abstraction

---

## Technology Stack Rules

### Backend (Python + FastAPI)

#### File Naming
- `snake_case` for all Python files
- Module files: `models.py`, `schemas.py`, `service.py`, `router.py`
- Utility files: descriptive names like `security.py`, `config.py`, `session.py`

#### Function/Variable Naming
- `snake_case` for functions and variables
- `PascalCase` for classes
- Prefix private with `_` (e.g., `_internal_helper()`)
- Descriptive names: `get_hotel_by_id()` not `get_ht()`

#### SQLAlchemy Models
- Inherit from `Base`
- Table name with `t_` prefix: `__tablename__ = "t_hotel"`
- Field names with `f_` prefix: `f_name = Column(String(150))`
- Use `CHAR(1)` for booleans with 'T'/'F' values: `f_is_active = Column(CHAR(1), default='T')`
- Always include `id = Column(Integer, primary_key=True)`
- Include timestamps where appropriate: `f_created_at`, `f_updated_at`
- Define relationships clearly with `relationship()` and `back_populates`

#### Pydantic Schemas
- Separate Create, Update, Response schemas
- Use Pydantic v2 syntax: `ConfigDict` instead of `Config` class
- Response schemas inherit from base and add computed fields

#### Service Layer
- Functions take `db: Session` as first parameter
- Return models or None, not HTTP responses
- Raise domain exceptions, not HTTP exceptions
- Keep functions pure and testable

#### Router Layer
- Use FastAPI dependency injection
- Use proper HTTP status codes
- Return Pydantic schemas, not ORM models directly
- Handle exceptions and return appropriate error responses

#### Authentication & Authorization
- Use JWT tokens (access + refresh)
- Store hashed passwords with bcrypt
- Dependency injection for current user: `current_user: User = Depends(get_current_user)`
- Role-based access control: `Depends(require_role("admin"))`
- Log sensitive actions in audit log

### Frontend (React + TypeScript)

#### File/Component Naming
- `PascalCase` for component files: `HotelList.tsx`, `TaskCard.tsx`
- `camelCase` for utility files: `api.ts`, `auth.service.ts`

#### Component Structure
- Functional components only (no class components)
- Use TypeScript for all components
- Props interfaces named `{ComponentName}Props`
- Export component as default

#### TypeScript Types
- Define types in `src/types/{module}.ts`
- Match backend schema structure (use same field names with `f_` prefix)
- Use `interface` for object shapes, `type` for unions/intersections
- Use strict null checks

#### State Management
- Use React hooks (useState, useEffect, useContext)
- Custom hooks for reusable logic: `useAuth`, `useApi`
- Context for global state (auth, theme)

#### Styling
- Tailwind utility classes preferred
- Component-specific styles in same file or module.css
- Consistent spacing scale (use Tailwind defaults)
- Responsive design: mobile-first approach

### Database (PostgreSQL)

#### Naming Conventions (strictly follow DATABASE_PHASE1.sql)
- Tables: `t_{module_name}` (e.g., `t_hotel`, `t_event`, `t_task`)
- Fields: `f_{field_name}` (e.g., `f_name`, `f_created_at`)
- Booleans: `CHAR(1)` with 'T'/'F' values (e.g., `f_is_active CHAR(1) DEFAULT 'T'`)
- Primary keys: `id SERIAL PRIMARY KEY`
- Foreign keys: `f_{table_name}_id` (e.g., `f_hotel_id`, `f_event_id`)
- Timestamps: `f_created_at TIMESTAMP DEFAULT NOW()`, `f_updated_at`

---

## Development Workflow

### 1. Feature Development Sequence
When implementing a new feature:

1. **Database First** - Define models, generate migration
2. **Schemas** - Create Pydantic validation schemas
3. **Service Layer** - Implement business logic + tests
4. **Router/API** - Create FastAPI endpoints
5. **Frontend Types** - Create TypeScript interfaces
6. **Frontend Service** - Implement API client
7. **Frontend Components** - Build UI
8. **Integration Test** - Test end-to-end

### 2. Git Workflow
- Commit frequently with descriptive messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Keep commits atomic (one logical change per commit)

### 3. Testing
- Write tests for service layer
- Test edge cases
- Use pytest fixtures for database setup
- Aim for >70% code coverage on business logic

### 4. Documentation
- Update relevant docs when making architectural changes
- Add docstrings to complex functions
- Update PROJECT_EVOLUTION.md for major decisions
- Update NEXT_STEPS.md as tasks are completed

---

## Module-Specific Rules

### Auth Module
- Never log passwords
- Always use constant-time comparison for tokens
- Implement token refresh before expiration
- Log authentication failures for security monitoring
- Audit log for user creation, role assignment

### Hotel Module
- Hotels are independent of events — no event_id in hotel tables
- Hotel infrastructure belongs to hotel
- HotelSpace is generic — specific usage is defined in EventSpace

### Events Module
- Events MUST have a hotel_id
- Event periods are relative to event dates
- EventSpace links event to hotel spaces
- EventConfiguration is key-value store

### Guests Module
- Guest groups represent families or booking units
- Guests are individuals within a group
- Reservations link groups to events with date ranges

### Rooms Module
- RoomAllocation links reservation + room + date range
- Always check availability before allocating
- Support partial stays
- Track checkin/checkout status separately

### Tasks Module
- Tasks always belong to an event
- Tasks can link to: spaces, rooms, teams, staff
- Priority: critical, high, medium, low
- Status: pending → in_progress → completed / cancelled
- Log status changes in TaskStatusHistory

---

## Quality Standards

### Code Quality
- Use `ruff` or `flake8` for Python, `eslint` for TypeScript
- Use `black` for Python, `prettier` for TypeScript
- No warnings

### Performance
- Paginate list endpoints (default 20, max 100)
- Use database indexes
- Avoid N+1 queries
- Optimize frontend bundle size

### Security
- Input validation on all endpoints
- SQL injection prevention (use ORM)
- XSS prevention
- CORS properly configured
- HTTPS required in production

---

## References

- [PRD.md](PRD.md) - Product requirements
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [DATABASE_PHASE1.sql](DATABASE_PHASE1.sql) - Database schema
- [API_PLAN.md](API_PLAN.md) - API endpoints
- [PROJECT_EVOLUTION.md](PROJECT_EVOLUTION.md) - Evolution log
- [NEXT_STEPS.md](NEXT_STEPS.md) - Task list

---

**Last Updated**: 2026-04-21  
**Version**: 1.0  
**Status**: Active
