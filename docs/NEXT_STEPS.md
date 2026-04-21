# Next Steps - Reorganizado Após Auditoria

**Current Phase**: Phase 0 - Bootstrap (70% backend implementado, 0% validado)  
**Last Updated**: 21 de Abril de 2026 (Pós-auditoria)  
**Strategy**: Vertical Slice "First Login to First Hotel"

---

## 🎯 PRIORIDADE MÁXIMA: Vertical Slice "First Login to First Hotel"

### Objetivo
Provar que a stack funciona end-to-end antes de continuar implementando features.

### Escopo
Um fluxo completo funcional do início ao fim:
1. Usuário acessa aplicação frontend
2. Faz login com credenciais
3. Recebe token JWT
4. Vê lista de hotéis autenticado
5. Visualiza detalhes de um hotel

### Por que este slice?
- ✅ Valida **toda** a infraestrutura (PostgreSQL, Redis, Backend, Frontend)
- ✅ Testa autenticação JWT end-to-end
- ✅ Demonstra valor imediato (aplicação funcional)
- ✅ Usa 100% código já existente no backend (auth + hotel modules)
- ✅ Não depende de módulos parciais (guests, rooms)
- ✅ Reduz risco técnico massivamente

---

## 📋 FASE 1: Validar Backend Existente (1-2h) - CRÍTICO

### Objetivo
Provar que o backend implementado realmente funciona.

### Checklist de Validação

#### 1.1 Subir Infraestrutura Docker
- [ ] Executar docker-compose up -d postgres redis
- [ ] Verificar logs do PostgreSQL
- [ ] Verificar logs do Redis
- [ ] Confirmar que ambos estão healthy

#### 1.2 Aplicar Migração Alembic
- [ ] Instalar dependências Python (pip install -r requirements.txt)
- [ ] Executar alembic upgrade head
- [ ] Verificar 22 tabelas criadas no PostgreSQL
- [ ] Confirmar naming convention (t_, f_)

#### 1.3 Criar Usuário Seed
- [ ] Criar script seed_data.py
- [ ] Executar e criar usuário admin
- [ ] Verificar registro em t_user

#### 1.4 Iniciar Backend
- [ ] Executar uvicorn app.main:app --reload
- [ ] Verificar startup sem erros
- [ ] Acessar http://localhost:8000
- [ ] Acessar http://localhost:8000/health
- [ ] Acessar http://localhost:8000/docs

#### 1.5 Testar Autenticação
- [ ] curl POST /auth/login com admin/admin123
- [ ] Verificar token JWT retornado
- [ ] Validar token em jwt.io

#### 1.6 Testar Endpoint Autenticado
- [ ] curl POST /hotels (criar hotel)
- [ ] curl GET /hotels (listar)
- [ ] curl GET /hotels/1 (detalhes)
- [ ] Verificar 401 sem token

#### 1.7 Documentar Resultados
- [ ] Criar VALIDATION_BACKEND_21_04_2026.md
- [ ] Screenshots de /docs
- [ ] Output dos comandos curl
- [ ] Logs do backend
- [ ] Problemas encontrados e soluções

---

## 📋 FASE 2: Frontend Mínimo (3-4h) - CRÍTICO

### 2.1 Inicializar Projeto
- [ ] npm create vite - React + TypeScript
- [ ] npm install
- [ ] Verificar build funciona

### 2.2 Instalar Dependências
- [ ] axios
- [ ] react-router-dom
- [ ] @tanstack/react-query
- [ ] tailwindcss (dev)

### 2.3 Configurar Tailwind
- [ ] tailwind.config.js
- [ ] src/index.css com @tailwind

### 2.4 Implementar Services
- [ ] src/services/api.ts (axios + interceptors)
- [ ] Interceptor adiciona token
- [ ] Interceptor redireciona em 401

### 2.5 Implementar Auth Context
- [ ] src/hooks/useAuth.tsx
- [ ] AuthProvider component
- [ ] login(), logout() functions
- [ ] isAuthenticated state

### 2.6 Implementar LoginPage
- [ ] src/pages/LoginPage.tsx
- [ ] Form com username/password
- [ ] Submit chama login()
- [ ] Redirect para /hotels
- [ ] Error handling

### 2.7 Implementar HotelsPage
- [ ] src/pages/HotelsPage.tsx
- [ ] useQuery para carregar hotéis
- [ ] Renderizar lista com Tailwind
- [ ] Button de logout
- [ ] Loading e error states

### 2.8 Configurar Router
- [ ] src/App.tsx
- [ ] BrowserRouter
- [ ] Route /login
- [ ] Protected Route /hotels
- [ ] PrivateRoute component

### 2.9 Executar Frontend
- [ ] npm run dev
- [ ] Verificar :5173 acessível
- [ ] Sem erros no console

---

## 📋 FASE 3: Validação End-to-End (1h)

### 3.1 Testar Fluxo Completo
- [ ] Backend :8000 + Frontend :5173 rodando
- [ ] Acessar http://localhost:5173
- [ ] Login com admin/admin123
- [ ] Verificar redirect para /hotels
- [ ] Ver lista de hotéis
- [ ] Abrir DevTools Network
- [ ] Confirmar POST /auth/login → 200
- [ ] Confirmar GET /hotels com Authorization
- [ ] Verificar token em localStorage

### 3.2 Screenshots
- [ ] 01_login_page.png
- [ ] 02_hotels_list.png
- [ ] 03_devtools_network.png
- [ ] 04_backend_docs.png

### 3.3 Escrever 1 Teste
- [ ] backend/tests/conftest.py
- [ ] backend/tests/test_auth.py
- [ ] pytest executando com sucesso

---

## 📋 FASE 4: Documentação (30min)

### 4.1 Atualizar Docs
- [x] PROJECT_EVOLUTION.md com auditoria
- [x] NEXT_STEPS.md reorganizado
- [ ] VALIDATION_21_04_2026.md criado
- [ ] README.md seção "Running"

### 4.2 Limpar Código
- [ ] Investigar app/api/routes/hotel.py
- [ ] .gitkeep em pastas vazias

---

## ✅ Definition of Done - Vertical Slice

### Backend
- [ ] Docker Compose rodando
- [ ] Migration aplicada (22 tabelas)
- [ ] Backend sem erros
- [ ] /docs acessível
- [ ] Login retornando token
- [ ] GET /hotels funcionando
- [ ] 1 teste passando

### Frontend
- [ ] Vite + React inicializado
- [ ] Dependencies instaladas
- [ ] LoginPage renderizando
- [ ] HotelsPage listando
- [ ] Auth context funcionando
- [ ] Token em localStorage
- [ ] Protected route OK

### Integração
- [ ] Login end-to-end
- [ ] Token em requests
- [ ] Dados carregando
- [ ] Logout funcionando
- [ ] Screenshots documentados

### Docs
- [x] PROJECT_EVOLUTION.md
- [x] NEXT_STEPS.md
- [ ] VALIDATION_21_04_2026.md
- [ ] README.md

---

## 🔄 Após Completar o Slice

**Decisão a tomar**: Completar módulos parciais (guests, rooms) OU próximo vertical slice?

**Critério**: Prioridade de negócio

**Não fazer antes**: Novos módulos, PWA, otimizações

**Fazer quando validado**: Mais testes, CI/CD, linting

---

**Last Validation**: Pending  
**Current Focus**: Fase 1 - Validar Backend  
**Blocker**: Nenhum  
**Risk**: Médio
