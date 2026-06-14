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
node_modules/.bin/tsc --noEmit  # verificar tipos
```

### Backend (`backend/`)
```bash
go run main.go          # inicia com hot-reload em http://localhost:3001
go build ./...          # compila
go vet ./...            # verificar problemas
```

### Variáveis de ambiente

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
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

### Deploy (Hostinger)
- Build: `cd frontend && npm run build` — gera `dist/`
- `frontend/public/.htaccess` é copiado para `dist/` automaticamente pelo Vite
- `.htaccess` usa `Options -MultiViews` + `RewriteRule ^ /index.html` para SPA routing no Apache
- Subir todo o conteúdo de `dist/` para `public_html` (habilitar "mostrar arquivos ocultos" para o `.htaccess`)

---

## Arquitetura

### Decisão crítica: onde chamar o Supabase
A maioria das páginas chama o **Supabase diretamente** no frontend (usando `VITE_SUPABASE_ANON_KEY` + RLS). O backend Go existe apenas para operações que exigem `SERVICE_KEY`. **Não adicionar chamadas ao backend em páginas que já funcionam com Supabase direto.**

Para chamar o backend autenticado, usar `apiFetch` de `lib/client.ts` — injeta automaticamente o JWT da sessão no header `Authorization`.

Séries são 100% frontend (Supabase direto) — não há handler no backend.

---

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
- Avatar URL cacheado em `localStorage('beeplanner_avatar_url_<userId>')` para carregamento instantâneo
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

### Responsividade desktop
Todas as páginas autenticadas usam um wrapper interno `<div className="max-w-6xl mx-auto w-full">` (ou `max-w-7xl` para páginas mais largas) para limitar o conteúdo em telas grandes. Modais com `fixed inset-0` ficam **fora** desse wrapper mas dentro do div de scroll externo.

### Pattern de cache em services
```typescript
let _cache: { userId: string; data: T[] } | null = null
export function invalidateCache() { _cache = null }
// fetchXxx() retorna _cache se userId bater; caso contrário faz queries paralelas
// createXxx/deleteXxx/toggleXxx chamam invalidateCache() antes de retornar
```

---

### Backend (`backend/`) — Go + Gin

| Pasta | Responsabilidade |
|---|---|
| `config/supabase.go` | Client REST do Supabase com `SERVICE_KEY` + `QueryBuilder` encadeável |
| `middleware/auth.go` | `RequireAuth` (valida JWT via `/auth/v1/user`), `RequireAdmin` (role check), `GetUser()` |
| `handlers/` | Um arquivo por domínio. Lógica de negócio direta, sem camada de routes separada |
| `main.go` | Gin server, CORS, registro de todas as rotas |

**`QueryBuilder` (`config/supabase.go`):**
```go
config.Supabase.From("tabela").
    Select("*").Eq("user_id", id).Gte("data", desde).
    Order("created_at", false).Get()

config.Supabase.From("tabela").Eq("id", id).Update(map[string]any{...})
config.Supabase.From("tabela").Insert(map[string]any{...})
config.Supabase.From("tabela").Eq("id", id).Delete()
config.Supabase.Upsert("tabela", payload, "coluna_conflito")
config.Supabase.RawRequest("GET", "tabela?select=*&col=eq.val", nil) // queries complexas
```

**Padrão para novo handler:**
1. Criar SQL em `migrations/` (se precisar de nova tabela) e rodar via Management API do Supabase
2. Criar `handlers/nome.go` com as funções
3. Registrar as rotas em `main.go` dentro do grupo protegido `p`
4. Aguardar aprovação da Giovanna para o próximo módulo

**Rotas OAuth (integrações):** os callbacks `/api/integrations/google/callback` e `/api/integrations/outlook/callback` ficam **fora** do middleware `RequireAuth` — o browser redireciona sem header de auth.

**`nilIfEmpty(s string) any`** — helper em `handlers/goals.go`, acessível em todo o package `handlers`. Retorna `nil` se string vazia (evita salvar `""` no banco onde o campo aceita NULL).

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
| 8b | Séries | Supabase direto | ✅ Feito (frontend only) |
| 9 | Cursos | `/api/courses` | ✅ Feito |
| 10 | Universitário | `/api/university` | ✅ Feito |
| 11 | Finanças | `/api/finance` | ✅ Feito |
| 12 | Saúde | `/api/health` | ✅ Feito |
| 13 | Analytics | `/dashboard` (frontend only) | ✅ Feito (`useAnalytics` + `useDashboardSummaries`) |
| 14 | Integrações | `/api/integrations` | ✅ Feito |
| 15 | Configurações | `/api/settings` | ✅ Feito |

---

## Convenções

- **Todo código e comentários em português**
- Nomes de services sem sufixo: `habits.ts`, não `habits.service.ts`
- Respostas de erro: `{ error: "mensagem" }` | Respostas de sucesso: dados diretos (sem wrapper)
- Handlers Go: usar ponteiros (`*string`, `*bool`) para campos opcionais no body — distingue campo ausente de valor zero
