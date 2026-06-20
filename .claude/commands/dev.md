---
description: Iniciar o ambiente de desenvolvimento local
---

# Ambiente de desenvolvimento

## Tudo junto (recomendado)
```bash
./dev.sh
# Backend  -> http://localhost:3001
# Frontend -> http://localhost:5173
# Ctrl+C encerra os dois
```

## Frontend (separado)
```bash
cd frontend && npm run dev
# http://localhost:5173
# Primeira execução pode demorar (Vite pré-compila as dependências)
```

## Backend (Go — ativo, separado)
```bash
cd backend-go && go run main.go
# http://localhost:3001 (mesma porta que o Node usava)
```

## Backend antigo (Node — mantido como referência, não usar)
```bash
cd backend && npm run dev
# http://localhost:3001 — não rodar junto com o backend-go (mesma porta)
```

## Verificar tipos / build
```bash
cd frontend && npx tsc --noEmit
cd backend-go && go build ./... && go vet ./...
```

## Build de produção
```bash
cd frontend && npm run build
cd backend-go && go build -o bin/server .
```
