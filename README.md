# 🏨 Event Operations Platform  
### Hospitality, Kosher & Complex Event Management System


PT-br para leigos:

Imagine que um evento de Pessach em hotel funciona como uma pequena cidade temporária.

Tem:

 - centenas de pessoas entrando e saindo em dias diferentes
  - quartos sendo ocupados e liberados o tempo todo
   - refeições com horários e lugares definidos
    - rezas em diferentes estilos (ashkenazi, sefaradi)
     - aulas, shows, atividades infantis
      - regras específicas (ex.: piscina pode ou não pode, horários separados)
       - equipes trabalhando em várias áreas ao mesmo tempo

       Hoje, grande parte disso é coordenado com:

        - planilhas
         - papel
          - grupos de WhatsApp
           - comunicação verbal

           👉 Resultado: confusão, retrabalho e erros.

           🧠 O que esse projeto faz

           Esse projeto é um sistema para organizar tudo isso em um só lugar.

           Ele funciona como um “cérebro digital” do evento.

           🧭 Explicando de forma simples
           📅 1. Ele organiza o que está acontecendo

           Em vez de um papel com horários, o sistema mostra:

           o que está acontecendo agora
           o que vai acontecer depois
           onde está acontecendo
           para quem é (crianças, adultos, etc.)
           🏨 2. Ele controla quem está no hotel
           quem chegou
           quem vai embora
           quem está em qual quarto
           quando o quarto precisa ser limpo
           🍽️ 3. Ele organiza as refeições
           quem senta em qual mesa
           mudanças de pessoas ao longo dos dias
           ajustes conforme entram e saem famílias
           👨‍🍳 4. Ele ajuda a equipe a trabalhar melhor

           Cada funcionário abre um aplicativo simples no celular e vê:

           👉 “o que eu preciso fazer agora”

           Por exemplo:

           limpar quarto 214
           preparar sala para palestra
           organizar jantar

           E pode marcar quando terminou.

           🕍 5. Ele organiza a parte religiosa
           horários de reza
           diferentes minianim
           quem vai receber aliá
           aulas (shiurim)
           🏊 6. Ele controla regras do evento

           Por exemplo:

           piscina aberta ou fechada
           horários separados para homens e mulheres
           o que pode ou não pode em cada momento

           O sistema consegue dizer:

           👉 “agora pode usar isso”
           👉 “agora não pode”

           📱 7. Funciona no celular (sem instalar app)

           O sistema abre como um site, mas funciona como aplicativo.

           Então qualquer funcionário pode usar rapidamente.

           🧳 8. Tem até achados e perdidos

           Se alguém perder algo:

           registra no sistema
           alguém que encontrou também registra
           o sistema ajuda a conectar
           💡 Resumindo em uma frase

           É um sistema que organiza pessoas, horários, espaços e tarefas para que um evento complexo funcione sem caos.

           🧠 Analogia simples

           Pense nisso como:

           um pouco de agenda
           um pouco de mapa do hotel
           um pouco de lista de tarefas
           um pouco de central de controle

           Tudo junto.

           🎯 Por que isso é importante

           Sem isso:

           atrasos
           erros
           estresse
           má experiência para os hóspedes

           Com isso:

           organização
           previsibilidade
           melhor atendimento
           menos dependência de improviso
           🚀 O objetivo final

           Fazer com que o evento funcione como:

           uma operação bem coordenada, onde cada pessoa sabe exatamente o que fazer, quando e onde.

---

## 📌 Overview

This project is a platform designed to **plan, coordinate, and execute complex hospitality events**, such as Passover (Pessach) hotel programs.

These events behave like **temporary micro-cities**, involving:

- hundreds of guests with **partial and dynamic stays**
- multiple **simultaneous activities**
- strict **kashrut (kosher) supervision**
- coordinated **religious, culinary, and leisure schedules**
- multiple teams operating in parallel
- real-time operational decision making

---

## 🎯 Vision

> Transform complex hospitality events into **structured, predictable, and efficiently orchestrated operations**, reducing chaos and improving both staff efficiency and guest experience.

---

## 🧠 Core Concept

The system is built around six integrated dimensions:

1. **Time** → schedules, timelines, periods  
2. **Space** → hotel infrastructure (rooms, halls, kitchens)  
3. **People** → guests, staff, mashguichim  
4. **Rules** → halachic and operational constraints  
5. **Execution** → tasks, workflows, real-time operations  
6. **Resources** → logistics, equipment, supplies  

---

# 🏗️ Core Architecture Concept

## 🏨 Hotel (Base Infrastructure)

The hotel is a **persistent master entity**.

It represents the physical and operational environment where events take place.

### Includes:
- rooms
- kitchens
- restaurants
- halls
- synagogue spaces (potential)
- leisure areas (pool, gym, beach, kids area)
- logistics areas

