# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Regra de ouro
**Sempre aguardar aprovação da Giovanna antes de passar para a próxima etapa.**
Cada módulo é construído um por vez, de forma incremental.

---

## Comandos

### Tudo junto
```bash
./dev.sh   # backend (3001) + frontend (5173) juntos, Ctrl+C encerra os dois
```

### Frontend (`frontend/`)
```bash
npm run dev      # inicia em http://localhost:5173
npm run build    # build de produção
```

### Backend (`backend/`) — ativo (Go)
```bash
go run main.go   # inicia em http://localhost:3001
go build ./...   # verifica compilação
go vet ./...     # lint
```

> O backend foi migrado de Node/Express para Go. A pasta `backend-go/` era o nome antigo — o código Go está hoje em `backend/`.

### Verificar tipos
```bash
cd frontend && npm run build          # vite compila + verifica TS (node_modules/.bin/tsc não existe no projeto)
cd backend  && go build ./... && go vet ./...
```

**`frontend/.env`**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3001
```

**`backend/.env`**
```
PORT=3001
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
DATABASE_URL=          # connection string direta do Postgres (Supabase > Database > Connection string)
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

---

## Arquitetura

### Decisão crítica: onde chamar o Supabase
A maioria das páginas chama o **Supabase diretamente** no frontend (usando `VITE_SUPABASE_ANON_KEY` + RLS). O backend Go existe para operações que exigem `SERVICE_KEY` ou acesso direto ao Postgres. **Não adicionar chamadas ao backend em páginas que já funcionam com Supabase direto.**

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
- Avatar URL cacheado em `localStorage('beeplanner_avatar_url_<userId>')` para carregamento instantâneo
- Email de confirmação desativado no Supabase — cadastro retorna sessão imediata

### Sistema de temas (`ThemeContext`)
12 temas, cada um com `{ id, name, category, colors, emoji }`. Tokens de `colors`:
`primary`, `primaryLight`, `primaryDark`, `accent`, `background`, `surface`, `text`, `textMuted`

Todos os estilos visuais usam esses tokens via `style={{ color: currentTheme.colors.primary }}`.
Tema `tech` aplica `filter: grayscale(1)` em todo `AppLayout`, **exceto** `/perfil` (preserva foto do usuário).

### PageLayout
- Envolve todas as rotas autenticadas
- Exibe header (ícone + título) para todas as rotas presentes em `ROUTE_MAP` (incluindo `/inicio`)
- **Páginas não devem ter `<h1>` próprio** — o `PageLayout` já exibe o título
- Para adicionar uma nova rota ao header, inserir entrada em `ROUTE_MAP` em `components/PageLayout.tsx`

### Responsividade desktop
Todas as páginas autenticadas usam um wrapper interno `<div className="max-w-6xl mx-auto w-full">` (ou `max-w-7xl` para páginas mais largas) para limitar o conteúdo em telas grandes. Modais com `fixed inset-0` ficam **fora** desse wrapper mas dentro do div de scroll externo.

### Modais
Quando uma página precisa renderizar um modal **e** um portal (ex: `DatePickerInput` com `direction="down"` usa `ReactDOM.createPortal`), o `return` do componente deve ser envolvido em `<>...</>` (Fragment) para suportar dois elementos raiz:
```tsx
return (
  <>
    <div className="flex-1 overflow-auto ...">...</div>
    {showModal && <div className="fixed inset-0 ...">..</div>}
  </>
)
```
Fundo dos modais: `backdropFilter: 'blur(6px)'` + `rgba(0,0,0,0.35)`.

### DatePickerInput
Componente em `components/DatePickerInput.tsx` — calendário visual com navegação por mês/ano. Props principais:
- `direction="up"` → popup abre para cima (padrão, `position: absolute`)
- `direction="down"` → popup abre via `ReactDOM.createPortal` com `position: fixed` (usar dentro de modais para não ser cortado pelo `overflow`)

### Upserts com data opcional
Hooks de saúde e hidratação aceitam `date?` para permitir registro em dias passados:
```ts
setSteps(value, date?)       // useHealth — salva passos para a data informada (ou hoje)
setWaterDirect(value, date?) // useHealth — salva água para a data informada (ou hoje)
```

### Deploy (Hostinger)
- Build: `cd frontend && npm run build` — gera `dist/`
- O arquivo `frontend/public/.htaccess` é copiado para `dist/` automaticamente pelo Vite
- O `.htaccess` usa `Options -MultiViews` + `RewriteRule ^ /index.html` para SPA routing no Apache
- Subir todo o conteúdo de `dist/` para `public_html` na Hostinger (habilitar "mostrar arquivos ocultos" para ver o `.htaccess`)

### Pattern de cache em services
```typescript
let _cache: { userId: string; data: T[] } | null = null
export function invalidateCache() { _cache = null }
// fetchXxx() retorna _cache se userId bater; caso contrário faz queries paralelas
// createXxx/deleteXxx/toggleXxx chamam invalidateCache() antes de retornar
```

