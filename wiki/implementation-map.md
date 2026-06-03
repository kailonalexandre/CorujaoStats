---
type: implementation-map
status: draft
updated: 2026-06-03
tags:
  - implementacao
  - modulos
---

# Implementation Map

Mapa de acompanhamento da implementacao do Sorteador Times.

## Prioridade recomendada

1. Criar base do projeto.
2. Criar schema Prisma.
3. Criar seed inicial.
4. Criar cadastro de jogadores com foto.
5. Criar cadastro de jogos e itens sorteaveis.
6. Criar sorteador PES.
7. Criar sorteador Mortal Kombat.
8. Criar sorteador CS:GO com times e mapa.
9. Criar registro de partidas.
10. Criar estatisticas por jogo.
11. Criar rankings.
12. Criar dashboard.
13. Criar historico de sorteios.
14. Melhorar UI.
15. Preparar deploy.

## Modulos

### Dashboard

Status: nao iniciado.

Escopo esperado: totais, jogo mais jogado, jogadores destaque e atalhos principais.

### Jogadores

Status: nao iniciado.

Escopo esperado: CRUD, foto por `photoUrl`, listagem, perfil individual e estatisticas.

### Sorteios

Status: nao iniciado.

Escopo esperado: abas por jogo, sorteio com itens vindos do banco e historico salvo.

### Registro de partidas

Status: nao iniciado.

Escopo esperado: formulario por jogo com estatisticas especificas.

### Estatisticas

Status: nao iniciado.

Escopo esperado: abas por jogo, sem misturar metricas incompatíveis na tela principal.

### Ranking

Status: nao iniciado.

Escopo esperado: filtros por jogo e rankings com foto do jogador.

### Configuracoes

Status: nao iniciado.

Escopo esperado: cadastro de jogos e itens sorteaveis com ativar/desativar.

## Modelo de dados esperado

- Player
- Game
- GameItem
- Match
- MatchPlayer
- RaffleHistory
- Group

Detalhes e campos devem seguir as instrucoes do projeto.

