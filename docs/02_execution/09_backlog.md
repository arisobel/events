# Backlog

## Immediate (Next Cycle) - 1-2 semanas

### Testes Automatizados (PRIORITY 1)
- [ ] Criar estrutura pytest básica
  - [ ] backend/tests/conftest.py com fixtures
  - [ ] backend/tests/test_auth.py com 3 testes
- [ ] Validar execução: `pytest` deve passar com 3 testes verdes
- [ ] Documentar como rodar testes no README.md

**Estimativa**: 2-4h  
**Valor**: Base para prevenir regressões

---

### Completar Módulos Guests/Rooms (PRIORITY 2)
- [ ] Backend: Implementar endpoints faltantes em Guests
  - [ ] GET /guests/{id}
  - [ ] PUT /guests/{id}
  - [ ] DELETE /guests/{id}
- [ ] Backend: Implementar endpoints faltantes em Rooms
  - [ ] GET /rooms/{id}
  - [ ] PUT /rooms/{id}
  - [ ] POST /rooms (alocação)
- [ ] Frontend: Criar GuestsPage.tsx
- [ ] Frontend: Criar RoomsPage.tsx
- [ ] Validar fluxo de reservas end-to-end

**Estimativa**: 6-8h  
**Valor**: Permite gestão completa de reservas

---

### Expandir Frontend - Hotel Details (PRIORITY 3)
- [ ] Implementar HotelDetailPage.tsx
  - [ ] Route /hotels/:id
  - [ ] Fetch hotel data via API
  - [ ] Exibir nome, cidade, espaços, quartos
  - [ ] Botão "Voltar para lista"
- [ ] Adicionar link em HotelCard
- [ ] Validar navegação bidirecional

**Estimativa**: 2-3h  
**Valor**: Expande UX sem adicionar backend

---

### Limpeza de Código (PRIORITY 4)
- [ ] Investigar /backend/app/api/routes/hotel.py
  - [ ] Verificar se é duplicado de modules/hotel/router.py
  - [ ] Deletar se duplicado
- [ ] Adicionar .gitkeep em módulos vazios (Phase 2+)
  - [ ] kashrut/, logistics/, lost_found/, rules/, schedule/
- [ ] Verificar imports não utilizados (pylint/flake8)
- [ ] Atualizar README.md com seção "Running the Project"

**Estimativa**: 1-2h  
**Valor**: Manutenibilidade

---

## Short Term - 3-6 semanas

### Schedule Module (Backend + Frontend)
- [ ] Backend: Criar models para Activities, Categories
- [ ] Backend: Implementar CRUD de Activities
- [ ] Backend: Implementar timeline queries
- [ ] Frontend: Criar SchedulePage.tsx com visualização de agenda
- [ ] Frontend: Adicionar filtros por categoria, audiência

**Estimativa**: 8-12h  
**Valor**: Feature core para eventos

---

### Staff Module (Backend + Frontend)
- [ ] Backend: Completar models de Teams, Members, Shifts
- [ ] Backend: Implementar CRUD de Staff
- [ ] Backend: Implementar lógica de turnos
- [ ] Frontend: Criar StaffPage.tsx
- [ ] Frontend: Visualização de turnos/disponibilidade

**Estimativa**: 8-12h  
**Valor**: Gestão de equipes operacionais

---

### Tables Module
- [ ] Backend: Implementar alocação de mesas por período
- [ ] Backend: Queries de disponibilidade
- [ ] Frontend: TablesPage.tsx com drag-and-drop
- [ ] Frontend: Visualização por refeição/período

**Estimativa**: 10-14h  
**Valor**: Organização de refeições

---

### CI/CD Pipeline
- [ ] Configurar GitHub Actions
  - [ ] Job de testes (pytest)
  - [ ] Job de linting (flake8, black)
  - [ ] Job de build frontend
- [ ] Configurar deploy automático para CapRover
- [ ] Adicionar badges no README.md

**Estimativa**: 4-6h  
**Valor**: Qualidade e deployment automatizado

---

## Mid Term - 2-3 meses

