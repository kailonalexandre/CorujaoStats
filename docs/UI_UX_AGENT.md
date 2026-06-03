# UI_UX_AGENT.md — Agente de UI/UX do Sortearor Times

## Função deste agente

Este agente é responsável exclusivamente por melhorar a interface, experiência do usuário, responsividade, organização visual e consistência visual do projeto Sortearor Times.

Ele deve focar em:

- Layout
- Componentes visuais
- Responsividade
- Acessibilidade básica
- Organização das telas
- Clareza das informações
- Experiência de uso
- Tema escuro
- Cards
- Tabelas
- Abas
- Estados vazios
- Estados de loading
- Feedback visual

Este agente não deve alterar regras de negócio, banco de dados ou cálculos de estatísticas, exceto quando for necessário apenas para exibir melhor uma informação já existente.

---

## Contexto do projeto

O Sortearor Times é um sistema para:

- Cadastrar jogadores com foto
- Sortear times/personagens/mapas
- Registrar partidas
- Mostrar estatísticas por jogo
- Mostrar rankings
- Separar informações por categorias como PES, Mortal Kombat, CS:GO e Battlefield

A interface deve ser simples, moderna e fácil de usar.

---

## Estilo visual desejado

Use preferencialmente:

- Tema escuro
- Cards com bom espaçamento
- Bordas arredondadas
- Layout limpo
- Botões claros e consistentes
- Ícones quando fizer sentido
- Destaques visuais moderados
- Tabelas simples e legíveis
- Abas para separar jogos
- Layout responsivo para celular e desktop

Evite:

- Tela poluída
- Muitos elementos competindo por atenção
- Cores exageradas
- Textos longos demais dentro de cards
- Tabelas difíceis de ler no celular
- Componentes duplicados sem necessidade

---

## Regras para fotos dos jogadores

Todo jogador pode ter uma foto em `photoUrl`.

A foto deve aparecer em:

- Listagem de jogadores
- Perfil individual do jogador
- Sorteios
- Rankings
- Dashboard
- Histórico de sorteios
- Registro de partidas, quando fizer sentido

Se o jogador não tiver foto, exibir um placeholder com as iniciais do nome.

Criar ou reutilizar um componente central:

- `PlayerPhoto`
- `PlayerAvatar`
- ou nome equivalente já usado no projeto

Não repetir a lógica de avatar em várias telas.

---

## Componentes recomendados

Crie componentes reutilizáveis para:

- PlayerAvatar
- PlayerCard
- GameTabs
- StatCard
- RankingTable
- EmptyState
- LoadingState
- PageHeader
- SectionCard
- ConfirmDialog
- FormField
- ActionButton

Evite criar componentes grandes demais.

---

## Páginas principais

### Dashboard

O dashboard deve mostrar os principais números do sistema em cards.

Cards sugeridos:

- Total de jogadores
- Total de partidas
- Total de sorteios
- Jogo mais jogado
- Jogador com mais vitórias
- Jogador com mais kills
- Jogador com mais gols

Também deve ter atalhos para:

- Novo sorteio
- Registrar partida
- Cadastrar jogador
- Ver rankings
- Ver estatísticas

Quando exibir jogador em destaque, mostrar foto.

---

### Jogadores

A tela de jogadores deve usar cards.

Cada card deve mostrar:

- Foto do jogador
- Nome
- Apelido
- Botões de editar/ver/excluir

Se não houver jogadores, mostrar estado vazio com ação para cadastrar o primeiro jogador.

---

### Perfil do jogador

O perfil deve destacar a foto do jogador.

A página deve ter abas:

- Geral
- PES
- Mortal Kombat
- CS:GO
- Battlefield

Mostrar estatísticas em cards e histórico em tabela.

---

### Sorteios

A tela de sorteios deve ser clara e visual.

Deve ter abas ou cards para:

- PES
- Mortal Kombat
- CS:GO
- Battlefield

Ao exibir resultado de sorteio:

PES:

- Foto do jogador
- Nome
- Time sorteado

Mortal Kombat:

- Foto do jogador
- Nome
- Personagem sorteado

CS:GO:

- Mapa sorteado em destaque
- Time A em um card
- Time B em outro card
- Fotos dos jogadores em cada time

Battlefield:

- Foto do jogador
- Nome
- Item sorteado

---

### Estatísticas

A tela de estatísticas deve ser separada por abas.

Abas:

- PES
- Mortal Kombat
- CS:GO
- Battlefield

Cada aba deve mostrar apenas as estatísticas daquele jogo.

Use cards para números principais e tabelas para rankings.

---

### Ranking

A tela de ranking deve exibir:

- Posição
- Foto do jogador
- Nome
- Apelido
- Estatística principal

Deve ter filtro por jogo.

No celular, a tabela deve continuar legível.

---

## Responsividade

A interface deve funcionar bem em:

- Desktop
- Notebook
- Tablet
- Celular

Regras:

- Evitar tabelas largas demais no celular
- Usar cards empilhados em telas pequenas
- Manter botões clicáveis com bom tamanho
- Evitar textos pequenos demais
- Garantir espaçamento adequado

---

## Acessibilidade básica

Sempre que possível:

- Usar labels em inputs
- Usar textos alternativos em imagens
- Manter contraste adequado
- Evitar depender apenas de cor para indicar estado
- Botões devem ter texto claro
- Inputs devem ter mensagens de erro compreensíveis

---

## Estados obrigatórios

Toda tela com dados deve ter:

- Estado de carregamento
- Estado vazio
- Estado de erro
- Feedback após salvar/editar/excluir

Exemplos:

- “Nenhum jogador cadastrado.”
- “Nenhum sorteio encontrado.”
- “Nenhuma partida registrada.”
- “Erro ao carregar estatísticas.”

---

## Limites do agente UI/UX

Este agente pode:

- Criar componentes visuais
- Melhorar layout
- Melhorar responsividade
- Ajustar TailwindCSS
- Melhorar organização visual
- Melhorar feedback de ações
- Melhorar estados vazios/loading/erro

Este agente não deve:

- Alterar schema do banco sem solicitação explícita
- Alterar regras de sorteio
- Alterar cálculo de estatísticas
- Remover validações
- Trocar tecnologias principais do projeto
- Criar arrays fixos de dados
- Remover integração com Prisma

---

## Checklist antes de finalizar

Antes de concluir qualquer tarefa de UI/UX, verifique:

- A tela está responsiva?
- A tela tem loading?
- A tela tem estado vazio?
- A tela tem feedback de erro?
- As fotos dos jogadores aparecem corretamente?
- Existe placeholder quando não há foto?
- O layout está limpo?
- Os componentes foram reutilizados?
- As estatísticas estão fáceis de entender?
- As ações principais estão visíveis?