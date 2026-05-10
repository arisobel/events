Estrutura mais abrangente de módulos
1. Base estrutural
 * hotel
 * hotel spaces
 * rooms
 * kitchens
 * dining areas
 * facilities
2. Evento
 * event
 * event periods
 * event configuration
 * event teams
 * event roles
3. Hóspedes e ocupação
 * guest groups / families
 * guests
 * reservations
 * room allocations
 * table allocations
 * special requests
4. Programação
 * activity categories
 * activities
 * activity audiences
 * activity locations
 * activity dependencies
5. Religioso
 * minyanim
 * prayer schedules
 * aliyot
 * shiurim
 * synagogue spaces
6. Staff e tarefas
 * staff members
 * teams
 * shifts
 * tasks
 * task comments
 * task attachments
 * task status history
7. Supervisão / gerência
 * supervisors
 * team assignments
 * workload snapshots
 * kanban lanes
 * task assignment suggestions
8. Kashrut
 * mashguichim
 * mashguiach shifts
 * kitchen supervision assignments
 * kashrut checklists
 * kasherization tasks
9. Logística
 * suppliers
 * deliveries
 * delivery items
 * equipment
 * equipment movements
 * storage locations
10. Regras operacionais
 * space rules
 * rule conditions
 * rule schedules
 * access policies
11. Achados e perdidos
 * lost_found_items
 * item claims
 * item matches
12. Autenticação e segurança
 * users
 * roles
 * permissions
 * audit logs


 # Event Operations Platform — Explicação Humana do Projeto

## O que é este projeto

Este projeto nasce da necessidade de organizar eventos complexos de hospitalidade, como programas de Pessach em hotéis, de forma estruturada, previsível e profissional.

Um evento desse tipo não é apenas um conjunto de reservas e uma programação impressa. Na prática, ele funciona como uma pequena cidade temporária, montada dentro de um hotel e operada por diversas equipes ao mesmo tempo.

Existem hóspedes chegando e saindo em datas diferentes, quartos sendo preparados e trocados, refeições em larga escala, espaços com usos diferentes ao longo do dia, programação religiosa, programação de lazer, supervisão de kashrut, logística de equipamentos e alimentos, e uma equipe operacional que precisa saber o que fazer a cada momento.

Hoje, muitas dessas operações são coordenadas com planilhas, anotações, grupos de WhatsApp e improviso. Isso gera retrabalho, erros, atrasos e falta de visibilidade.

A proposta deste sistema é funcionar como o centro nervoso da operação.

---

## A ideia central

O sistema deve unir três mundos que normalmente ficam separados:

1. **Cadastro e estrutura**
   - hotel
   - quartos
   - espaços
   - cozinhas
   - mesas
   - equipes

2. **Planejamento**
   - evento
   - períodos do evento
   - hóspedes
   - programação
   - escalas
   - regras operacionais

3. **Execução**
   - tarefas
   - checklists
   - supervisão
   - alertas
   - acompanhamento das equipes
   - resolução de problemas em tempo real

Ou seja, o projeto não é apenas um software de cadastro, nem apenas uma agenda, e nem apenas uma lista de tarefas.

Ele é uma plataforma de coordenação operacional.

---

## A separação entre Hotel e Evento

Uma decisão importante deste projeto é separar claramente:

- o **hotel**
- o **evento**

O hotel é a base física e permanente.  
O evento é a operação temporária que acontece sobre essa base.

Isso significa que o sistema precisa permitir:

- cadastrar hotéis diferentes
- reutilizar a estrutura de um hotel em vários eventos
- comparar eventos em hotéis distintos
- não amarrar o produto a um único local

Em termos simples:

- o hotel é o tabuleiro
- o evento é a partida

---

## Estrutura mais abrangente de módulos

### 1. Base estrutural

Esse módulo representa a infraestrutura física do hotel.

Inclui:
- hotel
- espaços do hotel
- quartos
- cozinhas
- áreas de refeição
- áreas sociais e de lazer

É a base sobre a qual o evento será montado.

---

### 2. Evento

Esse módulo representa o evento em si.

Inclui:
- cadastro do evento
- datas
- períodos internos
- configurações
- equipes ligadas ao evento
- parâmetros de operação

Um evento pode ter, por exemplo:
- primeiros dias
- Chol Hamoed
- últimos dias

Esses períodos impactam quartos, mesas, programação e regras.

---

### 3. Hóspedes e ocupação

Esse módulo trata da parte humana e de hospedagem.

Inclui:
- famílias e grupos
- hóspedes individuais
- reservas
- alocação de quartos
- alocação de mesas
- requisições especiais

Esse ponto é especialmente importante porque nem todas as famílias ficam o evento inteiro. Algumas chegam apenas no começo, outras apenas no meio, outras saem antes.

Isso exige uma lógica de ocupação por intervalo de tempo, e não apenas uma fotografia estática.

---

### 4. Programação

Esse módulo organiza tudo o que acontece ao longo do evento.

Inclui:
- categorias de atividade
- atividades gerais
- localização
- público-alvo
- dependências entre atividades

O sistema deve compreender que há tipos diferentes de programação:
- atividades fixas
- atividades contínuas
- atividades pontuais
- atividades segmentadas por idade, gênero ou perfil

