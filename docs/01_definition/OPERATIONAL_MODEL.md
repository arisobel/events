# Operational Model

Modelo operacional canônico para a camada de execução do sistema.

Este documento incorpora e atualiza o conteúdo de `docs/legacy/TASK_ENGINE.md`.

---

## Purpose

O sistema opera a partir de fluxo contínuo de trabalho.

Tasks são o principal mecanismo de execução e ligação entre:

- evento
- local/contexto
- equipe
- prioridade
- acompanhamento operacional

---

## Task-Centric Execution

Tasks podem representar:

- preparação de espaços
- limpeza e turnover
- atividades de cozinha
- check-in e check-out
- suporte reativo
- supervisão operacional

Elas são sempre tratadas como objetos operacionais do evento, não como itens genéricos soltos.

---

## Current Lifecycle

No estado atual documentado do produto, os status implementados e validados são:

- `pending`
- `in_progress`
- `completed`
- `cancelled`

Mapeamento conceitual a partir do modelo legado:

- `created` e `ready` foram consolidados em `pending`
- `in_progress` permanece
- `done` corresponde a `completed`
- `blocked` continua sendo uma extensão desejável, mas não documentada como implementada

---

## Priority Model

Cada task deve ter, no mínimo:

- prioridade
- status
- contexto de evento

Quando aplicável, também pode carregar:

- room or space context
- responsible team or staff member
- comments
- status history

---

## Assignment Model

Há dois modos conceituais de atribuição:

### Manual

Uso atual e esperado no MVP:

- gerente ou supervisor cria/atribui
- equipe executa e atualiza

### Assisted / Automatic

Direção futura:

- considerar disponibilidade
- considerar localização
- considerar função
- sugerir alocação

---

## Kanban And Flow

O modelo operacional é compatível com fluxo visual de board:

- backlog or pending
- in progress
- completed

Esse modelo favorece:

- visibilidade do trabalho
- coordenação entre equipes
- detecção de gargalos

---

## WIP And Supervision

O legado descrevia limites de trabalho em progresso e supervisão por board.

Esses conceitos permanecem válidos como direção de produto, mas devem ser tratados como
capacidade planejada até estarem explicitamente implementados.

---

## Domain Rule

Tasks devem permanecer vinculadas a um `eventId`.

Isso está alinhado com a decisão arquitetural já registrada em
`docs/02_execution/08_decisions_log.md`.

