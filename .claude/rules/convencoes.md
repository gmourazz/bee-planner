# Convenções do projeto BeePlaner

## Geral
- Todo código e comentários em **português**
- Aguardar aprovação da Giovanna antes de avançar para a próxima etapa
- Construção incremental — um módulo por vez

## Nomenclatura
- Services sem sufixo Angular: `habits.ts`, não `habits.service.ts`
- Controllers: `nome.controller.ts` | Routes: `nome.routes.ts`
- Hooks: `useNome.ts` (ex: `useHabits.ts`)
- Types: `nome.types.ts`

## API
- Respostas de erro: `{ error: "mensagem" }`
- Respostas de sucesso: dados relevantes (não wrapper)
- `async/await` em todas as operações com banco

## Frontend
- Supabase direto no frontend quando possível (RLS cuida da segurança)
- Backend Express somente para operações com `SERVICE_KEY`
- `PageLayout` cuida do título — páginas não têm `<h1>` próprio
- Estilos via tokens do `ThemeContext` — não hardcodar cores

## Cache em services
```typescript
let _cache: { userId: string; data: T[] } | null = null
export function invalidateCache() { _cache = null }
```
Toda mutação (create/update/delete) chama `invalidateCache()` antes de retornar.

## Autenticação
- Usar `AuthContext` para obter usuário — nunca `supabase.auth.getUser()`
- JWT enviado no header: `Authorization: Bearer <token>`
- Middleware `requireAuth` valida o token no backend
