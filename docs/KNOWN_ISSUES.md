# 🧠 KNOWN ISSUES — Event Platform

## 🔐 Login Issues (Codespaces / CORS)

### Problema
Login falha no frontend com erro de CORS ou 401.

### Causa
- **Porta privada**: Por padrão, Codespaces configura portas como privadas, exigindo autenticação
- Backend rodando em porta diferente (8000) do frontend (5173)
- Mismatch de hostname/URL entre frontend e backend

### Solução Aplicada ✅

1. **Tornar portas públicas** (mais importante):
```bash
# Script automatizado criado em /workspaces/events/make_ports_public.sh
gh codespace ports visibility 8000:public -c "$CURRENT_CODESPACE"
gh codespace ports visibility 5173:public -c "$CURRENT_CODESPACE"
```

2. **Detecção automática de URL no frontend**:
   - O arquivo [`frontend/src/services/api.ts`](frontend/src/services/api.ts) já implementa detecção automática
   - Substitui porta `-5173` por `-8000` nas URLs do Codespaces
   - Usa HTTPS automaticamente em produção

3. **CORS configurado no backend**:
   - [`backend/app/main.py`](backend/app/main.py) permite origem do Codespaces via regex
   - Pattern: `https://.*\.app\.github\.dev`

### Como Aplicar a Solução

```bash
# 1. Iniciar banco de dados
cd infrastructure && docker-compose up -d postgres redis

# 2. Aplicar migrações
cd ../backend && alembic upgrade head

# 3. Iniciar backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Tornar portas públicas
cd /workspaces/events && ./make_ports_public.sh

# 5. Iniciar frontend (em outro terminal)
cd frontend && npm run dev
```

### Validação

```bash
# Testar backend diretamente
curl -X POST https://<codespace>-8000.app.github.dev/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

# Usar script de teste
cd backend && bash test_login_flow.sh
```

### Regra
✅ Sempre validar login antes de considerar frontend funcional.
✅ Verificar que portas 5173 e 8000 estão públicas no Codespaces.

### Última Resolução
**Data**: 22/04/2026  
**Status**: ✅ Resolvido  
**Créditos de login**: admin / admin123