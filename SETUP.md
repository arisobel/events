# Event Operations Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Docker Desktop 20.10+
- Git
- (Optional) Python 3.11+ for local development
- (Optional) Node.js 18+ for frontend development

### 1. Clone the Repository
```bash
git clone https://github.com/arisobel/events.git
cd events
```

### 2. Setup Environment Variables
```bash
cd infrastructure
cp .env.example .env
# Edit .env and update SECRET_KEY and other values
```

### 3. Start Services with Docker Compose
```bash
cd infrastructure
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 8000)

### 4. Run Database Migrations
```bash
docker exec -it events_backend /bin/sh
cd /app
alembic upgrade head
exit
```

### 5. Create Initial User
```bash
# Access the backend container
docker exec -it events_backend python
```

```python
from app.db.session import SessionLocal
from app.modules.auth import service, schemas

db = SessionLocal()

# Create admin user
user_data = schemas.UserCreate(
    f_username="admin",
    f_email="admin@events.com",
    password="admin123"  # Change this!
)
user = service.create_user(db, user_data)

# Create admin role
role_data = schemas.RoleCreate(f_name="admin", f_notes="Administrator role")
role = service.create_role(db, role_data)

# Assign role to user
service.assign_role_to_user(db, user.id, role.id)

print(f"User created: {user.f_username}")
db.close()
exit()
```

### 6. Access the Application

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## 📁 Project Structure

```
events/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API router aggregation
│   │   ├── core/           # Configuration and security
│   │   ├── db/             # Database session and base
│   │   ├── modules/        # Domain modules
│   │   │   ├── auth/       # Authentication & authorization
│   │   │   ├── hotel/      # Hotel infrastructure
│   │   │   ├── events/     # Event management
│   │   │   ├── guests/     # Guest and reservation management
│   │   │   ├── rooms/      # Room allocation
│   │   │   └── tasks/      # Task management
│   │   └── main.py         # FastAPI application entry point
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container definition
│
├── frontend/               # React + TypeScript frontend (TODO)
│   └── src/
│
├── infrastructure/         # Deployment configuration
│   ├── docker-compose.yml  # Multi-container orchestration
│   ├── .env.example        # Environment variables template
│   └── captain-definition  # CapRover deployment config
│
└── docs/                   # Documentation
    ├── ARCHITECTURE.md     # Technical architecture
    ├── PRD.md             # Product requirements
    ├── ROADMAP.md         # Development roadmap
    ├── API_PLAN.md        # API endpoint planning
    ├── DATABASE_PHASE1.sql # Database schema
    ├── AGENT_INSTRUCTIONS.md # Development guidelines
    ├── PROJECT_EVOLUTION.md  # Evolution log
    └── NEXT_STEPS.md      # Current task list
```

---

## 🛠️ Development

### Backend Development

#### Run Backend Locally (without Docker)
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://events_user:events_pass@localhost:5432/events_db"
export SECRET_KEY="your-secret-key"

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Create New Migration
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

#### Run Tests
```bash
cd backend
pytest
```

### Database Management

#### Access PostgreSQL
```bash
docker exec -it events_postgres psql -U events_user -d events_db
```

#### View Tables
```sql
\dt
```

#### Reset Database
```bash
docker-compose down -v
docker-compose up -d
docker exec -it events_backend alembic upgrade head
```

---

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - User login (returns JWT tokens)
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info
- `POST /auth/register` - Register new user

### Hotels
- `GET /hotels` - List all hotels
- `POST /hotels` - Create hotel
- `GET /hotels/{id}` - Get hotel details
- `PUT /hotels/{id}` - Update hotel
- `GET /hotels/{id}/spaces` - Get hotel spaces
- `GET /hotels/{id}/rooms` - Get hotel rooms
- `GET /hotels/{id}/kitchens` - Get hotel kitchens
- `GET /hotels/{id}/tables` - Get hotel tables

### Events
- `GET /events` - List all events
- `POST /events` - Create event
- `GET /events/{id}` - Get event details
- `PUT /events/{id}` - Update event
- `GET /events/{id}/periods` - Get event periods
- `POST /events/{id}/periods` - Create event period

### Guests
- `GET /events/{id}/groups` - List guest groups for event
- `POST /events/{id}/groups` - Create guest group

### Room Allocations
- `POST /room-allocations` - Allocate room to reservation

### Tasks
- `GET /events/{event_id}/tasks` - List tasks for event
- `POST /events/{event_id}/tasks` - Create task
- `GET /tasks/{id}` - Get task details
- `POST /tasks/{id}/status` - Update task status
- `POST /tasks/{id}/comments` - Add comment to task

---

## 🔐 Authentication

All endpoints except `/auth/login`, `/auth/register`, `/health`, and `/` require authentication.

### Login Example
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Use Token in Requests
```bash
curl -X GET "http://localhost:8000/hotels" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs events_backend

# Check if database is ready
docker logs events_postgres

# Restart services
docker-compose restart
```

### Database connection refused
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check environment variables
docker exec events_backend env | grep DATABASE_URL
```

### Migrations fail
```bash
# Reset alembic
docker exec -it events_backend alembic downgrade base
docker exec -it events_backend alembic upgrade head

# If still failing, check model imports in app/db/base.py
```

---

## 🚢 Deployment

### CapRover Deployment
1. Install CapRover on your server
2. Create a new app in CapRover
3. Push repository:
```bash
git remote add caprover ssh://captain@YOUR_SERVER
git push caprover main
```

### Environment Variables in Production
Set these in your deployment platform:
- `SECRET_KEY` - Strong random string (32+ chars)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `CORS_ORIGINS` - Allowed frontend origins

---

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and design decisions
- [PRD](docs/PRD.md) - Product requirements and scope
- [Roadmap](docs/ROADMAP.md) - Development phases and timeline
- [Agent Instructions](docs/AGENT_INSTRUCTIONS.md) - Development guidelines
- [Project Evolution](docs/PROJECT_EVOLUTION.md) - Decision log and progress
- [Next Steps](docs/NEXT_STEPS.md) - Current tasks and priorities

---

## 🤝 Contributing

See [docs/AGENT_INSTRUCTIONS.md](docs/AGENT_INSTRUCTIONS.md) for development guidelines and code standards.

---

## 📝 License

[Add your license here]

---

## 👥 Team

- Product Owner: [Name]
- Tech Lead: [Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]

---

## 📞 Support

For questions or issues, contact: [email]