### Religious Module
- [ ] Backend: Models para Minyanim, Prayers, Aliyot, Shiurim
- [ ] Backend: CRUD + scheduling logic
- [ ] Frontend: ReligiousPage.tsx com agenda de atividades religiosas
- [ ] Frontend: Gestão de aliyot assignments

**Estimativa**: 12-16h  
**Valor**: Feature específica para eventos religiosos

---

### Kashrut Module (Phase 2)
- [ ] Backend: Models para Mashguichim, Shifts, Checklists
- [ ] Backend: Lógica de cobertura de cozinhas
- [ ] Frontend: KashrutPage.tsx
- [ ] Frontend: Dashboard de supervisão

**Estimativa**: 16-20h  
**Valor**: Compliance kasher

---

### Logistics Module
- [ ] Backend: Suppliers, Deliveries, Equipment
- [ ] Backend: Tracking de movimentação de equipamentos
- [ ] Frontend: LogisticsPage.tsx
- [ ] Frontend: Timeline de entregas

**Estimativa**: 12-16h  
**Valor**: Gestão de fornecedores e equipamentos

---

### Rules Engine
- [ ] Backend: Models para Space Rules, Time Restrictions
- [ ] Backend: Validation engine para aplicar regras
- [ ] Backend: Integração com módulos de alocação
- [ ] Frontend: RulesPage.tsx para configuração

**Estimativa**: 16-24h  
**Valor**: Automação de validações

---

### Supervision Dashboard
- [ ] Backend: Queries agregadas de workload
- [ ] Backend: WebSocket para updates em tempo real
- [ ] Frontend: Kanban view melhorada
- [ ] Frontend: Métricas e gráficos

**Estimativa**: 12-16h  
**Valor**: Visibilidade para gestores

---

## Long Term - 3-6 meses

### PWA Features
- [ ] Configurar Service Worker
- [ ] Implementar offline support
- [ ] Background sync de tasks
- [ ] Push notifications
- [ ] Add to homescreen prompt

**Estimativa**: 20-30h  
**Valor**: UX mobile-first para staff

---

### Lost & Found Module
- [ ] Backend: Items, Claims, Matching logic
- [ ] Backend: Estado de itens (lost, found, claimed, returned)
- [ ] Frontend: LostFoundPage.tsx
- [ ] Frontend: Interface de matching

**Estimativa**: 10-14h  
**Valor**: Feature adicional útil

---

### Multi-tenancy Preparation
- [ ] Database: Adicionar tenant_id em tabelas relevantes
- [ ] Backend: Filtros automáticos por tenant
- [ ] Backend: Isolação de dados
- [ ] Authentication: Tenant selection

**Estimativa**: 30-40h  
**Valor**: Preparação para SaaS

---

### Intelligence Layer (AI/Automation)
- [ ] Auto-prioritization de tasks (ML)
- [ ] Sugestões de alocação (rooms, tables)
- [ ] Detecção de conflitos automática
- [ ] Chatbot para consultas

**Estimativa**: 40-60h  
**Valor**: Diferenciação competitiva

---

## Parked / Future Considerations

### Mobile App Nativo (React Native)
- Substituir PWA se necessário
- Acesso a features nativas (câmera, GPS)
- App store distribution

**Decisão**: Avaliar após validação PWA

---

### Integrações Externas
- [ ] PMS (Property Management System) integration
- [ ] Payment gateways
- [ ] Email/SMS providers
- [ ] Calendar sync (Google/Outlook)

**Decisão**: Avaliar demanda de clientes

---

### Reporting & Analytics
- [ ] Dashboard executivo
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Histórico de eventos
- [ ] Métricas de performance

**Estimativa**: 20-30h  
**Decisão**: Após MVP validado

---

## Notes

- Prioridades baseadas em PRD.md e valor incremental
- Estimativas são aproximadas, podem variar com descobertas técnicas
- Backlog será refinado continuamente baseado em feedback
- Foco atual: **Completar Phase 1 (Core Backend)** antes de expandir para Phase 2
