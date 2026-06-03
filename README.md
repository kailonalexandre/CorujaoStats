# Sorteador Times

Aplicacao web para sorteio de times, personagens, mapas e classes, cadastro de jogadores com foto, registro de partidas, rankings e estatisticas separadas por jogo.

O projeto foi criado para substituir uma versao antiga baseada em arrays fixos no codigo. Na arquitetura atual, jogadores, jogos, itens sorteaveis, partidas e historicos ficam no banco de dados, usando Prisma e MySQL.

## Objetivo

O Sorteador Times organiza grupos de amigos que jogam PES/eFootball, Mortal Kombat, CS:GO/CS2 e Battlefield. A aplicacao permite:

- Cadastrar jogadores com nome, apelido e foto por `photoUrl`.
- Cadastrar itens sorteaveis por jogo, como times, personagens, mapas, classes, armas e outros.
- Realizar sorteios por jogo usando dados ativos do banco.
- Salvar historico dos sorteios.
- Registrar partidas e estatisticas por jogador.
- Visualizar dashboard, rankings e estatisticas separadas por jogo.
- Preparar a estrutura para multiplos grupos de amigos usando `groupId` em jogadores, partidas e historico de sorteios.

## Tecnologias utilizadas

- Next.js com App Router
- TypeScript
- React
- Prisma ORM
- MySQL
- TailwindCSS
- Zod
- Docker Compose para producao em VPS
- Nginx como proxy reverso
- Certbot com Let's Encrypt para SSL

## Como instalar localmente

Requisitos locais:

- Node.js LTS
- MySQL ou Docker
- npm

Instale as dependencias:

```bash
npm install
```

Crie o arquivo `.env`:

```bash
cp .env.example .env
```

No Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Gere o client do Prisma:

```bash
npx prisma generate
```

Rode as migrations:

```bash
npx prisma migrate dev
```

Rode o seed inicial:

```bash
npm run prisma:seed
```

Inicie o projeto:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Como configurar o .env

Exemplo:

```env
DATABASE_URL="mysql://sorteador_user:change_me@localhost:3306/sorteador_times"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000
NODE_ENV=development
AUTH_JWT_SECRET=change_this_to_a_long_random_secret
AUTH_ADMIN_NAME=Administrador
AUTH_ADMIN_EMAIL=admin@sorteador.local
AUTH_ADMIN_PASSWORD=change_me_admin_123
```

Variaveis principais:

- `DATABASE_URL`: conexao MySQL usada pelo Prisma.
- `NEXT_PUBLIC_APP_URL`: URL publica da aplicacao.
- `PORT`: porta interna usada pelo Next.js em producao.
- `NODE_ENV`: ambiente da aplicacao.
- `AUTH_JWT_SECRET`: segredo usado para assinar o JWT de sessao.
- `AUTH_ADMIN_EMAIL` e `AUTH_ADMIN_PASSWORD`: credenciais do administrador criado pelo seed.

Em producao, use uma senha forte no MySQL e ajuste `NEXT_PUBLIC_APP_URL` para o dominio final:

```env
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
NODE_ENV=production
```

## Como configurar MySQL

Exemplo local ou em VPS Ubuntu:

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql
```

Dentro do MySQL:

```sql
CREATE DATABASE sorteador_times CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sorteador_user'@'localhost' IDENTIFIED BY 'troque_esta_senha';
GRANT ALL PRIVILEGES ON sorteador_times.* TO 'sorteador_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Configure o `.env`:

```env
DATABASE_URL="mysql://sorteador_user:troque_esta_senha@localhost:3306/sorteador_times"
```

## Docker com MySQL

O projeto já está preparado para rodar com Docker Compose usando MySQL, app Next.js e Nginx interno.

1. Construa e inicie os serviços:

```bash
docker compose up -d --build
```

2. O serviço `db` cria o banco `sorteador_times` e o usuário `sorteador_user` com senha `change_me`.
3. O serviço `app` aplica as migrations automaticamente e inicia o Next.js.
4. O serviço `nginx` publica a aplicacao em `http://localhost:8082`.

Se quiser parar os serviços:

```bash
docker compose down
```

## Prisma, migrations e seed

Gerar Prisma Client:

```bash
npx prisma generate
```

Criar e aplicar migration em desenvolvimento:

```bash
npx prisma migrate dev
```

Aplicar migrations em producao:

```bash
npx prisma migrate deploy
```

Rodar seed inicial:

```bash
npm run prisma:seed
```

O seed cria o grupo padrao, jogos iniciais, itens sorteaveis e jogadores de exemplo.

## Como iniciar o projeto

Desenvolvimento:

```bash
npm run dev
```

Build de producao:

```bash
npm run build
```

