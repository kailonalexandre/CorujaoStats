# AGENTS.md - Projeto Sortearor Times

## Objetivo do projeto

O projeto **Sortearor Times** e uma aplicacao web para sorteio de times, personagens, mapas e registro de estatisticas de jogadores.

O sistema deve substituir a versao antiga baseada em arrays fixos no codigo. A nova versao deve ser escalavel, com banco de dados, cadastro de jogadores, historico de partidas, ranking e estatisticas separadas por jogo.

Jogos principais:

- PES / eFootball
- Mortal Kombat
- CS:GO / CS2
- Battlefield

A aplicacao deve permitir adicionar novos jogos futuramente sem precisar reescrever a estrutura principal.

---

## Stack recomendada

Use preferencialmente:

- Next.js
- TypeScript
- App Router
- Prisma ORM
- PostgreSQL
- TailwindCSS
- Zod para validacoes

Deploy sugerido:

- Vercel para o front/back Next.js
- Neon ou Supabase para PostgreSQL

---

## Regras gerais para o agente

Ao trabalhar neste projeto:

1. Priorize codigo limpo, organizado e escalavel.
2. Evite deixar dados fixos em arrays no codigo.
3. Times, personagens, mapas, classes e armas devem ser cadastrados no banco.
4. Separe regras por jogo, mas reaproveite componentes sempre que possivel.
5. Nao misture todas as estatisticas em uma tela unica confusa.
6. Use abas, cards e filtros para organizar as informacoes.
7. Sempre que criar ou alterar codigo, mantenha TypeScript tipado corretamente.
8. Sempre que criar formularios, use validacao com Zod.
9. Sempre que criar consultas, use Prisma.
10. Mantenha o projeto preparado para multiplos grupos de amigos no futuro.

---

## Entidades principais

### Player

Representa um jogador cadastrado no sistema.

Campos esperados:

- id
- name
- nickname
- photoUrl
- createdAt
- updatedAt
- groupId, quando o sistema tiver suporte a grupos

Regras:

- Todo player deve poder ter uma foto.
- A foto pode ser uma URL externa inicialmente.
- Futuramente o sistema pode evoluir para upload de imagem.
- Exemplos de players: Kyle, Henderson, Joao, Pedro etc.
- A foto deve aparecer em listagens, rankings, sorteios e perfil individual.

---

### Game

Representa um jogo/categoria do sistema.

Exemplos:

- PES
- Mortal Kombat
- CS:GO
- Battlefield

Campos esperados:

- id
- name
- slug
- description
- createdAt
- updatedAt

---

### GameItem

Representa qualquer item sorteavel dentro de um jogo.

Exemplos:

- Times do PES
- Personagens do Mortal Kombat
- Mapas do CS:GO
- Classes do Battlefield

Campos esperados:

- id
- gameId
- name
- type
- imageUrl
- active
- createdAt
- updatedAt

Tipos possiveis:

- team
- character
- map
- class
- weapon
- other

Regras:

- Nao usar arrays fixos para estes dados.
- Todos os itens devem vir do banco.
- A tela de configuracoes deve permitir cadastrar, editar, desativar e filtrar estes itens.

---

### Match

Representa uma partida, luta ou jogo realizado.

Campos esperados:

- id
- gameId
- date
- description
- createdAt
- updatedAt

---

### MatchPlayer

Representa a participacao de um jogador em uma partida.

Campos esperados:

- id
- matchId
- playerId
- selectedItemId
- teamName
- result
- score
- kills
- deaths
- assists
- goals
- knifeKills
- headshots
- damage
- createdAt
- updatedAt

Resultados possiveis:

- win
- loss
- draw

---

### RaffleHistory

Representa o historico de sorteios realizados.

Campos esperados:

- id
- gameId
- playerId
- itemId
- groupName
- createdAt

Para CS:GO/CS2, o historico deve conseguir representar:

- Time A
- Time B
- Mapa sorteado
- Jogadores de cada time

---

### Group

Preparacao para multiplos grupos de amigos no futuro.

Campos esperados:

- id
- name
- createdAt
- updatedAt

Regras futuras:

- Cada grupo deve ter seus proprios jogadores.
- Cada grupo deve ter seus proprios sorteios.
- Cada grupo deve ter seus proprios rankings.
- Cada grupo deve ter suas proprias estatisticas.

---

## Modulos do sistema

### Dashboard

A tela inicial deve mostrar:

- Total de jogadores
- Total de partidas
- Total de sorteios
- Jogo mais jogado
- Jogador com mais vitorias
- Jogador com mais kills
- Jogador com mais gols
- Atalhos para novo sorteio, registrar partida, jogadores e rankings

---

### Jogadores

Rota sugerida:

- /players

Funcionalidades:

- Listar jogadores
- Cadastrar jogador
- Editar jogador
- Excluir jogador
- Informar nome
- Informar apelido
- Informar foto do jogador por photoUrl
- Exibir foto nos cards/listagem

Rota de perfil:

- /players/[id]

O perfil deve mostrar:

- Foto grande do jogador
- Nome
- Apelido
- Estatisticas gerais
- Estatisticas por jogo
- Historico de partidas
- Times/personagens/mapas mais usados

---

### Sorteios

Rota sugerida:

- /raffles

