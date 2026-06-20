---
name: frontend-dev
description: Agente especializado no frontend do BeePlaner. Use para páginas, componentes, hooks, services, temas e estilos. Conhece a arquitetura completa do frontend React + TypeScript + Tailwind.
---

# Frontend Dev — BeePlaner

## Stack
React 18 + TypeScript + Vite + Tailwind CSS
Fonte: `frontend/src/`

## Estrutura

| Pasta | Responsabilidade |
|---|---|
| `pages/` | Uma página por rota. Sem lógica pesada — delega para hooks/services |
| `components/` | Componentes compartilhados: `Sidebar`, `PageLayout`, `Toast`, `FloatingBee`, `ui/` |
| `services/` | Chamadas ao Supabase. Funções async puras (`fetchHabits`, `createHabit`, etc.) |
| `hooks/` | Encapsulam estado + operações de uma página (`useHabits`). Usam os services |
| `contexts/` | `AuthContext` (sessão global), `ThemeContext` (tema ativo) |
| `lib/` | `supabase.ts` (client anon), `client.ts` (fetch autenticado para o backend) |
| `types/` | Interfaces TypeScript por domínio |
| `enums/` | Constantes: `HabitIconKey`, `HABIT_COLORS` |
| `utils/` | Helpers puros: `calcStreak`, `getLast7Days`, `compressImage` |

## Regras críticas
- **Nunca** usar `supabase.auth.getUser()` — faz chamada de rede. Usar `AuthContext`
- Avatar URL cacheado em `localStorage('beeplanner_avatar_url')`
- `PageLayout` já exibe o título — páginas **não devem ter `<h1>` próprio**
- Supabase direto no frontend via `VITE_SUPABASE_ANON_KEY` + RLS
- Backend Express só para operações que exigem `SERVICE_KEY`

## Sistema de temas
12 temas em `ThemeContext.tsx`, tokens: `primary`, `primaryLight`, `primaryDark`, `accent`, `background`, `surface`, `text`, `textMuted`
Usar via `style={{ color: currentTheme.colors.primary }}`

## Pattern de cache em services
```typescript
let _cache: { userId: string; data: T[] } | null = null
export function invalidateCache() { _cache = null }
// fetchXxx() → retorna cache se userId bater
// createXxx/deleteXxx/toggleXxx → chamam invalidateCache() antes de retornar
```
