# Backlog

## Immediate (Next Cycle) - 1-2 semanas

### CapRover Deployment Readiness
- [x] Criar `deploy-caprover.ps1` para gerar pacote `.tar` versionado por timestamp em `/dist`
- [ ] Criar estratégia final de apps CapRover separados: backend, frontend, PostgreSQL e Redis opcional
- [ ] Mover/criar `captain-definition` de produção no local esperado pelo fluxo de deploy escolhido
- [ ] Ajustar comando de produção do backend para rodar sem `--reload`
- [ ] Definir e implementar estratégia de migrations em produção
- [ ] Configurar CORS de produção usando domínio real do frontend
- [ ] Adicionar suporte frontend a `VITE_API_URL`
- [ ] Criar Dockerfile de produção para frontend estático com fallback SPA
- [ ] Definir bootstrap seguro de usuário admin em produção
- [ ] Validar `/health`, `/docs` e fluxo MVP em staging CapRover

**Estimativa**: 5-8h  
**Valor**: torna o MVP publicável em ambiente controlado sem depender de Codespaces/local

---

### Guest Consistency + Enums
- [ ] Implementar regra visual de consistência: `reservation.f_total_guests >= group.guests.length`
- [ ] Exibir warning não-bloqueante quando `f_total_guests < hóspedes cadastrados`
- [ ] Definir comportamento visual da inconsistência sem impedir operação
- [ ] Trocar `Gender` de texto livre para enum controlado
- [ ] Trocar `GuestType` de texto livre para enum controlado com `adult`, `child`, `infant`, `staff`
- [ ] Preservar `f_is_group_leader` como atributo separado de `GuestType`
- [ ] Cobrir a nova regra e os enums em testes backend/frontend

**Estimativa**: 4-7h  
**Valor**: melhora consistência operacional sem engessar a operação real do evento

---

### CI + Automated Verification
- [ ] Configurar GitHub Actions para `pytest backend/tests`
- [ ] Configurar GitHub Actions para `npm run build`
- [ ] Adicionar execução combinada de backend + frontend no pipeline

**Estimativa**: 3-5h  
**Valor**: endurece o MVP interno recém-fechado

---

### API-Level Integration Tests
- [ ] Investigar e estabilizar harness de testes HTTP/ASGI
- [ ] Cobrir login, grupos, reservas, alocações e tasks via API
- [ ] Manter testes de serviço como baseline rápida

**Estimativa**: 4-6h  
**Valor**: reduz risco entre regra de negócio e camada HTTP

---

### Validation Package
- [ ] Capturar screenshots do fluxo MVP
- [ ] Criar relatório de validação do MVP interno
- [ ] Validar fluxo completo em Codespaces

**Estimativa**: 2-3h  
**Valor**: transforma implementação em evidência demonstrável

---

### Guest Flow Refinement
- [x] Revisar política para sincronismo entre hóspedes cadastrados e `reservation.f_total_guests`
- [ ] Implementar a política escolhida em UI/backend
- [ ] Decidir se o líder do grupo também deve ser referenciado explicitamente em `GuestGroup`
- [ ] Preparar terreno para check-in futuro sem quebrar reservas no nível do grupo

**Estimativa**: 3-5h  
**Valor**: transforma a nova camada de hóspedes em base sólida para próximas operações

---

### UX Polish
- [ ] Implementar `HotelDetailPage.tsx`
- [ ] Melhorar a visualização entre reservas e alocações
- [ ] Adicionar mais contexto de hotel/evento nas telas do fluxo

**Estimativa**: 3-5h  
**Valor**: melhora usabilidade sem reabrir o core do MVP

---

## Immediate — Próximo Ciclo

### 🔴 PRIORITY 1: Módulo Financeiro — Grade de Quartos
> Gestor estratégico/financeiro: substitui a planilha principal de alocação e receita

**Backend — Phase 1 (Grade de ocupação):**
- [ ] Adicionar precificação a `HotelRoom`: `f_price_per_night`, `f_room_type_label`
- [ ] Adicionar campos financeiros a `Reservation`: `f_amount_total`, `f_amount_paid`, `f_payment_status` (pending/partial/paid), `f_payment_notes`
- [ ] Endpoint `GET /events/{id}/room-grid` — retorna grade: quartos × períodos × família alocada + status financeiro
- [ ] Endpoint `GET /events/{id}/financial-summary` — totais: receita esperada, recebida, pendente, ocupação %
- [ ] Endpoint `GET /guest-groups/{id}/invoice` — extrato por família: quartos, períodos, extras, total, pago, saldo

