---
type: overview
status: active
updated: 2026-06-03
tags:
  - projeto
  - sorteador-times
---

# Sorteador Times - Overview

O Sorteador Times e uma aplicacao web para sorteio de times, personagens, mapas e registro de estatisticas de jogadores.

O objetivo principal e substituir uma versao antiga baseada em arrays fixos no codigo por uma estrutura escalavel com banco de dados, cadastro de entidades, historico, rankings e estatisticas por jogo.

## Jogos principais

- PES / eFootball
- Mortal Kombat
- CS:GO / CS2
- Battlefield

## Principios de arquitetura

- Dados sorteaveis devem vir do banco, nao de arrays fixos.
- Jogos devem ser extensivos: novos jogos podem ser adicionados sem reescrever a estrutura central.
- Estatisticas devem ser separadas por jogo para evitar telas confusas.
- A aplicacao deve estar preparada para multiplos grupos de amigos no futuro.

## Stack preferida

- Next.js
- TypeScript
- App Router
- Prisma ORM
- PostgreSQL
- TailwindCSS
- Zod

## Links importantes

- [[project-decisions]]
- [[implementation-map]]
- [[log]]

