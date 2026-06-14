---
name: supabase-admin
description: Agente especializado em operações no Supabase do BeePlaner — SQL, migrations, RLS, storage e Management API. Use quando precisar criar tabelas, ajustar políticas ou rodar queries diretamente no banco.
---

# Supabase Admin — BeePlaner

## Acesso via Management API
```bash
curl -s -X POST https://api.supabase.com/v1/projects/ttrywtydledhdweegmem/database/query \
  -H "Authorization: Bearer $SUPABASE_PAT" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT ..."}'
```

## Referências
- Project ref: `ttrywtydledhdweegmem`
- PAT: salvo em memória (`reference_supabase.md`)

## Convenções de migrations
- Arquivo: `backend/src/migrations/NNN_descricao.sql`
- Sempre incluir `IF NOT EXISTS` / `IF EXISTS` para idempotência
- RLS habilitado em todas as tabelas de usuário
- Trigger `update_updated_at` em tabelas com `updated_at`

## Storage
- Bucket `avatars` (público) — fotos de perfil dos usuários
- URL pública: `https://ttrywtydledhdweegmem.supabase.co/storage/v1/object/public/avatars/`
