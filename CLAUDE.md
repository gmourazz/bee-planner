# BeePlanner – Guia do Backend

## Sobre o projeto
BeePlanner é um app de produtividade pessoal. O frontend já existe em React + TypeScript.
Este guia é exclusivo para construção do **backend** com Node.js + Express + TypeScript + Supabase.

## Regra de ouro
**Sempre aguardar aprovação da Giovanna antes de passar para a próxima etapa.**
Cada módulo é construído um por vez, de forma incremental.

---

## Stack do backend
| Tecnologia | Função |
|---|---|
| Node.js + Express | Servidor HTTP e rotas da API |
| TypeScript | Tipagem estática (evita erros) |
| Supabase | Banco de dados PostgreSQL + Auth |
| dotenv | Gerenciar variáveis de ambiente (.env) |

## Estrutura de pastas do backend
```
backend/
  src/
    config/         → configurações (conexão Supabase, etc.)
    controllers/    → lógica de cada funcionalidade
    routes/         → define as URLs da API
    middlewares/    → funções que rodam antes das rotas (ex: verificar login)
    server.ts       → ponto de entrada do servidor
  .env              → chaves secretas (nunca subir pro GitHub)
  package.json      → dependências e scripts
```

---

## Módulos a construir (conforme Giovanna for pedindo)

| # | Módulo | Rota base | Status |
|---|---|---|---|
| 1 | Autenticação (Auth) | `/api/auth` | ✅ Feito |
| 2 | Perfil do usuário | `/api/profile` | ✅ Feito |
| 3 | Hábitos | `/api/habits` | ⬜ Pendente |
| 4 | Metas | `/api/goals` | ⬜ Pendente |
| 5 | Notas | `/api/notes` | ⬜ Pendente |
| 6 | Semana | `/api/week` | ⬜ Pendente |
| 7 | Calendário / Datas | `/api/events` | ⬜ Pendente |
| 8 | Livros | `/api/books` | ⬜ Pendente |
| 9 | Cursos | `/api/courses` | ⬜ Pendente |
| 10 | Universitário | `/api/university` | ⬜ Pendente |
| 11 | Finanças | `/api/finance` | ⬜ Pendente |
| 12 | Saúde | `/api/health` | ⬜ Pendente |
| 13 | Analytics | `/api/analytics` | ⬜ Pendente |

---

## Conexão com Supabase
- URL e chaves ficam no arquivo `backend/.env`
- A `SUPABASE_SERVICE_KEY` tem permissão total no banco (usar só no backend, nunca expor no frontend)
- O cliente Supabase está configurado em `src/config/supabase.ts`

## Convenções de código
- **Todo código deve ser comentado em português** explicando o que cada parte faz
- Cada módulo tem: `routes/`, `controllers/` e tabela no Supabase
- Respostas de erro sempre retornam `{ error: "mensagem" }`
- Respostas de sucesso sempre retornam os dados relevantes
- Usar `async/await` em todas as operações com banco de dados

## Variáveis de ambiente necessárias
```
SUPABASE_URL=       → endereço do projeto Supabase
SUPABASE_ANON_KEY=  → chave pública (leitura limitada)
SUPABASE_SERVICE_KEY= → chave secreta (acesso total, só no backend)
PORT=3001           → porta do servidor local
```

## Como rodar o backend
```bash
cd backend
npm run dev    # inicia em modo desenvolvimento com hot-reload
```

## Padrão de cada módulo novo
1. Criar tabela no Supabase (SQL comentado)
2. Criar arquivo de rotas em `src/routes/nome.routes.ts`
3. Criar arquivo de controller em `src/controllers/nome.controller.ts`
4. Registrar a rota no `src/server.ts`
5. Aguardar aprovação da Giovanna para o próximo módulo