**Backend — Phase 2 (Extras e exclusivos):**
- [ ] Modelo `ReservationExtra`: item extra por reserva (sala exclusiva de refeição, serviço) com valor
- [ ] Endpoint de adição/remoção de extras por reserva
- [ ] Incluir extras no extrato da família

**Frontend (Gestão — Financeiro):**
- [ ] Grade visual de quartos × datas (estilo planilha/calendar grid) com cor por status de ocupação
- [ ] Painel financeiro do evento: ocupação % + receita total/recebida/pendente
- [ ] Tela de extrato por família com registro de pagamentos

**Estimativa**: 8-12h backend / 6-10h frontend  
**Valor**: substitui a planilha Excel do gestor financeiro; visibilidade total de ocupação e receita

---

### 📺 Displays de TV — Grade do Dia
> Telas espalhadas pelo hotel mostrando cronograma e evento iminente, segmentadas por público
>
> Originado em sessão 2026-07-01

**Conceito:**
- Endpoint público (sem auth) que retorna/renderiza o cronograma do dia
- Consumido por TVs do hotel — auto-refresh a cada N minutos
- Segmentado por público: Geral / Homens / Mulheres / Infantil
- Destaque para o evento iminente (próxima atividade em até 30 min)

**Backend:**
- [ ] `GET /display/{event_id}/today` — atividades do dia, ordenadas por horário
- [ ] `GET /display/{event_id}/now` — atividade atual + próxima (para destaque)
- [ ] Parâmetro `?audience=all|men|women|children` para filtrar por público
- [ ] Sem autenticação — endpoint público read-only

**Frontend (Display):**
- [ ] Página `DisplayPage` fullscreen, sem chrome (sem menu, sem header)
- [ ] Layout landscape: hora + título + local + público + próximo evento
- [ ] Auto-refresh a cada 2 minutos
- [ ] Versão QR code: link do display → leva para o app do hóspede
- [ ] URL padrão: `events.lion.app.br/display/{event_id}?audience=all`

**Depende de:** Módulo Activities (cronograma de atividades)  
**Estimativa**: 3-4h backend / 4-6h frontend  
**Valor**: presença física do sistema no hotel; visibilidade para hóspedes sem precisar do app

---

## Short Term - 3-6 semanas

### Auth: Troca de Senha + Roles na UI
- [ ] Endpoint `POST /auth/change-password` (hoje só via docker exec)
- [ ] UI de perfil com troca de senha
- [ ] Tela de gerenciamento de usuários e patentes (admin)
- [ ] Proteger rotas por role no frontend (gestão vs. outras patentes)

**Valor**: operação básica sem acesso à VPS; base para múltiplos perfis de acesso

---

### Módulo Funcionários (Staff)
> Originado nas notas de Michel (Gestão — Cadastro Funcionários)
- [ ] Backend: modelo `Employee` — dados pessoais, função, períodos de trabalho, salário
- [ ] Backend: CRUD + vínculo com evento
- [ ] Frontend: `StaffPage.tsx` — lista, cadastro, edição
- [ ] Visualização de turnos por evento

**Valor**: substitui controle manual de equipe; base para alocação de staff em atividades

---

### Eventos: Detalhamento Operacional
> Originado nas notas de Michel (Gestão — Eventos)
- [ ] Adicionar campos ao evento: `local`, `necessidades` (comida, staff), `publico_alvo` (crianças/adultos/misto/todos)
- [ ] Calendário visual de eventos por hotel
- [ ] Duração calculada (data início/fim já existem)

**Valor**: enriquece o contexto operacional do evento sem mudar a estrutura central

---

### Hóspedes: Dados Financeiros da Reserva
> Originado nas notas de Michel (Gestão — Cadastro Hóspedes)
- [ ] Adicionar a `Reservation`: `valor_pago`, `dias_hospedados`
- [ ] Exibir total por grupo/família na UI
- [ ] (Decidir) divisão por famílias: sub-agrupamento dentro do GuestGroup?

**Valor**: fecha o ciclo operacional do hóspede; base para o módulo financeiro

---