### Sidebar — grupos de menu sem rota
Itens de menu que agrupam subitens (Estudos, Agenda, Financeiro) usam `groupOnly: true` na configuração de `sections` em `Sidebar.tsx`. Esses itens renderizam um `<button>` em vez de `<NavLink>` e abrem/fecham o grupo ao clicar. A rota `path` nesses itens não é navegada — serve só como chave de estado de expansão.

### Selects customizados
O projeto **não usa `<select>` nativo** — causa dropdown com tema do sistema operacional. O padrão é um componente próprio: botão com `primaryLight` + `ChevronDown`, dropdown `fixed`/`absolute` com `rounded-2xl` e `shadow-xl`, cada opção como `<button>` com check ao lado quando selecionada. Ver `FitnessSelect` em `FitnessPage.tsx` e `GeneroFiltroSelect` em `BooksPage.tsx` como referência.

### Backend (`backend-go/`)

Framework: **Gin**. Acesso a dados: conexão direta ao Postgres via **pgx** (não passa pela API REST do Supabase, exceto para auth — ver abaixo).

| Pasta | Responsabilidade |
|---|---|
| `main.go` | Bootstrap: carrega `.env`, abre o pool do Postgres, registra rotas e CORS |
| `internal/config/` | `env.go` (variáveis de ambiente), `database.go` (pool `pgxpool`) |
| `internal/middleware/auth.go` | `RequireAuth` (valida o token no GoTrue + busca `role` em `profiles`), `RequireAdmin` |
| `internal/supabaseauth/` | Cliente HTTP para a API REST do GoTrue — só usado por `register`/`login`/validação de token, que não são tabelas comuns do Postgres |
| `internal/dbutil/rowmap.go` | `RowToMap`: formata UUID como string e DATE como `AAAA-MM-DD` ao ler do pgx (sem isso viram array de bytes / timestamp completo) |
| `internal/<modulo>/` | Um pacote por módulo: `<modulo>_controller.go` + `<modulo>_routes.go` |

**Padrão para novo módulo backend:**
1. Criar SQL em `backend/migrations/` (histórico centralizado) e rodar via psql ou Management API do Supabase
2. Criar `internal/nome/nome_controller.go` (handlers Gin) e `nome_routes.go` (`RegisterRoutes`)
3. Registrar `nome.RegisterRoutes(api.Group("/nome"), db, authClient)` em `main.go`
4. Rotas que retornam linhas do Postgres: usar `pgx.CollectRows`/`CollectOneRow` com `dbutil.RowToMap` em vez de `SELECT *` cru
5. Atualizações parciais (`PUT`/`PATCH`): construir `SET` dinâmico só com os campos enviados (ver qualquer controller existente como exemplo)
6. Aguardar aprovação da Giovanna para o próximo módulo

**Módulos frontend-only (Supabase direto):** quando o módulo não precisa de `SERVICE_KEY`, criar só `services/nome.ts` + `hooks/useNome.ts` + `types/nome.types.ts` + página. Não é necessário criar rota no backend. Exemplo: Fitness, Analytics.

**Rotas públicas no backend (sem `RequireAuth`):** registrar diretamente no `router` antes de criar o subgrupo `authed`. Ver `health_routes.go` — `POST /sync` é público (autenticado por `sync_token` no body), o restante usa `middleware.RequireAuth`.

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
| 8b | Séries | `/api/series` | ✅ Feito |
| 9 | Cursos | `/api/courses` | ✅ Feito |
| 10 | Universitário | `/api/university` | ✅ Feito |
| 11 | Finanças | `/api/finance` | ✅ Feito |
| 12 | Saúde | `/api/health` | ✅ Feito |
| 13 | Analytics | `/dashboard` (frontend only) | ✅ Feito (dados via Supabase direto — `useAnalytics` + `useDashboardSummaries`) |
| 14 | Integrações | `/api/integrations` | ✅ Feito |
| 15 | Fitness | `/fitness` (frontend only) | ✅ Feito — 5 abas (Treinos, Corpo, Dieta, Desafios, Dispositivos). Supabase direto: tabelas `fitness_workouts`, `fitness_body`, `fitness_challenges`, `fitness_meals`, `fitness_goals`. Sub-item de Hábitos no menu. |

Todos os módulos com rota base `/api/*` rodam hoje em **`backend/`** (Go/Gin).

---

## Convenções

- **Todo código comentado em português**
- Frontend: nomes de services sem sufixo Angular: `habits.ts`, não `habits.service.ts`
- Backend Go: um pacote por módulo em `internal/`, arquivos `nome_controller.go` + `nome_routes.go`
- Respostas de erro: `{ error: "mensagem" }` | Respostas de sucesso: dados relevantes
- `async/await` em todas as operações com banco
