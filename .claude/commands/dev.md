---
description: Iniciar o ambiente de desenvolvimento local
---

# Ambiente de desenvolvimento

## Frontend
```bash
cd frontend && npm run dev
# http://localhost:5173
# Primeira execução pode demorar (Vite pré-compila as dependências)
```

## Backend
```bash
cd backend && npm run dev
# http://localhost:3001 (hot-reload)
```

## Verificar tipos
```bash
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

## Build de produção
```bash
cd frontend && npm run build
cd backend && npm run build
```
