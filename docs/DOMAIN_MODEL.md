# 🧠 DOMAIN MODEL — Event Operations Platform

## 🎯 Purpose

Este documento define o modelo conceitual do sistema.

Ele traduz o domínio do negócio (eventos complexos de hotelaria + Pessach)
em entidades, relações e regras claras.

---

# 🧭 Core Domain

O sistema modela:

> operação de eventos complexos com múltiplos espaços, pessoas, tarefas e regras simultâneas.

---

# 🧱 Bounded Contexts

O sistema é dividido em contextos (DDD):

## 1. Event Management
- Evento
- Programação
- Agenda

## 2. Hospitality (Hotel & Guests)
- Hotel
- Quartos
- Hóspedes
- Estadia

## 3. Operations (Core do produto)
- Tarefas
- Staff
- Execução

## 4. Religious / Pessach Context
- Minianim
- Shiurim
- Aliot
- Regras (Kasher, horários, etc)

## 5. Logistics
- Fornecedores
- Equipamentos
- Preparação (Kasherização)

---

# 🧩 Core Entities

## 🏨 Hotel
Representa o local físico do evento

- id
- name
- city
- total_rooms
- areas (lista de espaços)

---

## 📅 Event

Evento específico dentro de um hotel

- id
- hotel_id
- name
- start_date
- end_date
- expected_guests

---

## 👤 Guest (Hóspede)

Pessoa participante do evento

- id
- name
- family_id (opcional)
- group_id (opcional)
- room_id
- stay_period (início/fim)
- nationality
- preferred_language

---

## 👨‍👩‍👧 Family

Agrupa hóspedes com vínculo familiar

- id
- name
- group_id (opcional)
- members

---

## 🌍 Group (Grupo / Delegação)

Representa agrupamentos organizacionais ou geográficos

Exemplos:
- Grupo de Ohio
- Grupo da Argentina
- Grupo de agência kosher
- Delegação internacional

- id
- name
- origin (cidade/região)
- country
- language
- organizer_name (opcional)
- notes

Características:
- NÃO substitui Family
- pode conter múltiplas famílias
- pode conter hóspedes individuais
- utilizado para comunicação e organização

---

## 🛏️ Room

Quarto do hotel

- id
- hotel_id
- capacity
- status (ocupado, livre, limpeza)

---

## 🍽️ Table (Mesas)

Organização de refeições

- id
- event_id
- capacity
- assigned_guests

---

## 👷 Staff (Colaboradores)

- id
- name
- role (cleaning, kitchen, mashguiach, manager)
- team_id

---

## 👥 Team

- id
- name
- type (hotel / event / mashguichim)

---

## 📋 Task (ENTIDADE CENTRAL)

Representa trabalho operacional

- id
- title
- description
- status (pending, in_progress, done)
- priority
- assigned_to (staff_id)
- location
- due_time
- context_type (room, kitchen, event, etc)

---

## 🍳 Mashguiach Assignment

- id
- staff_id
- kitchen_id
- shift
- meal_type

---

## 🏛️ Activity

- id
- name
- type (shiur, show, kids, prayer)
- location
- start_time
- end_time
- target_group_id (opcional)

---

# 🔗 Relações principais

- Hotel → possui → Rooms
- Event → ocorre em → Hotel
- Guest → pertence a → Family
- Guest → pode pertencer a → Group
- Family → pode pertencer a → Group
- Guest → ocupa → Room
- Task → atribuída a → Staff
- Staff → pertence a → Team
- Activity → pertence a → Event
- Activity → pode ser direcionada a → Group

---

# 🧠 Value Objects

Objetos sem identidade própria:

- TimeSlot (start, end)
- Location (nome + tipo)
- Status (enum)
- Priority (enum)
- Role (enum)
- Locale (language + country)

---

# 🔥 Aggregate Roots

Principais agregados:

- Event (contexto geral)
- Task (execução operacional)
- Guest (dados pessoais)
- Staff (execução)

---

# ⚙️ Regras de negócio (iniciais)

## 🏨 Rooms
- capacidade não pode ser excedida

## 🍽️ Tables
- respeitar capacidade
- composição dinâmica ao longo do evento

## 📋 Tasks
- sempre possuem status válido
- podem ser reatribuídas
- podem ser criadas dinamicamente

## 👨‍🍳 Mashguichim
- vinculados a cozinhas específicas
- organizados por turno/refeição

## 🌍 Groups
- podem receber comunicação segmentada
- podem influenciar idioma e programação

## 📅 Event
- todas operações acontecem dentro de um evento ativo

---

# 🎯 Core Insight

O sistema NÃO é centrado em:

- hóspedes
- quartos

O sistema é centrado em:

> execução operacional (Tasks + Staff)

---

# 🏁 Conclusão

Este modelo serve como base para:

- banco de dados
- APIs
- frontend
- decisões arquiteturais

Qualquer nova funcionalidade deve respeitar este modelo.