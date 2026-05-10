# Technical Documentation

Documentação técnica detalhada de implementação, schema de dados e APIs.

---

## 🗄️ Database Documentation

### [DATABASE_MODULES.md](DATABASE_MODULES.md)
Estrutura completa do banco de dados organizada por módulo.

**Conteúdo**:
- Schema de cada módulo
- Relações entre tabelas
- Campos e tipos
- Índices e constraints

**Use para**: Entender modelo de dados completo

---

### [DATABASE_PHASE1.sql](DATABASE_PHASE1.sql)
Schema SQL para Phase 1 (Core Modules).

**Tabelas (6 módulos)**:
- Auth (users, roles, audit)
- Hotel (hotels, spaces, rooms, kitchens, tables)
- Events (events, periods, configuration)
- Guests (groups, guests, reservations)
- Rooms (room allocations)
- Tasks (tasks, comments, history)

**Status**: ✅ Implementado via Alembic

---

### [DATABASE_FULL_DRAFT.sql](DATABASE_FULL_DRAFT.sql)
Schema SQL completo incluindo todos os módulos (Phase 1 + Phase 2+).

**Módulos adicionais**:
- Tables (alocação de mesas)
- Schedule (atividades)
- Religious (minyanim, shiurim)
- Staff (equipes, membros, turnos)
- Supervision (kanban)
- Kashrut (mashguichim, checklists)
- Logistics (fornecedores, entregas, equipamentos)
- Rules (regras de espaço e tempo)
- Lost & Found (itens perdidos/achados)

**Status**: ⏳ Draft para implementação futura

---

## 🔌 API Documentation

### [API_PLAN.md](API_PLAN.md)
Mapeamento completo de endpoints REST da API.

**Conteúdo**:
- Endpoints por módulo
- Métodos HTTP
- Request/Response schemas
- Autenticação necessária
- Status codes

**Use para**: Referência de endpoints disponíveis

### [DEVELOPMENT_CONVENTIONS.md](DEVELOPMENT_CONVENTIONS.md)
Convenções técnicas de implementação para backend, frontend e fluxo de desenvolvimento.

**Conteúdo**:
- separação por camadas
- convenções de naming
- fluxo sugerido de desenvolvimento
- expectativa de documentação e testes

**Use para**: Alinhar mudanças novas com os padrões ativos do repositório

---

## 📐 Database Conventions

### Naming Convention
- **Tabelas**: prefixo `t_` (ex: `t_user`, `t_hotel`)
- **Colunas**: prefixo `f_` (ex: `f_username`, `f_email`)

**Rationale**:
- Evita conflitos com SQL keywords
- Clareza visual
- Consistência

### ID Fields
- Tipo: `INTEGER` (auto-increment)
- Nome: `pk_id`
- Primary key de todas as tabelas

### Foreign Keys
- Nome: `fk_{table}_{field}`
- Exemplo: `fk_hotel_id` em `t_event`

### Timestamps
- Created: `f_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- Updated: `f_updated_at TIMESTAMP` (com trigger ou ORM)

### Soft Deletes
- Campo: `f_deleted_at TIMESTAMP NULL`
- Não implementado no MVP (hard deletes apenas)

---

## 🔧 Migration Strategy

### Tool: Alembic

**Workflow**:
```bash
# Criar nova migration
alembic revision --autogenerate -m "description"

# Aplicar migrations
alembic upgrade head

# Reverter última migration
alembic downgrade -1

# Ver histórico
alembic history
```

### Migrations Location
`/backend/alembic/versions/`

### Current State
- ✅ Initial migration: `1be60f7aface_initial_schema_with_6_core_modules.py`
- ✅ 22 tabelas criadas
- ✅ Database em sync com models

---

## 🏗️ SQLAlchemy Models

### Location
`/backend/app/modules/{module}/models.py`

### Base Class
`from app.db.base import Base`

### Example
```python
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Hotel(Base):
    __tablename__ = "t_hotel"
    
    pk_id = Column(Integer, primary_key=True, index=True)
    f_name = Column(String, nullable=False)
    f_city = Column(String)
    
    # Relationships
    events = relationship("Event", back_populates="hotel")
```

---

## 📡 API Conventions

### Base URL
- Local: `http://localhost:8000`
- Codespaces: `https://{codespace}-8000.app.github.dev`

### Authentication
- Type: JWT Bearer Token
- Header: `Authorization: Bearer {token}`
- Expiration: 30 days (configurable)

### Response Format
```json
{
  "id": 1,
  "f_field_name": "value",
  ...
}
```

### Error Format
```json
{
  "detail": "Error message"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🔍 Query Patterns

### Pagination (Future)
```python
# Not implemented yet
GET /items?skip=0&limit=10
```

### Filtering by Date Range
```python
# Events
GET /events?start_date=2026-05-01&end_date=2026-05-05

# Tasks
GET /events/{event_id}/tasks?created_after=2026-05-01
```

### Ordering (Future)
```python
# Not implemented yet
GET /tasks?order_by=priority&direction=desc
```

---

## 🧪 Testing Database

### Test Database
- Name: `events_db` (mesmo que dev - cuidado!)
- Recommendation: Criar `events_test_db` separado

### Seed Data
Scripts de seed não implementados. Dados criados via API calls nos scripts de teste.

### Clean Database
```bash
# Dropa e recria todas as tabelas
cd backend
alembic downgrade base
alembic upgrade head
```

---

## 📊 Database Stats

- **Total Tables**: 22
- **Implemented Modules**: 6
- **Planned Modules**: 15
- **Database Size**: ~1MB (MVP com dados de teste)
- **Migrations**: 1

---

## 🔐 Security Considerations

### Password Hashing
- Algorithm: bcrypt
- Rounds: 12 (configurável)

### SQL Injection Prevention
- ✅ SQLAlchemy ORM (parametrized queries)
- ✅ No raw SQL in application code

### Database Access
- ✅ User with limited permissions (não root)
- ❌ Row-level security (não implementado)

---

## 📚 Additional Resources

### SQLAlchemy Docs
https://docs.sqlalchemy.org/

### Alembic Docs
https://alembic.sqlalchemy.org/

### FastAPI DB Tutorial
https://fastapi.tiangolo.com/tutorial/sql-databases/

### PostgreSQL Docs
https://www.postgresql.org/docs/

---

## 🔄 Next Technical Documentation

### Planned
- [ ] API versioning strategy
- [ ] Caching layer documentation (Redis)
- [ ] WebSocket events documentation
- [ ] Performance optimization guide
- [ ] Deployment runbook

### As Needed
- [ ] Backup/restore procedures
- [ ] Database scaling strategy
- [ ] Index optimization guide