Start de producao:

```bash
npm run start
```

Fluxo recomendado para deploy com Docker:

```bash
docker compose up -d --build
docker compose exec -T app npm run prisma:seed
```

## Estrutura de pastas

```text
.
+-- docs/
�   +-- deploy/
+-- prisma/
�   +-- migrations/
�   +-- schema.prisma
�   +-- seed.ts
+-- public/
+-- src/
�   +-- app/
�   �   +-- matches/
�   �   +-- players/
�   �   +-- raffles/
�   �   +-- ranking/
�   �   +-- settings/
�   �   +-- stats/
�   +-- components/
�   �   +-- layout/
�   �   +-- ui/
�   +-- lib/
�       +-- db/
�       +-- validations/
+-- .env.example
+-- ecosystem.config.cjs
+-- package.json
+-- README.md
```

Pontos importantes:

- `src/app`: rotas do App Router.
- `src/components/layout`: layout principal e navegacao.
- `src/components/ui`: componentes reutilizaveis, incluindo foto de jogador.
- `src/lib/db`: acesso ao banco com Prisma.
- `src/lib/validations`: schemas Zod.
- `prisma/schema.prisma`: modelos do banco.
- `prisma/seed.ts`: dados iniciais.

## Modulos do sistema

### Dashboard

Mostra totais gerais, jogo mais jogado, jogadores em destaque e atalhos para novo sorteio, registrar partida, jogadores, rankings e estatisticas.

### Jogadores

Rota principal:

```text
/players
```

Permite listar, cadastrar, editar e excluir jogadores. Cada jogador pertence ao grupo padrao inicialmente. Partidas e historico de sorteios tambem gravam `groupId`, preparando a separacao futura por grupo.

Perfil individual:

```text
/players/[id]
```

Mostra foto grande, nome, apelido, estatisticas gerais, estatisticas por jogo, historico de partidas e itens mais usados.

### Configuracoes de itens

Rota:

```text
/settings/items
```

Permite gerenciar itens sorteaveis:

- Times do PES com `type = team`.
- Personagens do Mortal Kombat com `type = character`.
- Mapas do CS:GO/CS2 com `type = map`.
- Mapas, classes, armas e outros itens do Battlefield.

Todos os itens devem vir do banco. Nao use arrays fixos para times, personagens, mapas, classes ou armas.

### Sorteios

Rota:

```text
/raffles
```

Os sorteios usam jogadores e `GameItem` ativos do banco.

PES:

- Seleciona jogadores.
- Sorteia um time ativo para cada jogador.
- Nao repete time no mesmo sorteio.
- Permite salvar historico.

Mortal Kombat:

- Seleciona jogadores.
- Sorteia um personagem ativo para cada jogador.
- Nao repete personagem no mesmo sorteio.
- Permite salvar historico.

CS:GO/CS2:

- Seleciona varios jogadores.
- Embaralha e divide em Time A e Time B.
- Tenta equilibrar quantidade de jogadores.
- Sorteia um mapa ativo.
- Salva mapa, times e jogadores no historico.

Battlefield:

- Seleciona jogadores.
- Sorteia mapa, classe ou outro item ativo configurado.
- Permite salvar historico.

Historico:

```text
/raffles/history
```

Lista sorteios salvos, com filtros por jogo, jogador, data e tipo de item.

### Partidas

Rota:

```text
/matches
```

Registra partidas por jogo e salva dados em `Match` e `MatchPlayer`. O registro de partida recebe o `groupId` do grupo padrao para manter estatisticas e rankings isolaveis quando houver multiplos grupos.

Campos por jogo:

- PES: jogadores, time usado, gols e resultado.
- Mortal Kombat: jogadores, personagem usado, resultado e rounds vencidos.
- CS:GO/CS2: jogadores, mapa, time, resultado, kills, deaths, assists, headshots e knifeKills.
- Battlefield: jogadores, mapa, classe, resultado, kills, deaths, assists e score.

As validacoes usam Zod e nao permitem estatisticas negativas.

### Estatisticas

Rota:

```text
/stats
```

Mostra abas separadas por jogo. Cada aba exibe apenas as estatisticas relevantes daquele jogo, usando dados reais do banco.

### Ranking

Rota:

```text
/ranking
```

Permite filtrar por:

- Todos
- PES
- Mortal Kombat
- CS:GO
- Battlefield

Os rankings exibem posicao, foto do jogador, nome, apelido e estatistica principal.

## Cadastro de jogadores com foto

O cadastro usa o campo `photoUrl` no modelo `Player`.

Regras atuais:

- `name` e obrigatorio.
- `nickname` e opcional.
- `photoUrl` e opcional.
- Se `photoUrl` for informado, precisa ser uma URL valida.
- Se o jogador nao tiver foto, a interface mostra um placeholder com as iniciais do nome.

