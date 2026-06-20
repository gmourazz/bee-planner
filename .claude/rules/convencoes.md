# Convenções do projeto BeePlaner

## Geral
- Todo código e comentários em **português**
- Aguardar aprovação da Giovanna antes de avançar para a próxima etapa
- Construção incremental — um módulo por vez

## Nomenclatura
- Frontend: services sem sufixo Angular: `habits.ts`, não `habits.service.ts`
- Frontend: Hooks: `useNome.ts` (ex: `useHabits.ts`) | Types: `nome.types.ts`
- Backend Go (`backend-go/internal/`): um pacote por módulo, arquivos `nome_controller.go` + `nome_routes.go`

## API
- Respostas de erro: `{ error: "mensagem" }`
- Respostas de sucesso: dados relevantes (não wrapper)
- `async/await` em todas as operações com banco

## Frontend
- Supabase direto no frontend quando possível (RLS cuida da segurança)
- Backend Go (`backend-go/`) somente para operações com `SERVICE_KEY` ou Postgres direto
- `PageLayout` cuida do título — páginas não têm `<h1>` próprio
- Estilos via tokens do `ThemeContext` — não hardcodar cores

## Backend Go (`backend-go/`)
- Acesso a dados via `pgx` direto no Postgres (não via REST do Supabase), exceto auth (GoTrue)
- `SELECT`/`RETURNING` que devolvem linha(s): usar `dbutil.RowToMap` (corrige UUID/DATE), não montar struct à mão
- `PUT`/`PATCH` parciais: montar `SET` dinâmico só com os campos enviados no body
- `router.RedirectTrailingSlash = false` no `main.go` — Gin redireciona rotas tipo `/api/x` por padrão, Express não

## Cache em services
```typescript
let _cache: { userId: string; data: T[] } | null = null
export function invalidateCache() { _cache = null }
```
Toda mutação (create/update/delete) chama `invalidateCache()` antes de retornar.

## Autenticação
- Frontend: usar `AuthContext` para obter usuário — nunca `supabase.auth.getUser()`
- JWT enviado no header: `Authorization: Bearer <token>`
- Backend Go: middleware `middleware.RequireAuth` valida o token no GoTrue e busca o `role` em `profiles`