Esse módulo é mais do que uma agenda. Ele é um mapa operacional do dia.

---

### 5. Religioso

Esse é um módulo essencial para eventos como Pessach.

Inclui:
- minianim
- horários de reza
- aliyot
- shiurim
- espaços de sinagoga

Aqui o sistema precisa tratar particularidades que não existem em softwares genéricos de hotelaria ou eventos.

---

### 6. Staff e tarefas

Esse é o coração da execução operacional.

Inclui:
- membros da equipe
- equipes
- turnos
- tarefas
- comentários
- histórico de status

A ideia central aqui é que cada pessoa da equipe tenha sempre uma visão clara do que precisa fazer.

O app ou PWA do staff deve mostrar:
- o que fazer agora
- próximas tarefas
- prioridades
- atrasos
- incidentes

---

### 7. Supervisão e gerência

Esse módulo dá visibilidade para coordenadores e gerentes de equipe.

Inclui:
- visão das equipes
- distribuição de tarefas
- carga de trabalho
- Kanban operacional
- possibilidade de reatribuir tarefas
- acompanhamento de conclusão

Isso é importante para evitar que o sistema seja apenas uma lista solta de tarefas. Ele precisa também ser uma ferramenta de gestão.

---

### 8. Kashrut

Esse é um dos grandes diferenciais do projeto.

Inclui:
- mashguichim
- escalas de mashguichim
- supervisão por cozinha e refeição
- checklists de kashrut
- tarefas de kasherização

A operação kosher é uma parte crítica do evento, e não apenas um detalhe. Por isso ela precisa estar integrada ao sistema, inclusive com alertas e rastreabilidade.

---

### 9. Logística

Esse módulo organiza a movimentação de insumos e recursos.

Inclui:
- fornecedores
- entregas
- itens de entrega
- equipamentos
- movimentação de equipamentos
- locais de armazenamento

Em um evento grande, a logística interna faz enorme diferença. Alimentos, materiais e equipamentos precisam estar nos lugares corretos, no momento correto.

---

### 10. Regras operacionais

Esse módulo traduz restrições e políticas do evento.

Inclui:
- regras por espaço
- condições especiais
- horários
- restrições de acesso
- segmentação por público

Exemplos:
- piscina fechada em determinado contexto
- academia com horários masculinos e femininos
- espaço aberto ou fechado em função do momento do evento

Esse módulo aproxima o sistema de um motor de regras.

---

### 11. Achados e perdidos

Embora pareça secundário, esse módulo melhora muito a experiência dos hóspedes e a organização da equipe.

Inclui:
- itens perdidos
- itens encontrados
- reclamações
- possíveis vínculos entre perda e achado

Isso evita ruído na operação e reduz dependência de comunicação informal.

---

### 12. Autenticação e segurança

Esse módulo sustenta o acesso e a rastreabilidade.

Inclui:
- usuários
- papéis
- permissões
- logs de auditoria

É fundamental para que o sistema seja profissional, seguro e utilizável por diferentes perfis com escopos distintos.

---

## A lógica do produto

O sistema foi pensado para funcionar em camadas:

### Camada 1 — Estrutura
Onde e com o quê o evento acontece.

### Camada 2 — Planejamento
Quem estará no evento, o que foi programado, e como a operação deveria acontecer.

### Camada 3 — Execução
O que está acontecendo agora, o que está atrasado, o que precisa ser feito e por quem.

### Camada 4 — Supervisão
Quem coordena quem, onde estão os gargalos e como redistribuir o trabalho.

---

## O papel do PWA

Uma decisão importante do projeto é começar com um PWA.

Isso significa que o sistema poderá ser usado no celular como se fosse um app, sem depender inicialmente de publicação em loja.

Isso é especialmente útil para:
- equipes temporárias
- operação rápida
- onboarding simples
- uso em campo

No caso do staff, a experiência ideal não é navegar por menus complexos, mas abrir o sistema e ver imediatamente:

- minhas tarefas agora
- o que está crítico
- o que está atrasado
- o que devo fazer em seguida

---

## O diferencial do projeto

O valor deste sistema não está apenas em registrar informação.

O valor está em conectar:
- pessoas
- espaços
- tempo
- regras
- tarefas
- capacidade operacional

em um único ambiente.

Em vez de um software que apenas guarda dados, a proposta é construir uma plataforma que ajuda o evento a funcionar melhor.

---

## Como esse projeto pode crescer

O projeto pode começar como um sistema operacional para um evento específico, mas já nasce com estrutura para crescer para:

- múltiplos eventos
- múltiplos hotéis
- múltiplas equipes
- templates reutilizáveis
- dashboards
- inteligência operacional
- Kanban sensível à ocupação das equipes
- alertas automáticos
- produto SaaS no futuro

---

## Resumo final

Em linguagem simples, este projeto é:

> uma plataforma para organizar, coordenar e executar eventos complexos em hotéis, unindo hospedagem, programação, staff, kashrut, logística e tarefas em tempo real.

Ou, de forma ainda mais humana:

> um sistema para fazer um evento grande e complexo funcionar com menos improviso, mais clareza e mais controle.
