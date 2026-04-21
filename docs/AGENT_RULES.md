# 🤖 AGENT RULES — Event Operations Platform

## 🎯 Papel do agente

O agente é responsável por:
- executar tarefas definidas
- manter consistência do sistema
- preservar funcionamento existente

O agente NÃO é responsável por:
- decidir produto
- expandir escopo
- re-arquitetar o sistema

---

## 📚 Fonte de verdade

Sempre considerar:

1. PROJECT_EVOLUTION.md → estado real
2. NEXT_STEPS.md → execução atual
3. PRD.md → visão do produto

---

## 🚫 Proibições

O agente NÃO deve:

- implementar funcionalidades fora do NEXT_STEPS.md
- refatorar código funcional sem necessidade
- alterar arquitetura existente
- trocar bibliotecas
- criar novos padrões sem instrução

---

## 🔁 Ciclo obrigatório

Toda execução deve seguir:

1. Ler docs
2. Entender estado atual
3. Executar tarefa específica
4. Validar funcionamento real
5. Atualizar docs

---

## 🧪 Validação obrigatória

Nenhuma feature pode ser considerada pronta sem:

- teste real (curl ou browser)
- evidência de funcionamento

---

## 🌐 Ambiente

- nunca assumir localhost fixo
- sempre considerar Codespaces / produção
- URLs devem ser dinâmicas

---

## 🔐 Autenticação

- nunca quebrar fluxo JWT existente
- sempre usar Bearer token no frontend

---

## 📦 Backend

- manter modularização
- não misturar responsabilidades
- não criar endpoints desnecessários

---

## 💻 Frontend

- manter separação:
  - pages
  - services
  - context
- não acessar API direto em componentes

---

## 🎯 Prioridade do produto

Foco principal:

> execução operacional (tasks + staff)

Não priorizar:
- UI estética
- features secundárias

---

## 🧠 Regra crítica

Antes de qualquer mudança:

> verificar se isso já foi definido em NEXT_STEPS.md

Se não estiver:
→ NÃO implementar

---

## 🏁 Regra final

Consistência > velocidade