A tela deve separar sorteios por jogo.

#### Sorteio de PES

Regras:

- Selecionar jogadores participantes
- Sortear um time para cada jogador
- Nao repetir time no mesmo sorteio
- Exibir player com foto e time sorteado
- Salvar historico do sorteio

#### Sorteio de Mortal Kombat

Regras:

- Selecionar jogadores participantes
- Sortear um personagem para cada jogador
- Nao repetir personagem no mesmo sorteio
- Exibir player com foto e personagem sorteado
- Salvar historico do sorteio

#### Sorteio de CS:GO / CS2

Regras:

- Selecionar jogadores participantes
- Embaralhar jogadores
- Dividir em Time A e Time B
- Tentar equilibrar quantidade de jogadores
- Sortear um mapa ativo
- Exibir jogadores com foto em cada time
- Salvar historico do sorteio

Exemplo visual esperado:

Mapa: Inferno

Time A:
- Foto + Kyle
- Foto + Henderson

Time B:
- Foto + Joao
- Foto + Pedro

#### Sorteio de Battlefield

Regras:

- Selecionar jogadores participantes
- Sortear mapa, classe ou outro item configurado
- Exibir players com foto
- Salvar historico

---

### Registro de partidas

Rota sugerida:

- /matches

A tela deve permitir registrar partidas por jogo.

#### PES

Campos:

- Jogadores
- Time usado
- Gols
- Resultado: win, loss ou draw

Estatisticas:

- Total de gols
- Media de gols
- Vitorias
- Derrotas
- Empates
- Times mais usados

#### Mortal Kombat

Campos:

- Jogadores
- Personagem usado
- Resultado: win ou loss
- Rounds vencidos, se necessario futuramente

Estatisticas:

- Total de lutas
- Vitorias
- Derrotas
- Taxa de vitoria
- Personagem mais usado

#### CS:GO / CS2

Campos:

- Jogadores
- Mapa usado
- Time
- Resultado
- Kills
- Deaths
- Assists
- Headshots
- KnifeKills

Estatisticas:

- Total de kills
- Media de kills
- Total de deaths
- Media de deaths
- K/D ratio
- Total de facadas
- Total de headshots
- Mapas mais jogados
- Vitorias e derrotas

#### Battlefield

Campos:

- Jogadores
- Mapa usado
- Classe usada
- Resultado
- Kills
- Deaths
- Assists
- Score

Estatisticas:

- Total de score
- Kills
- Deaths
- Assists
- K/D ratio
- Classes mais usadas
- Mapas mais jogados

---

### Estatisticas

Rota sugerida:

- /stats

A tela deve usar abas:

- PES
- Mortal Kombat
- CS:GO
- Battlefield

Cada aba deve mostrar apenas as estatisticas relevantes daquele jogo.

Nao misturar estatisticas de jogos diferentes na mesma visualizacao principal.

---

### Ranking

Rota sugerida:

- /ranking

Filtros:

- Todos
- PES
- Mortal Kombat
- CS:GO
- Battlefield

Rankings esperados:

PES:

- Ranking por gols
- Ranking por vitorias
- Media de gols

Mortal Kombat:

- Ranking por vitorias
- Taxa de vitoria
- Personagem mais usado

CS:GO / CS2:

- Ranking por kills
- Ranking por K/D
- Ranking por facadas
- Ranking por headshots

Battlefield:

- Ranking por score
- Ranking por kills
- Ranking por K/D

Todos os rankings devem exibir a foto do jogador.

---

### Configuracoes

Rota sugerida:

- /settings/items

Funcionalidades:

- Cadastrar jogos
- Cadastrar itens sorteaveis
- Cadastrar times do PES
- Cadastrar personagens do Mortal Kombat
- Cadastrar mapas do CS:GO
- Cadastrar classes/mapas do Battlefield
- Ativar/desativar itens
- Editar nome e imagem dos itens

---

## Regras de UI

A interface deve ter:

- Tema escuro
- Cards modernos
- Tabelas simples
- Abas por jogo
- Layout responsivo
- Fotos dos jogadores em cards, rankings e sorteios
- Estados vazios
- Loading
- Feedback de erro e sucesso

Evite telas poluidas.

---

## Regras de banco

Use Prisma.

Evite:

- Arrays fixos no codigo
- Dados duplicados sem necessidade
- Estatisticas calculadas manualmente sem necessidade

Prefira:

- Consultas agregadas
- Relacionamentos claros
- Historico salvo
- Dados normalizados

---

## Regras de implementacao

Ao implementar uma feature:

1. Criar ou ajustar schema do Prisma.
2. Criar migration.
3. Criar validacao com Zod.
4. Criar service ou funcao de acesso ao banco.
5. Criar tela ou componente.
6. Tratar loading, erro e estado vazio.
7. Garantir responsividade.
8. Testar fluxo basico.

---

## Prioridade de desenvolvimento

Ordem recomendada:

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

---

## Observacao importante

O sistema antigo usava arrays com listas de times/personagens. Na nova versao, isso deve ser substituido por dados cadastrados no banco de dados.

O objetivo e que o usuario consiga cadastrar novos jogos, novos jogadores, novos mapas, novos personagens e novas estatisticas sem precisar alterar diretamente o codigo.
