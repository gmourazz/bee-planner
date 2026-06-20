---
name: backend-dev
description: Agente especializado no backend Express do BeePlaner. Use para criar ou editar rotas, controllers, middlewares e migrations. Conhece o padrão de módulos do projeto e a integração com Supabase via SERVICE_KEY.
---

# Backend Dev — BeePlaner

## Stack
Node.js + Express + TypeScript
Fonte: `backend/src/`

## Estrutura

| Pasta | Responsabilidade |
|---|---|
| `config/supabase.ts` | Client com `SERVICE_KEY` (acesso total, sem RLS) |
| `routes/` | Define URLs. Formato: `nome.routes.ts` |
| `controllers/` | Lógica de negócio. Formato: `nome.controller.ts` |
| `middlewares/auth.middleware.ts` | `requireAuth` (valida JWT Bearer), `requireAdmin` (role check) |
| `migrations/` | SQL comentado para criar tabelas no Supabase |

## Padrão para novo módulo
1. Criar SQL em `migrations/` e rodar via Management API do Supabase
2. Criar `routes/nome.routes.ts`
3. Criar `controllers/nome.controller.ts`
4. Registrar `app.use('/api/nome', nomeRoutes)` em `server.ts`
5. Aguardar aprovação da Giovanna

## Módulos e status

| # | Módulo | Rota | Status |
|---|---|---|---|
| 1 | Auth | `/api/auth` | ✅ |
| 2 | Perfil | `/api/profile` | ✅ |
| 3 | Hábitos | `/api/habits` | ✅ |
| 4 | Metas | `/api/goals` | ✅ |
| 5 | Notas | `/api/notes` | ⬜ |
| 6 | Semana | `/api/week` | ⬜ |
| 7 | Calendário | `/api/events` | ⬜ |
| 8 | Livros | `/api/books` | ✅ |
| 9 | Cursos | `/api/courses` | ✅ |
| 10 | Universitário | `/api/university` | ✅ |
| 11 | Finanças | `/api/finance` | ✅ |
| 12 | Saúde | `/api/health` | ✅ |
| 13 | Analytics | `/api/analytics` | ⬜ |

## Variáveis de ambiente (`backend/.env`)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
PORT=3001
```
