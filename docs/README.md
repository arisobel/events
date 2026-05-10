# Documentation Index

## 📁 Documentation Structure

Este repositório segue uma arquitetura de documentação-como-memória-operacional, onde a documentação não apenas descreve, mas **orquestra** o sistema.

---

## 00_meta/ — Meta-Documentation

Documentos sobre como o próprio sistema de documentação funciona.

- [AGENT_SKILL_ORCHESTRATION.md](00_meta/AGENT_SKILL_ORCHESTRATION.md) - Skill de orquestração contínua
- [AGENT_OPERATING_RULES.md](00_meta/AGENT_OPERATING_RULES.md) - Regras operacionais canônicas do agente

---

## 01_definition/ — Product & Architecture Definition

Documentos que definem **O QUE** estamos construindo e **POR QUÊ**.

- [PRD.md](01_definition/PRD.md) - Product Requirements Document
- [DOMAIN_MODEL.md](01_definition/DOMAIN_MODEL.md) - Modelo conceitual do domínio
- [ARCHITECTURE.md](01_definition/ARCHITECTURE.md) - Decisões arquiteturais e stack técnico
- [PRODUCT_OVERVIEW.md](01_definition/PRODUCT_OVERVIEW.md) - Visão humana e operacional do produto
- [OPERATIONAL_MODEL.md](01_definition/OPERATIONAL_MODEL.md) - Modelo operacional centrado em tasks
- [UI_SURFACES.md](01_definition/UI_SURFACES.md) - Mapa das superfícies de interface

**Princípio**: Estes documentos são **imutáveis** no curto prazo. Mudanças aqui requerem revisão arquitetural.

---

## 02_execution/ — Execution & Progress

Documentos **VIVOS** que refletem o estado e progresso do desenvolvimento.

### Core Files (MANDATORY)

- [07_progress.md](02_execution/07_progress.md) ⭐ **CENTRAL** - Estado atual, completado, em progresso, próximos passos
- [09_backlog.md](02_execution/09_backlog.md) - Backlog estruturado por horizonte temporal
- [08_decisions_log.md](02_execution/08_decisions_log.md) - Log de decisões arquiteturais e técnicas
- [KNOWN_ISSUES.md](02_execution/KNOWN_ISSUES.md) - Issues reais (não especulação)

**Princípio**: 
- **Single source of truth** para estado do projeto
- Atualizado continuamente
- Progresso > narrativa
- Estrutura > prosa

---

## 03_validation/ — Validation Reports

Evidências de que o sistema funciona conforme esperado.

- [VALIDATION_21_04_2026.md](03_validation/VALIDATION_21_04_2026.md) - Relatório de validação do vertical slice
- `screenshots/` - Screenshots de validação (pendente)

**Princípio**: Validação baseada em evidências, não opinião.

---

## 04_technical/ — Technical Documentation

Documentação técnica detalhada de implementação.

- [DATABASE_MODULES.md](04_technical/DATABASE_MODULES.md) - Estrutura de banco por módulo
- [DATABASE_PHASE1.sql](04_technical/DATABASE_PHASE1.sql) - Schema Phase 1
- [DATABASE_FULL_DRAFT.sql](04_technical/DATABASE_FULL_DRAFT.sql) - Schema completo (draft)
- [API_PLAN.md](04_technical/API_PLAN.md) - Mapeamento de endpoints REST
- [DEVELOPMENT_CONVENTIONS.md](04_technical/DEVELOPMENT_CONVENTIONS.md) - Convenções técnicas de implementação

**Princípio**: Referência técnica, não narrativa.

---

## legacy/ — Archived Documentation

Documentos do sistema anterior de documentação, mantidos para referência histórica.

**Nota**: Não consultar diretamente. Informações relevantes foram consolidadas na nova estrutura.

- [legacy/README.md](legacy/README.md) - Matriz explícita do que foi incorporado, duplicado ou aposentado

---

## 🧭 Navigation Rules

### Para entender o produto:
1. Leia [PRD.md](01_definition/PRD.md)
2. Leia [DOMAIN_MODEL.md](01_definition/DOMAIN_MODEL.md)
3. Leia [ARCHITECTURE.md](01_definition/ARCHITECTURE.md)
4. Leia [PRODUCT_OVERVIEW.md](01_definition/PRODUCT_OVERVIEW.md)
5. Consulte [OPERATIONAL_MODEL.md](01_definition/OPERATIONAL_MODEL.md) quando a discussão for sobre execução

### Para trabalhar no projeto:
1. Leia [07_progress.md](02_execution/07_progress.md) ⭐
2. Verifique [KNOWN_ISSUES.md](02_execution/KNOWN_ISSUES.md)
3. Consulte [09_backlog.md](02_execution/09_backlog.md)
4. Use [AGENT_OPERATING_RULES.md](00_meta/AGENT_OPERATING_RULES.md) como regra operacional

### Para decisões técnicas:
1. Consulte [08_decisions_log.md](02_execution/08_decisions_log.md)
2. Documente novas decisões no mesmo arquivo

### Para validação:
1. Veja [03_validation/](03_validation/)
2. Execute scripts de teste em `/backend/test_*.sh`

---

## 📊 Current Project State

**Phase**: Phase 1 - Core Backend + Internal MVP ✅ **IMPLEMENTADO**  
**Last Update**: 10 de Maio de 2026  
**Status**: Fluxo MVP interno disponível de ponta a ponta

**Quick Stats**:
- Backend Modules: 6/6 completos
- Frontend Pages: 6 páginas funcionais
- Database: 22 tabelas
- Tests: 6 backend tests passing + frontend build passing

**Next Actions**:
1. Estabilizar testes HTTP/integration
2. Capturar screenshots e relatório de validação
3. Refinar UX (HotelDetailPage)

Para detalhes completos: [07_progress.md](02_execution/07_progress.md)

---

## 🔄 Maintenance Policy

### Atualização de Documentos

**Frequência**:
- `07_progress.md`: Após cada mudança significativa
- `09_backlog.md`: Semanalmente ou quando prioridades mudam
- `08_decisions_log.md`: Imediatamente ao tomar decisão arquitetural
- `KNOWN_ISSUES.md`: Imediatamente ao descobrir ou resolver issue

**Responsabilidade**:
- Agent deve atualizar automaticamente
- Revisão humana recomendada em pontos de milestone

### Princípio Anti-Fragmentação

❌ **NUNCA**:
- Criar múltiplos arquivos para o mesmo propósito
- Deixar TODOs sem registrar no backlog
- Escrever narrativas longas em vez de dados estruturados
- Ignorar documentação existente

✅ **SEMPRE**:
- Consolidar informações em single source of truth
- Preferir estrutura sobre narrativa
- Atualizar documentos existentes em vez de criar novos
- Documentação = control layer do sistema

---

## 🎯 Success Criteria

Documentação está funcionando quando:
1. ✅ Qualquer desenvolvedor pode entender o estado atual em < 5 minutos
2. ✅ Zero ambiguidade sobre próximos passos
3. ✅ Decisões são rastreáveis
4. ✅ Progresso é explícito
5. ✅ Nenhuma informação duplicada
6. ✅ Documentação guia desenvolvimento (não apenas descreve)

---

## 📎 Related Files

- Repository root: [README.md](../README.md) - Overview geral
- Setup instructions: [SETUP.md](../SETUP.md) - Como executar o projeto
- Backend tests: [/backend/test_*.sh](../backend/) - Scripts de validação
