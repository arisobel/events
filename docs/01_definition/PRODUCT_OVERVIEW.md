# Product Overview

Visão humana e operacional do produto.

Este documento incorpora o conteúdo conceitual que estava espalhado em
`docs/legacy/README_human.md`.

---

## What This System Is

A plataforma existe para coordenar eventos complexos de hospitalidade e operação,
como programas de Pessach em hotéis, de forma estruturada, previsível e rastreável.

O sistema não é apenas:

- cadastro
- agenda
- lista de tarefas

Ele combina esses três mundos em uma única camada operacional.

---

## Three Product Layers

### 1. Structure

A base física e estável:

- hotel
- rooms
- spaces
- kitchens
- dining areas
- facilities

### 2. Planning

A configuração temporal e organizacional:

- event
- periods
- guests and reservations
- schedule
- teams
- operational rules

### 3. Execution

A camada viva do evento:

- tasks
- supervision
- alerts
- team coordination
- issue handling

---

## Core Domain Separation

Uma separação central do produto:

- `Hotel` = infraestrutura persistente
- `Event` = operação temporal apoiada nessa infraestrutura

Em termos práticos:

- o hotel é o tabuleiro
- o evento é a partida

Essa separação permite reutilizar a mesma estrutura física em eventos distintos,
sem acoplar produto e operação a um único contexto.

---

## Why This Product Exists

Hoje, operações desse tipo costumam depender de:

- planilhas
- mensagens soltas
- improviso
- conhecimento tácito

Isso gera retrabalho, falhas de coordenação e pouca visibilidade.

O objetivo do produto é funcionar como centro nervoso da operação.

---

## Reading Path

Para aprofundar:

1. `PRD.md`
2. `DOMAIN_MODEL.md`
3. `ARCHITECTURE.md`
4. `OPERATIONAL_MODEL.md`
5. `UI_SURFACES.md`