### Organização de Mesas
> Originado nas notas de Michel (Gestão — Organização Mesas/Salas)
- [ ] Backend: modelo `TableAssignment` — mesa, família/grupo, refeição/período
- [ ] Frontend: `TablesPage.tsx` — atribuição de mesas por família
- [ ] “Em qual mesa minha família está?” — query por grupo

**Valor**: resolve uma das perguntas mais frequentes em eventos desse tipo

---

### Schedule Module (Cronograma de Atividades)
> Base para o App do Hóspede e para a Gestão
- [ ] Backend: modelo `Activity` — tipo, horário, local, público-alvo, duração
- [ ] Tipos: religioso, infantil, refeições, entretenimento/piscina/ACAD
- [ ] Backend: CRUD com filtros por tipo e período
- [ ] Frontend (gestão): `SchedulePage.tsx` — cadastro e edição de atividades

**Valor**: backbone do cronograma que tanto o hóspede quanto a gestão vão consumir

---

## Mid Term - 2-3 meses

### App do Hóspede ⚠️ Decisão arquitetural pendente
> Originado nas notas de Michel (Usuário: Hóspede) — superfície nova e independente
>
> **Decisão necessária**: seção separada no mesmo frontend (`/guest/...`) ou novo app (`guest.events.lion.app.br`)?

**Auth do hóspede:**
- [ ] Login via código do evento + sobrenome + número do quarto (sem username/senha)
- [ ] Token de sessão isolado do auth administrativo

**Tela inicial:**
- [ ] Atividades ocorrendo agora e próximas (consome Schedule Module)

**Cronograma:**
- [ ] Visualização filtrada por tipo (religioso, infantil, refeições, entretenimento)
- [ ] Filtros configuráveis pelo contratante/gestor

**Reservas:**
- [ ] Restaurantes — calendário com horários disponíveis
- [ ] Salas — calendário + forma de pagamento
- [ ] Gerenciar minhas reservas

**Achados e Perdidos:**
- [ ] Upload de imagem + descrição
- [ ] Visualizar registros de outros hóspedes

**Infos:**
- [ ] Telefones e ramais importantes (cadastrados pela gestão)

**Serviços:**
- [ ] Babá, enfermeira e outros serviços disponíveis (configurável)

**”Em qual mesa minha família está?”:**
- [ ] Query por sobrenome/número do quarto → retorna mesa atribuída

**Valor**: transforma o produto de interno para hóspede — diferencial do sistema

---

### Módulo Financeiro
> Originado nas notas de Michel (Gestão — Financeiro) — escopo a definir
- [ ] **Definir escopo**: só visualização de receitas, ou também controle de pagamentos?
- [ ] Dashboard financeiro por evento: total de reservas, valor pago, saldo
- [ ] Extrato por hóspede/família
- [ ] (Futuro) integração com formas de pagamento

**Valor**: fecha o ciclo para a alta administração — visão de receita por evento

---

### Supervision Dashboard (Alta Administração)
- [ ] Visão consolidada de todos os eventos ativos
- [ ] Métricas: ocupação, tarefas pendentes, staff alocado
- [ ] Alertas operacionais

---

### Módulo Achados e Perdidos
- [ ] Backend: modelo `LostItem` — descrição, imagem, data, status (perdido/encontrado/devolvido)
- [ ] Upload de imagem (storage local ou S3)
- [ ] API pública (hóspede sem auth pode consultar)

---

## Long Term - 3-6 meses

### PWA Features
- [ ] Offline support para o App do Hóspede
- [ ] Push notifications para atividades e reservas
- [ ] Background sync

### Multi-tenancy Preparation
- [ ] `tenant_id` em entidades relevantes
- [ ] Isolação de dados por operadora de evento
- [ ] Seleção de tenant em auth

### Intelligence Layer
- [ ] Sugestões de alocação de quartos/mesas
- [ ] Detecção automática de conflitos de agenda
- [ ] Automação assistida de tarefas recorrentes

---

## Notes

- O foco imediato volta a ser “estabilizar e validar o MVP”, agora com a camada `Guest` já entregue
- O core de ocupação e a gestão individual de hóspedes já estão funcionais; próximos passos devem equilibrar robustez, demonstração e refinamento de regras
- A próxima regra funcional já definida é: inconsistência entre hóspedes cadastrados e total reservado gera warning, não bloqueio
- **2026-07-01**: Notas de produto de Michel incorporadas — App do Hóspede e expansão da Gestão entram como horizontes estruturantes do produto