A exibicao de foto fica centralizada no componente:

```text
src/components/ui/player-photo.tsx
```

O input de foto fica preparado para evoluir para upload real futuramente:

```text
src/components/ui/player-photo-input.tsx
```

Hoje ele grava `photoUrl`; no futuro, o componente pode trocar a origem da imagem sem espalhar alteracoes pelas telas.

## Como funcionam os sorteios

Os sorteios nunca devem depender de arrays fixos no codigo. O fluxo esperado e:

1. O usuario seleciona jogadores.
2. O sistema busca `GameItem` ativos do jogo escolhido.
3. O sorteio aplica a regra especifica do jogo.
4. A interface exibe jogador com foto e item sorteado.
5. O usuario pode salvar o resultado em `RaffleHistory`, tambem vinculado ao `groupId` do grupo padrao.

Para CS:GO/CS2, o historico usa agrupamento para representar mapa sorteado, Time A, Time B e jogadores de cada time.

## Como funcionam as estatisticas

As estatisticas sao calculadas a partir de `Match` e `MatchPlayer`.

Exemplos:

- PES: gols, vitorias, media de gols e times mais usados.
- Mortal Kombat: vitorias, total de lutas, taxa de vitoria e personagem mais usado.
- CS:GO/CS2: kills, deaths, K/D, facadas, headshots e mapas mais jogados.
- Battlefield: score, kills, deaths, K/D, classes e mapas mais usados.

Sempre que possivel, use consultas agregadas com Prisma e mantenha as estatisticas separadas por jogo.

## Deploy na VPS da Hostinger

Ambiente considerado:

- VPS Linux Ubuntu
- Docker e Docker Compose
- Nginx
- Certbot com Let's Encrypt

### 1. Preparar servidor

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install git nginx ca-certificates curl -y
```

Instale Docker usando a documentacao oficial da distribuicao ou o pacote disponivel na VPS. Depois confira:

```bash
docker --version
docker compose version
```

### 2. Clonar projeto

```bash
cd /var/www
sudo git clone <URL_DO_REPOSITORIO> sorteador-times
sudo chown -R $USER:$USER /var/www/sorteador-times
cd /var/www/sorteador-times
```

### 3. Configurar .env de producao

```bash
cp .env.example .env
nano .env
```

Exemplo:

```env
DATABASE_URL="mysql://sorteador_user:senha_forte@localhost:3306/sorteador_times"
DOCKER_DATABASE_URL="mysql://sorteador_user:senha_forte@db:3306/sorteador_times"
DOCKER_NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
PORT=3000
NODE_ENV=production
MYSQL_DATABASE=sorteador_times
MYSQL_USER=sorteador_user
MYSQL_PASSWORD=senha_forte
MYSQL_ROOT_PASSWORD=outra_senha_forte
MYSQL_PORT=3307
AUTH_JWT_SECRET=gere_um_token_longo_aleatorio
AUTH_ADMIN_NAME=Administrador
AUTH_ADMIN_EMAIL=admin@seu-dominio.com
AUTH_ADMIN_PASSWORD=senha_forte_do_admin
```

### 4. Subir containers

```bash
docker compose up -d --build
docker compose ps
docker compose exec -T app npm run prisma:seed
```

Em atualizacoes futuras, normalmente rode:

```bash
git pull
docker compose up -d --build
docker compose exec -T app npx prisma migrate deploy
docker compose restart nginx
```

Tambem existe um script de deploy:

```bash
./deploy.sh
```

## Nginx como proxy reverso

Crie a configuracao:

```bash
sudo nano /etc/nginx/sites-available/sorteador-times
```

Exemplo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:

```bash
sudo ln -s /etc/nginx/sites-available/sorteador-times /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL com Certbot

Instale Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Gere o certificado:

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Teste renovacao:

```bash
sudo certbot renew --dry-run
```

## Comandos uteis

### npm

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

### Prisma

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npm run prisma:seed
npx prisma studio
```

### Docker

```bash
docker compose up -d --build
docker compose logs -f app
docker compose logs -f db
docker compose restart app
docker compose down
```

### Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

## Regras importantes do projeto

- Nao use arrays fixos para times, personagens, mapas, classes ou armas.
- Todos os itens sorteaveis devem vir de `GameItem`.
- Use Prisma para acesso ao banco.
- Use Zod em formularios e actions.
- Mantenha estatisticas separadas por jogo.
- Exiba foto do jogador em listagens, dashboard, sorteios, rankings e perfil.
- Mantenha a estrutura preparada para multiplos grupos usando `groupId` em `Player`, `Match` e `RaffleHistory`.