👉 A single hotel can host **multiple events over time**.

---

## 📅 Event (Operational Layer)

An event is a **time-bounded operational instance** linked to one hotel.

### Includes:
- dates and periods (e.g., Yom Tov / Chol Hamoed)
- expected number of guests
- schedules
- staff
- operational rules
- logistics
- tasks and execution

---

## 🧠 Key Principle

> **Hotel = structure (static)**  
> **Event = operation (dynamic)**

---

# 🧩 Main Modules

---

## 🏨 Hotel Infrastructure Module

Master data:
- hotel registry
- rooms
- kitchens
- spaces (restaurants, halls, pool, gym, etc.)
- capacities and characteristics

---

## 👥 Guests & Reservations

- families/groups
- **partial stays (date intervals)**
- preferences (future expansion)
- allocation to:
  - rooms (time-based)
  - tables (period-based)

---

## 🛏️ Rooms (Timeline-based)

- dynamic occupancy
- turnover management
- cleaning cycles
- real-time status:
  - occupied
  - check-out today
  - check-in today
  - pending cleaning

---

## 🍽️ Tables & Dining

- table allocation per period
- dynamic seating composition
- capacity balancing

---

## 📅 Event Scheduling (Multi-layer Agenda)

Supports:
- religious events
- meals
- leisure activities
- continuous services

### Event types:
- fixed (prayers, meals)
- time-window (activities)
- continuous (services)
- segmented (kids, women, etc.)

---

## 🕍 Religious Management

- multiple minyanim (Ashkenazi / Sefaradi)
- prayer schedules
- aliyot management
- shiurim (classes)

---

## 🔒 Space Rules Engine

Context-aware rules:

- Shabbat / Yom Tov / Chol Hamoed
- gender segmentation
- restricted access
- dynamic opening/closing

Example:
- pool closed during Shabbat
- gym alternating male/female access

---

## 👨‍🍳 Kashrut & Mashguichim

Highly specialized module:

- mashguiach registry
- kitchen supervision scheduling
- assignment per:
  - kitchen
  - shift
  - meal
- kashrut checklists
- critical alerts:
  - “kitchen without supervision”

---

## 🔧 Pre-Event Preparation (Kasherization)

- structured workflows
- kitchen kasherization
- cleaning and setup
- reusable templates

---

## 🚚 Logistics

- deliveries tracking
- supplier coordination
- equipment allocation
- internal distribution

---

## 📋 Task Management (Execution Core)

The operational heart of the system.

### Tasks:
- linked to:
  - rooms
  - events
  - spaces
  - logistics
- priority levels:
  - 🔴 Critical
  - 🟠 High
  - 🟡 Medium
  - ⚪ Low

---

## 📊 Smart Kanban (Advanced Concept)

A **capacity-aware task system**:

- adapts to available staff
- balances workload
- limits overload
- reprioritizes dynamically

---

## 📱 Staff App (PWA)

Primary interface for execution.

Focus:

> “What should I do now?”

Features:
- real-time task list
- priority alerts
- task completion
- issue reporting
- photo attachments

---

## 👨‍💼 Team Management

For supervisors:

- view team workload
- assign/reassign tasks
- monitor execution
- detect bottlenecks
- performance tracking

---

## 🧳 Lost & Found

- register lost/found items
- attach photos
- tag locations
- track status
- future: automated matching

---

# 🧠 System Nature

This is not just:

❌ an event system  
❌ a hotel system  

It is:

> ✅ an **Operational Flow Management Platform**

---

# 🏗️ Technology Stack

## Backend
- Python
- FastAPI
- SQLAlchemy

## Database
- PostgreSQL

## Cache / Realtime
- Redis
- WebSockets (FastAPI)

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

## Mobile Strategy
- Phase 1: **PWA (Progressive Web App)**
- Phase 2: React Native (optional)

---

# 🚀 Deployment

## Infrastructure
- Docker
- CapRover

## Services
- Backend API
- Frontend (static via Nginx)
- PostgreSQL
- Redis

### PWA Support
- HTTPS via Let’s Encrypt (CapRover)
- Service Worker enabled
- installable on mobile devices

---

# 🔐 Authentication & Authorization

- JWT-based authentication
- Role-Based Access Control (RBAC)

Roles:
- admin
- coordinator
- reception
- kitchen
- mashguiach
- staff
- guest (future)

---

# ⚙️ Non-Functional Requirements

- high availability during events
- fast UI response (<2s)
- partial offline capability (PWA)
- audit logs for critical actions
- secure access control

---

