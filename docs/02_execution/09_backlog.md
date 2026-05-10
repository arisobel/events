# Backlog

## Immediate (Next Cycle) - 1-2 semanas

### Group -> Guest Expansion
- [ ] Definir contrato funcional: `GuestGroup` continua como contêiner operacional, `Guest` entra como subentidade
- [ ] Backend: criar schemas e serviços mínimos para CRUD de hóspedes individuais por grupo
- [ ] Backend: permitir marcar um `Guest` como líder do grupo
- [ ] Frontend: adicionar gestão de hóspedes dentro de `GuestsPage`
- [ ] Frontend: exibir membros do grupo sem quebrar o fluxo atual de reservas
- [ ] Testes: cobrir criação de grupo, inclusão de hóspedes e definição de líder

**Estimativa**: 6-10h  
**Valor**: fecha a principal lacuna funcional percebida no módulo de hóspedes sem reabrir o desenho do MVP

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

### UX Polish
- [ ] Implementar `HotelDetailPage.tsx`
- [ ] Melhorar a visualização entre reservas e alocações
- [ ] Adicionar mais contexto de hotel/evento nas telas do fluxo

**Estimativa**: 3-5h  
**Valor**: melhora usabilidade sem reabrir o core do MVP

---

## Short Term - 3-6 semanas

### Schedule Module
- [ ] Backend: models e CRUD de atividades
- [ ] Frontend: `SchedulePage.tsx`
- [ ] Timeline queries e filtros básicos

### Staff Module
- [ ] Backend: teams, members, shifts
- [ ] Frontend: `StaffPage.tsx`
- [ ] Visualização de turnos/disponibilidade

### Tables Module
- [ ] Backend: alocação de mesas por período
- [ ] Frontend: `TablesPage.tsx`
- [ ] Disponibilidade por refeição/período

---

## Mid Term - 2-3 meses

### Supervision Dashboard
- [ ] Queries agregadas de workload
- [ ] Kanban view melhorada
- [ ] Métricas operacionais

### Rules Engine
- [ ] Regras de espaço e restrições de tempo
- [ ] Integração com alocação
- [ ] Configuração de regras via frontend

### Logistics / Kashrut / Religious
- [ ] Completar módulos específicos do domínio
- [ ] Fechar fluxos especializados por operação

---

## Long Term - 3-6 meses

### PWA Features
- [ ] Offline support
- [ ] Background sync
- [ ] Push notifications

### Multi-tenancy Preparation
- [ ] `tenant_id` em entidades relevantes
- [ ] Isolação de dados
- [ ] Seleção de tenant em auth

### Intelligence Layer
- [ ] Sugestões de alocação
- [ ] Detecção automática de conflitos
- [ ] Automação assistida

---

## Notes

- O foco imediato deixou de ser apenas “estabilizar e validar o MVP” e passou a incluir a expansão planejada de `Guest` dentro de `GuestGroup`
- O core de ocupação já está entregue; próximos passos devem equilibrar evolução funcional, robustez e demonstração
