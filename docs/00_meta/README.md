# Meta-Documentation

Documentação sobre como o sistema de documentação funciona - meta-conhecimento para orquestração.

---

## [AGENT_SKILL_ORCHESTRATION.md](AGENT_SKILL_ORCHESTRATION.md)

**Purpose**: Define como o agent deve operar continuamente para manter o projeto organizado.

## [AGENT_OPERATING_RULES.md](AGENT_OPERATING_RULES.md)

**Purpose**: Regras operacionais canônicas do agente dentro da nova estrutura.

**Use para**:
- ordem de leitura dos documentos
- guardrails de execução
- política de atualização de documentação
- descontinuação do uso de `docs/legacy/` como fonte primária

**Core Concepts**:
1. **Documentation = Operational Memory**
2. **Progress = Explicit and Centralized**
3. **Development = Guided by Structured Flow**
4. **Decisions = Traceable**
5. **Next Actions = Always Clear**

---

## 🧠 Orchestration Philosophy

A documentação não é apenas descrição do sistema.

Ela **É** o control layer do sistema.

### Traditional Approach (❌ Avoided)
```
Code → Documentation
(docs lag behind, become stale, ignored)
```

### Orchestration Approach (✅ Implemented)
```
Documentation ⇄ Code
(bidirectional, docs guide development)
```

---

## 📐 Structure Principles

### Separation of Concerns

1. **Definition** (01_definition/)
   - What are we building?
   - Why are we building it?
   - High-level architecture
   - **Stability**: Changes rarely

2. **Execution** (02_execution/)
   - Current state
   - What's done/in-progress/next
   - Decisions made
   - Issues encountered
   - **Volatility**: Updates constantly

3. **Validation** (03_validation/)
   - Evidence of functionality
   - Test reports
   - Screenshots
   - **Cadence**: After milestones

4. **Technical** (04_technical/)
   - Implementation details
   - Database schemas
   - API docs
   - **Stability**: Changes with implementation

---

## 🔄 Operational Loop

Every meaningful interaction follows:

```
1. READ
   ├─ 07_progress.md (current state)
   ├─ 09_backlog.md (what's planned)
   └─ DOMAIN_MODEL.md (context)

2. DIAGNOSE
   ├─ What phase are we in?
   ├─ What's incomplete?
   └─ What's next logical step?

3. ACT
   ├─ Implement code
   ├─ Refine domain
   ├─ Reorganize docs
   └─ Propose improvements

4. UPDATE
   ├─ 07_progress.md (always)
   ├─ 09_backlog.md (if priorities change)
   └─ 08_decisions_log.md (if architectural decision)
```

---

## 🎯 Success Metrics

Documentation is working when:

1. ✅ **Clarity**: Anyone can understand project state in < 5 minutes
2. ✅ **Actionability**: Next steps are unambiguous
3. ✅ **Traceability**: Decisions have context and rationale
4. ✅ **Visibility**: Progress is explicit, not implicit
5. ✅ **Unity**: Single source of truth per concern
6. ✅ **Agency**: Documentation guides work (not just describes)

---

## 🚫 Anti-Patterns (Strictly Avoid)

### Fragmentation
❌ Creating multiple files for the same purpose  
✅ Consolidate into single source of truth

### Stale Docs
❌ Docs lag behind code  
✅ Update docs as part of every change

### Narrative Over Structure
❌ Long prose without structure  
✅ Structured data (checklists, tables, sections)

### Speculation
❌ Documenting hypothetical issues/features  
✅ Document only verified facts

### Orphaned TODOs
❌ TODO comments without tracking  
✅ All TODOs in backlog with priority

---

## 🧩 Integration with Development

### Before Writing Code
1. Check `07_progress.md` - understand current state
2. Check `KNOWN_ISSUES.md` - avoid known pitfalls
3. Check `08_decisions_log.md` - follow architectural decisions

### While Writing Code
1. Keep mental model of where this fits in domain
2. Consider if this requires architectural decision

### After Writing Code
1. **Mandatory**: Update `07_progress.md`
2. If priority changed: Update `09_backlog.md`
3. If architectural decision: Update `08_decisions_log.md`
4. If issue found/fixed: Update `KNOWN_ISSUES.md`

---

## 📊 Documentation Health Checks

### Weekly
- [ ] Is `07_progress.md` accurate?
- [ ] Are completed items marked?
- [ ] Are blockers documented?

### Bi-weekly
- [ ] Is `09_backlog.md` prioritized correctly?
- [ ] Are estimates still reasonable?
- [ ] Any new items to add?

### Monthly
- [ ] Archive resolved issues from `KNOWN_ISSUES.md`
- [ ] Review decision log for patterns
- [ ] Update metrics in progress

---

## 🔍 Self-Healing Behavior

When detecting:
- Missing documentation → Create it
- Inconsistency between docs and code → Fix it
- Outdated progress → Update it
- Redundancy → Consolidate it

**Always log the correction in the relevant file.**

---

## 🎓 Learning & Evolution

This meta-documentation itself evolves.

If a pattern emerges that improves orchestration:
1. Document it here
2. Apply it to the structure
3. Refactor existing docs if needed

**Documentation is not static - it's a living control system.**

---

## 📎 Related Concepts

### Single Source of Truth (SSOT)
Each piece of information has exactly one canonical location.

### Progressive Disclosure
Information organized by need:
- Quick overview → Progress
- Deep dive → Technical docs
- Historical context → Decisions log

### Documentation as Code
Treat docs with same rigor as code:
- Version controlled
- Reviewed
- Updated atomically with changes

---

## 🚀 Future Enhancements

Potential improvements to orchestration:

- [ ] Automated progress metrics (code coverage, module completion)
- [ ] Dependency mapping between modules
- [ ] Visual progress dashboard (generated from markdown)
- [ ] Git hooks to remind updating progress
- [ ] Templates for common doc types

**Note**: Only implement if proven valuable, avoid premature optimization.
