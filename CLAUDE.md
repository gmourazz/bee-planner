# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Regra de ouro
**Sempre aguardar aprovação da Giovanna antes de passar para a próxima etapa.**
Cada módulo é construído um por vez, de forma incremental.

---

## Comandos

### Frontend (`frontend/`)
```bash
npm run dev      # inicia em http://localhost:5173
npm run build    # build de produção
```

### Backend (`backend/`)
```bash
npm run dev      # inicia com hot-reload em http://localhost:3001
npm run build    # compila TypeScript → dist/
npm start        # executa dist/server.js em produção
```

### Verificar tipos
```bash
cd frontend && npx tsc --noEmit
cd backend  && npx tsc --noEmit
```

**`frontend/.env`**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001
```

**`backend/.env`**
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
PORT=3001
```

---

## Arquitetura

### Decisão crítica: onde chamar o Supabase
A maioria das páginas chama o **Supabase diretamente** no frontend (usando `VITE_SUPABASE_ANON_KEY` + RLS). O backend Express existe para operações que exigem `SERVICE_KEY`. **Não adicionar chamadas ao backend Express em páginas que já funcionam com Supabase direto.**

Para chamar o backend autenticado, usar `apiFetch` de `lib/client.ts` — ela injeta automaticamente o JWT da sessão atual no header `Authorization`.

### Frontend (`frontend/src/`)

| Pasta | Responsabilidade |
|---|---|
| `pages/` | Uma página por rota. Sem lógica pesada — delega para hooks/services |
| `components/` | Componentes compartilhados: `Sidebar`, `PageLayout`, `Toast`, `FloatingBee`, `ui/` |
| `services/` | Chamadas ao Supabase. Exportam funções async puras (`fetchHabits`, `createHabit`, etc.) |
| `hooks/` | Encapsulam estado + operações de uma página (`useHabits`). Usam os services |
| `contexts/` | `AuthContext` (sessão global), `ThemeContext` (tema ativo) |
| `lib/` | `supabase.ts` (client anon), `client.ts` (apiFetch autenticado para o backend) |
| `types/` | Interfaces TypeScript por domínio (`nome.types.ts`) |
| `enums/` | Constantes: `HabitIconKey`, `HABIT_COLORS` |
| `utils/` | Helpers puros: `calcStreak`, `getLast7Days`, `compressImage` |

### Fluxo de autenticação e rotas

`App.tsx` tem dois layouts distintos:
- **Não autenticado** (`AppContent`): rotas `/` (Welcome) e `/login` (LoginPage com tabs Entrar/Criar conta)
- **Autenticado** (`AppLayout`): todas as rotas internas com `Sidebar` + `PageLayout`

**Regras de AuthContext:**
- Inicializa com `supabase.auth.getSession()` (síncrono, lê localStorage)
- **Nunca usar** `supabase.auth.getUser()` — faz chamada de rede e é lento
- Avatar URL cacheado em `localStorage('beeplanner_avatar_url')` para carregamento instantâneo
- Email de confirmação desativado no Supabase — cadastro retorna sessão imediata

### Sistema de temas (`ThemeContext`)
12 temas, cada um com `{ id, name, category, colors, emoji }`. Tokens de `colors`:
`primary`, `primaryLight`, `primaryDark`, `accent`, `background`, `surface`, `text`, `textMuted`

Todos os estilos visuais usam esses tokens via `style={{ color: currentTheme.colors.primary }}`.
Tema `tech` aplica `filter: grayscale(1)` em todo `AppLayout`, **exceto** `/perfil` (preserva foto do usuário).

### PageLayout
- Envolve todas as rotas autenticadas
- Exibe header (ícone + título) apenas para rotas presentes em `ROUTE_MAP` — `/inicio` não tem header
- **Páginas não devem ter `<h1>` próprio** — o `PageLayout` já exibe o título

### Pattern de cache em services
```typescript
let _cache: { userId: string; data: T[] } | null = null
export function invalidateCache() { _cache = null }
// fetchXxx() retorna _cache se userId bater; caso contrário faz queries paralelas
// createXxx/deleteXxx/toggleXxx chamam invalidateCache() antes de retornar
```

### Backend (`backend/src/`)

| Pasta | Responsabilidade |
|---|---|
| `config/supabase.ts` | Client com `SERVICE_KEY` (acesso total, sem RLS) |
| `routes/` | Define URLs. Formato: `nome.routes.ts` |
| `controllers/` | Lógica de negócio. Formato: `nome.controller.ts` |
| `middlewares/auth.middleware.ts` | `requireAuth` (valida JWT Bearer), `requireAdmin` (role check) |
| `migrations/` | SQL comentado para criar tabelas no Supabase |

**Padrão para novo módulo backend:**
1. Criar SQL em `migrations/` e rodar via Management API do Supabase
2. Criar `routes/nome.routes.ts`
3. Criar `controllers/nome.controller.ts`
4. Registrar `app.use('/api/nome', nomeRoutes)` em `server.ts`
5. Aguardar aprovação da Giovanna para o próximo módulo

---

## Módulos

| # | Módulo | Rota base | Status |
|---|---|---|---|
| 1 | Auth | `/api/auth` | ✅ Feito |
| 2 | Perfil | `/api/profile` | ✅ Feito |
| 3 | Hábitos | `/api/habits` | ✅ Feito |
| 4 | Metas | `/api/goals` | ✅ Feito |
| 5 | Notas | `/api/notes` | ✅ Feito |
| 6 | Semana | `/api/week` | ⬜ Pendente |
| 7 | Calendário | `/api/events` | ✅ Feito |
| 8 | Livros | `/api/books` | ✅ Feito |
| 9 | Cursos | `/api/courses` | ✅ Feito |
| 10 | Universitário | `/api/university` | ✅ Feito |
| 11 | Finanças | `/api/finance` | ✅ Feito |
| 12 | Saúde | `/api/health` | ✅ Feito |
| 13 | Analytics | `/api/analytics` | ⬜ Pendente |
| 14 | Integrações | `/api/integrations` | ✅ Feito |

---

## Convenções

- **Todo código comentado em português**
- Nomes de services sem sufixo Angular: `habits.ts`, não `habits.service.ts`
- Respostas de erro: `{ error: "mensagem" }` | Respostas de sucesso: dados relevantes
- `async/await` em todas as operações com banco
