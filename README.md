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

# � Getting Started

The backend is ready! To run the system locally:

```bash
cd infrastructure
cp .env.example .env
docker-compose up -d
```

Access the API documentation at: **http://localhost:8000/docs**

**📖 Full Setup Guide**: See [SETUP.md](SETUP.md) for detailed installation, development, and deployment instructions.

## Project Status

✅ **Backend API** - Fully functional with 6 core modules  
✅ **Docker Infrastructure** - PostgreSQL, Redis, backend  
✅ **Database Migrations** - Alembic configured  
⏳ **Frontend PWA** - Planned (React + TypeScript + Vite)  

## Documentation

- [SETUP.md](SETUP.md) - Complete setup and development guide
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical architecture
- [docs/PRD.md](docs/PRD.md) - Product requirements
- [docs/API_PLAN.md](docs/API_PLAN.md) - API endpoint planning
- [docs/AGENT_INSTRUCTIONS.md](docs/AGENT_INSTRUCTIONS.md) - Development guidelines

---

# 📄 License

To be defined.
