# Deploy em VPS Linux com Docker

Base preparada para Docker Compose, Nginx e MySQL 8.4.

## 1. Variaveis

Crie `.env` no servidor a partir do exemplo:

```bash
cp .env.example .env
nano .env
```

Exemplo de producao:

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

Use senhas fortes e mantenha o `.env` fora do Git.
O `AUTH_JWT_SECRET` e obrigatorio em producao; use um valor longo e aleatorio.

## 2. Subir containers

```bash
docker compose up -d --build
docker compose ps
```

O container `app` aguarda o healthcheck do MySQL, aplica `prisma migrate deploy` e inicia o Next.js.

Para popular os dados iniciais:

```bash
docker compose exec -T app npm run prisma:seed
```

O seed cria o usuario administrador usando `AUTH_ADMIN_EMAIL` e `AUTH_ADMIN_PASSWORD`.

## 3. Atualizar deploy

```bash
git pull origin main
docker compose up -d --build
docker compose exec -T app npx prisma migrate deploy
docker compose restart nginx
```

Ou use:

```bash
./deploy.sh
```

Para rodar seed junto:

```bash
RUN_SEED=true ./deploy.sh
```

## 4. Nginx externo da VPS

O compose publica o Nginx interno em `127.0.0.1:8082`. Aponte o Nginx do servidor para essa porta:

```nginx
server {
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
  }
}
```

Depois:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## 5. Comandos uteis

```bash
docker compose logs -f app
docker compose logs -f db
docker compose restart app
docker compose exec -T app npx prisma migrate status
docker compose exec -T app npm run prisma:seed
docker compose down
```
