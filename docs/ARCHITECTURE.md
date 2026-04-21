# Architecture

## 1. Architectural Style
Modular monolith.

The system should start as a single backend application with clearly separated domain modules. This keeps the implementation simpler while preserving a path for future service extraction if needed.

## 2. Core Technical Stack

### Backend
- Python
- FastAPI
- SQLAlchemy

### Database
- PostgreSQL

### Realtime and cache
- Redis
- FastAPI WebSockets

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Mobile strategy
- PWA first
- React Native optional later

### Infrastructure
- Docker
- CapRover

## 3. Why This Stack
- Python is a good fit for business rules, orchestration, and future automation/intelligence
- FastAPI provides speed, structure, typing, and API documentation
- PostgreSQL is strong for relational complexity and time-based queries
- React + TypeScript provides maintainable and scalable UI
- PWA reduces friction for staff adoption
- CapRover supports fast MVP deployment with HTTPS

## 4. Main Architectural Layers
- API layer
- Domain/service layer
- Persistence layer
- Frontend UI layer
- PWA execution layer for staff

## 5. Proposed Backend Module Boundaries
- hotel
- events
- guests
- rooms
- tables
- schedule
- religious
- staff
- tasks
- supervision
- kashrut
- logistics
- rules
- lost_found
- auth

## 6. Frontend Areas
- admin/backoffice
- operations dashboard
- staff PWA
- supervisor dashboard
- future guest portal

## 7. Realtime Scenarios
- critical tasks created
- task status changes
- room status changes
- schedule changes
- supervision alerts
- logistics updates

## 8. Security
- JWT authentication
- role-based access control
- audit logs

## 9. Deployment Model
### Services
- backend API
- frontend static site via Nginx
- PostgreSQL
- Redis

### HTTPS
Mandatory for PWA installation and service worker support. Handled through CapRover and Let's Encrypt.

## 10. Evolution Strategy
Start with a modular monolith. Avoid premature microservices. Extract services only when operational and scaling needs justify it.
