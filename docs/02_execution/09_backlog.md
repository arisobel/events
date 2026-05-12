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

- O foco imediato volta a ser “estabilizar e validar o MVP”, agora com a camada `Guest` já entregue
- O core de ocupação e a gestão individual de hóspedes já estão funcionais; próximos passos devem equilibrar robustez, demonstração e refinamento de regras
- A próxima regra funcional já definida é: inconsistência entre hóspedes cadastrados e total reservado gera warning, não bloqueio
