---
description: Checklist para criar um novo módulo no BeePlaner (backend + frontend)
---

# Novo módulo — BeePlaner

## Passo a passo

### 1. Backend
- [ ] Criar SQL em `backend/src/migrations/NNN_create_nome.sql`
- [ ] Rodar migration via Management API do Supabase
- [ ] Criar `backend/src/routes/nome.routes.ts`
- [ ] Criar `backend/src/controllers/nome.controller.ts`
- [ ] Registrar em `backend/src/server.ts`: `app.use('/api/nome', nomeRoutes)`
- [ ] Testar endpoint com curl ou Postman

### 2. Frontend
- [ ] Criar `frontend/src/services/nome.ts` (funções async + cache)
- [ ] Criar `frontend/src/hooks/useNome.ts`
- [ ] Criar `frontend/src/pages/NomePage.tsx`
- [ ] Adicionar rota em `frontend/src/App.tsx`
- [ ] Adicionar item no `Sidebar`

### 3. Validação
- [ ] Testar no browser (desktop + mobile)
- [ ] Verificar TypeScript: `npm run build`
- [ ] Aguardar aprovação da Giovanna antes de iniciar o próximo módulo
