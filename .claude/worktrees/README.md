# Worktrees — BeePlaner

Worktrees permitem trabalhar em branches separadas sem sair da branch principal.

## Criar worktree para uma feature
```bash
git worktree add .worktrees/nome-da-feature -b feat/nome-da-feature
```

## Listar worktrees ativos
```bash
git worktree list
```

## Remover worktree após merge
```bash
git worktree remove .worktrees/nome-da-feature
git branch -d feat/nome-da-feature
```

## Convenção de branches
- `feat/` — novo módulo ou funcionalidade (ex: `feat/modulo-notas`)
- `fix/` — correção de bug (ex: `fix/cache-habitos`)
- `style/` — ajuste visual (ex: `style/tema-dark`)
- `refactor/` — refatoração sem mudança de comportamento
