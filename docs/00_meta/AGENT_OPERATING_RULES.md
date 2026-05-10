# Agent Operating Rules

Documento canônico para regras de operação do agente dentro deste repositório.

Ele substitui, na estrutura nova, o papel antes espalhado entre `docs/legacy/AGENT_RULES.md`,
`docs/legacy/AGENT_INSTRUCTIONS.md` e `docs/legacy/DOCS_INDEX.md`.

---

## Objective

O agente deve:

- preservar consistência do sistema
- operar a partir da documentação canônica
- executar mudanças incrementais e verificáveis
- manter progresso, decisões e issues atualizados

O agente não deve:

- expandir escopo sem base documental
- re-arquitetar o sistema sem decisão explícita
- criar novas fontes paralelas de verdade

---

## Canonical Reading Order

Antes de mudanças significativas, ler nesta ordem:

1. `docs/02_execution/07_progress.md`
2. `docs/02_execution/09_backlog.md`
3. `docs/01_definition/DOMAIN_MODEL.md`
4. `docs/02_execution/KNOWN_ISSUES.md`
5. `docs/02_execution/08_decisions_log.md`

Quando necessário:

- `docs/01_definition/PRD.md` para direção de produto
- `docs/01_definition/ARCHITECTURE.md` para visão arquitetural
- `docs/04_technical/` para referência de implementação

---

## Single Source Of Truth

Cada tipo de informação tem um lugar canônico:

- estado atual: `02_execution/07_progress.md`
- próximos passos: `02_execution/09_backlog.md`
- decisões: `02_execution/08_decisions_log.md`
- problemas reais: `02_execution/KNOWN_ISSUES.md`
- definição do produto: `01_definition/`
- referência técnica: `04_technical/`

Arquivos em `docs/legacy/` são arquivo histórico e não devem voltar a ser fonte primária.

---

## Mandatory Execution Loop

Toda execução deve seguir este ciclo:

1. entender contexto e restrições
2. executar apenas o próximo passo lógico
3. validar comportamento real
4. atualizar a documentação afetada

Nenhuma mudança relevante termina sem fechamento documental.

---

## Guardrails

- não implementar funcionalidades fora do backlog ou sem justificativa clara no contexto atual
- não refatorar código funcional sem necessidade concreta
- não trocar stack, padrões ou arquitetura sem decisão registrada
- não criar endpoints, páginas ou abstrações sem encaixe claro no domínio
- não acessar API diretamente em componentes frontend quando já existir camada de serviço

Princípio orientador:

`consistência > velocidade`

---

## Validation Rules

Nada deve ser tratado como pronto sem evidência compatível com o tipo de mudança:

- validação manual real para fluxos de UI/API
- scripts de teste quando existirem
- testes automatizados quando disponíveis

Para mudanças de documentação estrutural, a validação mínima é:

- links e navegação coerentes
- ausência de fontes duplicadas de verdade
- localização explícita do conteúdo migrado

---

## Environment Rules

- considerar Codespaces e ambientes remotos, não apenas localhost
- URLs devem ser dinâmicas quando aplicável
- nunca quebrar o fluxo JWT existente
- preservar modularização do backend

---

## Documentation Update Rules

Após qualquer mudança significativa:

- atualizar `07_progress.md`
- atualizar `09_backlog.md` se a prioridade mudou
- atualizar `08_decisions_log.md` se houve decisão
- atualizar `KNOWN_ISSUES.md` se houve issue descoberta ou resolvida

Se conteúdo legado for incorporado ou aposentado, registrar isso em `docs/legacy/README.md`.

