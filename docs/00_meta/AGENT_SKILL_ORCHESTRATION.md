# 🧠 SKILL: Continuous Orchestration & Progress Documentation

## 🎯 Objective

You are responsible for transforming this repository into a **self-organizing system** where:

- documentation = operational memory
- progress = explicit and centralized
- development = guided by structured flow
- decisions = traceable
- next actions = always clear

You must continuously:

1. Structure the documentation
2. Maintain a single source of truth
3. Orchestrate development through docs
4. Eliminate ambiguity and fragmentation

---

## 🧱 STEP 1 — Initialize Documentation Structure

If `/docs` does not exist, create:

/docs/
  ├── 00_meta/
  ├── 01_definition/
  ├── 02_execution/
  ├── 03_validation/
  └── 04_technical/

---

## 📘 STEP 2 — Create Core Files (MANDATORY)

### 01_definition/

- PRD.md
- DOMAIN_MODEL.md
- ARCHITECTURE.md

If missing, generate minimal viable versions based on code/context.

---

### 02_execution/

Create:

#### 07_progress.md  ← CENTRAL FILE

Structure:

# Project Progress

## Current State
- Phase:
- Last update:

## Completed
- [x]

## In Progress
- [ ]

## Next Actions (Short Horizon)
- [ ]

## Risks / Blockers
-

## Technical Debt
-

---

#### 09_backlog.md

Structure:

# Backlog

## Immediate (Next Cycle)
- [ ]

## Short Term
- [ ]

## Mid Term
- [ ]

## Long Term
- [ ]

---

#### 08_decisions_log.md

Structure:

# Decisions Log

## [DATE] Title
**Context:**
**Decision:**
**Impact:**

---

#### KNOWN_ISSUES.md

List real problems only (no speculation)

---

## 🧭 STEP 3 — Normalize Existing Docs

If files like:

- NEXT_STEPS.md
- ROADMAP.md
- PROJECT_EVOLUTION.md

exist:

You must:

1. Extract actionable items → move to 09_backlog.md
2. Extract real progress → consolidate into 07_progress.md
3. Extract decisions → move to 08_decisions_log.md
4. Reduce redundancy

Never allow duplicated sources of truth.

---

## ⚙️ STEP 4 — Operational Loop (MANDATORY BEHAVIOR)

For every interaction:

### 1. Read:
- 07_progress.md
- 09_backlog.md
- DOMAIN_MODEL.md

---

### 2. Diagnose:
- What is the current phase?
- What is incomplete?
- What is the next logical step?

---

### 3. Act:

You may:

- implement code
- refine domain
- reorganize docs
- propose improvements

---

### 4. Update:

After ANY meaningful change:

You MUST update:

- 07_progress.md
- 09_backlog.md
- 08_decisions_log.md (if applicable)

---

## 🧠 STEP 5 — Behavioral Rules

### Rule 1 — No fragmented truth

If progress is described in multiple places:
→ consolidate into 07_progress.md

---

### Rule 2 — No blind coding

Never write code before:

- understanding domain
- checking progress
- validating backlog

---

### Rule 3 — Always propose next step

Every output must include:

## Suggested Next Step

---

### Rule 4 — Prefer flow over structure

Focus on:

- what is moving
- what is blocked
- what is next

---

### Rule 5 — Reduce entropy

Continuously:

- merge redundant docs
- remove obsolete content
- simplify structure

---

## 🔄 STEP 6 — Self-Healing Behavior

If you detect:

- missing documentation
- inconsistency between docs and code
- outdated progress

You must:

1. Fix structure
2. Update documentation
3. Log the correction

---

## 🧩 STEP 7 — Orchestration Mindset

You are not documenting.

You are:

→ orchestrating a system

Interpret everything as:

- state
- transition
- flow

---

## 📊 STEP 8 — Optional Enhancements

When possible, introduce:

- progress metrics
- module completion percentage
- dependency mapping

---

## 🚫 Anti-Patterns (STRICTLY AVOID)

- Creating new files for the same purpose
- Leaving TODOs without backlog registration
- Writing long narrative logs instead of structured data
- Ignoring existing documentation

---

## 🧠 Final Principle

Documentation is not a description.

It is:

→ the control layer of the system