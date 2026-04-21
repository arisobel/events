# ⚙️ TASK ENGINE — Event Operations Platform

## 🎯 Purpose

Este documento define o motor de execução operacional do sistema.

O Task Engine é responsável por:

- criação de tarefas
- priorização
- atribuição
- execução
- monitoramento

---

# 🧠 Core Concept

O sistema é baseado em:

> fluxo contínuo de tarefas (Task Flow)

Inspirado em Kanban:

- tarefas são visualizadas
- fluem entre estados
- são puxadas conforme capacidade

---

# 📊 Task Lifecycle

Toda Task segue um ciclo:

1. CREATED
2. READY
3. IN_PROGRESS
4. BLOCKED (opcional)
5. DONE

---

## 🔁 Estados

### CREATED
- tarefa criada automaticamente ou manualmente

### READY
- pronta para execução
- aguardando staff

### IN_PROGRESS
- sendo executada

### BLOCKED
- depende de algo externo

### DONE
- concluída

---

# 🧩 Task Types

## 🧼 Operational Tasks
- limpeza de quarto
- organização de sala
- preparação de evento

## 🍳 Kitchen Tasks
- preparo de refeições
- kasherização
- supervisão (mashguiach)

## 🏨 Hospitality Tasks
- check-in
- check-out
- troca de hóspedes

## 🏛️ Event Tasks
- preparar palestra
- organizar atividade
- setup de espaço

## ⚠️ Reactive Tasks
- problemas
- solicitações inesperadas
- achados e perdidos

---

# ⚙️ Task Creation

Tasks podem ser criadas por:

## 1. Sistema (automático)
- check-out → cria limpeza
- horário → cria preparação
- evento → cria setup

## 2. Staff
- gerente cria tarefas
- equipe registra problemas

## 3. Eventos externos
- hóspede solicita algo
- ocorrência inesperada

---

# 🎯 Priorização

Cada Task possui:

- priority (low, medium, high, critical)
- due_time

---

## 📌 Regras de prioridade

- critical → execução imediata
- high → antes de tarefas normais
- low → backlog

---

# 👷 Assignment (Atribuição)

## Estratégias

### 1. Manual
- gerente atribui

### 2. Automática (futuro)
- baseado em:
  - disponibilidade
  - localização
  - função

---

# 🔄 Pull System (IMPORTANTE)

O sistema segue modelo:

> staff “puxa” tarefas ao invés de receber empurradas

Isso evita sobrecarga e melhora eficiência :contentReference[oaicite:0]{index=0}

---

# 📊 Kanban Model

Tasks são visualizadas em board:

- To Do
- In Progress
- Done

Cada tarefa é um "card"

---

## 📌 Conceito chave

Kanban permite:

- visualizar trabalho
- limitar tarefas simultâneas
- melhorar fluxo :contentReference[oaicite:1]{index=1}

---

# 🚧 Work In Progress (WIP)

Cada staff ou equipe possui limite:

- ex: máximo 3 tarefas simultâneas

---

## Benefício

- evita overload
- melhora qualidade
- aumenta foco :contentReference[oaicite:2]{index=2}

---

# 📍 Context Awareness

Cada Task possui contexto:

- room_id
- kitchen_id
- event_id
- location

---

## Exemplo

"Limpar quarto 214"

→ context_type: ROOM  
→ context_id: 214  

---

# ⏱️ Scheduling

Tasks podem ser:

- imediatas
- agendadas

---

## Exemplo

- 10:00 → preparar sala de shiur
- 18:00 → setup jantar

---

# 🧠 Smart Task Behavior (futuro)

O sistema poderá:

- detectar gargalos
- redistribuir tarefas
- prever atrasos

---

# 📱 Staff Interface

Cada colaborador vê:

- tarefas atribuídas
- tarefas disponíveis
- prioridade
- localização

---

## UX esperado

> “o que eu preciso fazer agora?”

---

# 📊 Manager Interface

Gerente visualiza:

- tarefas por equipe
- status geral
- gargalos

---

# 🔥 Dynamic Task Creation

Sistema permite:

- criação em tempo real
- adaptação contínua

---

# 🧩 Task Dependencies (futuro)

Tasks podem depender de outras:

- setup → antes do evento
- limpeza → antes de check-in

---

# 🎯 Core Insight

O sistema não gerencia tarefas isoladas.

Ele gerencia:

> fluxo contínuo de execução operacional

---

# 🏁 Conclusão

O Task Engine é o núcleo do produto.

Ele conecta:

- Staff
- Eventos
- Espaços
- Tempo

E transforma tudo em execução coordenada.