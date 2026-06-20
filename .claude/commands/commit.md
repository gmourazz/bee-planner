
description: Cria um commit com a mensagem formatada em lista usando gitmoji
---

# Commit com gitmoji

## Passo a passo

1. Rodar em paralelo: `git status`, `git diff` (staged e unstaged) e `git log --oneline -10` para entender o estado atual e o estilo de mensagens do repo.
2. Analisar as mudanças e agrupar por tema/arquivos relacionados (ex: "ajustes de config", "novo módulo X", "limpeza de build").
3. Montar a mensagem do commit como uma lista, um item por grupo de mudança:
   - Primeira linha do item: `- <gitmoji> <título curto>` (título em português, sem ponto final)
   - Linha seguinte, indentada: descrição breve da mudança, **sem emoji**
   - Não incluir uma linha de resumo geral no topo — a mensagem é só a lista
4. Sem pedir aprovação da mensagem, seguir direto para o commit:
   - `git add` apenas nos arquivos relevantes (nunca `-A` ou `.`)
   - `git commit` com a mensagem via HEREDOC
5. Fazer `git push origin <branch-atual>` para https://github.com/gmourazz/bee-planner.
6. Rodar `git status` para confirmar que tudo foi commitado e enviado, e mostrar a mensagem final usada.
7. Nunca usar `--no-verify`, `--amend` ou `--force` a menos que pedido explicitamente.

## Gitmoji de referência

| Emoji | Uso |
|---|---|
| ✨ | nova funcionalidade |
| 🐛 | correção de bug |
| ♻️ | refatoração |
| 💄 | ajuste de UI/estilo |
| 🔧 | configuração (vite, tsconfig, env, etc) |
| 📝 | documentação |
| 🗃️ | migration/banco de dados |
| 📦 | dependências |
| 🔥 | remoção de código/arquivos |
| 🚚 | mover/renomear arquivos |
| ⚡️ | performance |
| ✅ | testes |
| 🔒 | segurança |
| 🚀 | deploy |
| 🖼️ | assets (imagens, ícones) |

## Exemplo de mensagem final

```
- 🔥 Remove arquivos de build obsoletos do frontend
  Apaga frontend/dist/, frontend/index.html antigo e postcss.config.mjs, que não são mais necessários após o ajuste do Vite.

- 🔧 Ajusta configuração do Vite e do TypeScript do backend
  Atualiza frontend/vite.config.ts e backend/tsconfig.json.

- 🗃️ Adiciona migration da tabela de universidade
  Cria backend/src/migrations/012_create_university.sql para o módulo Universitário.
```