# 📦 Project Structure (Proposed)

 ```
├── backend
│ └── app
│ ├── modules
│ │ ├── hotel
│ │ ├── events
│ │ ├── guests
│ │ ├── rooms
│ │ ├── tables
│ │ ├── schedule
│ │ ├── tasks
│ │ ├── kashrut
│ │ ├── logistics
│ │ ├── rules
│ │ └── lost_found
│ ├── core
│ ├── api
│ ├── models
│ └── services
├── frontend
│ └── src
│ ├── components
│ ├── modules
│ ├── pages
│ ├── services
│ └── hooks
├── infrastructure
│ ├── docker-compose.yml
│ └── captain-definition
└── docs
├── README_business.md
├── README_technical.md
├── README_database.md
└── README_api.md

```
 
 
---

# 🪜 Roadmap

## Phase 1 — MVP
- hotel base structure
- events + periods
- guests with partial stays
- rooms (timeline)
- tables
- scheduling
- tasks + PWA
- basic rules
- lost & found

---

## Phase 2
- mashguichim & kashrut
- logistics
- improved dashboards
- notifications

---

## Phase 3
- smart Kanban
- automation engine
- analytics
- multi-event SaaS platform

---

# 🧭 Strategic Positioning

> A system that connects **planning, rules, and execution in real time**, for environments where coordination complexity is high.

---

# 📌 Next Steps

1. Define initial database schema (`t_*` pattern)  
2. Implement core modules:
   - hotel
   - events
   - rooms
   - tasks  
3. Deploy MVP on CapRover  
4. Run pilot in a real event  

---

# 🚀 Getting Started

## ✅ Current Status

🎉 **Vertical Slice "Login to Hotels" is LIVE and VALIDATED!**

The system is fully functional with:
- ✅ Backend API (FastAPI + PostgreSQL)
- ✅ Frontend PWA (React + TypeScript + Vite)
- ✅ Authentication (JWT)
- ✅ End-to-end flow working

## 🏃 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Start Infrastructure

```bash
# Start PostgreSQL
docker ps | grep postgres  # Check if already running
# If not running:
docker-compose up -d postgres
```

### 2. Setup & Run Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Start backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

✅ Backend running at: **http://localhost:8000**  
✅ API Docs at: **http://localhost:8000/docs**

### 3. Setup & Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at: **http://localhost:5173** (or 5175 if port is busy)

### 4. Login

Open the frontend URL and login with:
- **Username**: `admin`
- **Password**: `admin123`

You should see the hotels list!

## 🌐 Running in GitHub Codespaces

The system is configured to work automatically in Codespaces:

1. **Ports are auto-detected**: Frontend detects backend URL dynamically
2. **CORS is configured**: Accepts `*.app.github.dev` origins
3. **URLs**: Access via the PORTS tab in VS Code

### Make Ports Public

```bash
# Set backend port as public
gh codespace ports visibility 8000:public -c $CODESPACE_NAME

# Set frontend port as public  
gh codespace ports visibility 5173:public -c $CODESPACE_NAME
```

Then access via:
- **Backend**: `https://{codespace-name}-8000.app.github.dev`
- **Frontend**: `https://{codespace-name}-5173.app.github.dev`

## 📖 Full Documentation

- [SETUP.md](SETUP.md) - Complete setup and development guide
- [docs/PROJECT_EVOLUTION.md](docs/PROJECT_EVOLUTION.md) - Implementation history and validation
- [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md) - Current priorities and roadmap

## 📊 Project Status

✅ **Backend API** - 4 core modules validated (auth, hotel, events, tasks)  
✅ **Frontend PWA** - Login and Hotels list implemented  
✅ **Docker Infrastructure** - PostgreSQL running  
✅ **Database Migrations** - 22 tables created and validated  
✅ **Authentication** - JWT flow working end-to-end  
✅ **Deployment** - Codespaces configuration validated  
⏳ **Testing** - First automated tests pending  
⏳ **Additional Modules** - guests (40%), rooms (20%), others planned  

## 🎯 What Works Now

1. **User Authentication**:
   - Login with username/password
   - JWT token generation
   - Protected routes

2. **Hotels Management**:
   - List all hotels
   - View hotel details
   - Create new hotels (via API)

3. **Infrastructure**:
   - PostgreSQL database
   - Alembic migrations
   - Docker containerization
   - Codespaces deployment

## 🐛 Known Issues

All critical issues have been resolved! See [docs/PROJECT_EVOLUTION.md](docs/PROJECT_EVOLUTION.md) for details on fixes.

## 📚 Additional Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical architecture
- [docs/PRD.md](docs/PRD.md) - Product requirements
- [docs/API_PLAN.md](docs/API_PLAN.md) - API endpoint planning
- [docs/AGENT_RULES.md](docs/AGENT_RULES.md) - Development guidelines

---

# 📄 License

To be defined.
