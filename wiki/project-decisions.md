---
type: decisions
status: active
updated: 2026-06-03
tags:
  - arquitetura
  - decisoes
---

# Project Decisions

Pagina para consolidar decisoes de produto, arquitetura, modelagem, UI e implementacao.

## Decisoes registradas

### [2026-06-03] LLM Wiki como memoria persistente do projeto

Decisao: manter uma wiki Markdown em `wiki/`, alimentada por fontes imutaveis em `raw/`.

Motivo: preservar contexto, decisoes e analises entre sessoes, evitando redescobrir informacoes em cada conversa.

Impacto:

- Novas fontes devem ser colocadas em `raw/` e processadas para paginas em `wiki/`.
- Consultas relevantes podem virar paginas reutilizaveis.
- `wiki/index.md` deve permanecer atualizado.
- `wiki/log.md` deve registrar operacoes cronologicamente.

## Pendencias de decisao

- Definir provedor inicial de PostgreSQL: Neon, Supabase ou local.
- Definir estrategia de autenticacao e suporte futuro a grupos.
- Definir se imagens de jogadores e itens comecam apenas como URL externa ou se havera upload desde a primeira versao.

