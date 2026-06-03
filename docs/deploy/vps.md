# Deploy em VPS Linux com Docker e MySQL externo

Este projeto deve rodar em producao com:

- Docker Compose para `app` e `nginx` do projeto.
- MySQL fora do container deste projeto.
- Nginx externo da VPS fazendo proxy para `127.0.0.1:8082`.

## 1. Preparar MySQL fora do Docker

Se o MySQL estiver instalado na propria VPS:

```bash
sudo mysql
```

```sql
CREATE DATABASE sorteador_times CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sorteador_user'@'%' IDENTIFIED BY 'SENHA_FORTE';
GRANT ALL PRIVILEGES ON sorteador_times.* TO 'sorteador_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

O container acessa o host da VPS por `host.docker.internal`. Garanta que o MySQL aceite conexao a partir da rede Docker. Em Ubuntu, revise:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Para VPS com firewall fechado, uma configuracao comum e:

```ini
bind-address = 0.0.0.0
```

Depois:

```bash
sudo systemctl restart mysql
sudo systemctl status mysql
```

Teste no SSH:

```bash
mysql -h 127.0.0.1 -P 3306 -u sorteador_user -p sorteador_times
```

## 2. Configurar `.env`

No servidor:

```bash
cp .env.example .env
nano .env
```

Exemplo para MySQL instalado na propria VPS:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

DATABASE_URL="mysql://sorteador_user:SENHA_FORTE@host.docker.internal:3306/sorteador_times"

AUTH_JWT_SECRET=SEGREDO_LONGO_GERADO_COM_OPENSSL
AUTH_ADMIN_NAME=Administrador
AUTH_ADMIN_EMAIL=admin@seu-dominio.com
AUTH_ADMIN_PASSWORD=SENHA_FORTE_DO_ADMIN
```

Gere o segredo JWT no SSH:

```bash
openssl rand -base64 48
```

## 3. Subir em producao

O `docker-compose.yml` de producao nao sobe MySQL.

```bash
docker compose up -d --build
docker compose ps
```

O app executa `prisma migrate deploy` automaticamente antes de iniciar.

Rode o seed inicial para criar o admin:

```bash
docker compose exec -T app npm run prisma:seed
```

## 4. Atualizar pelo SSH

Fluxo normal:

```bash
cd /var/www/sorteador-times
git pull origin main
docker compose up -d --build
docker compose exec -T app npx prisma migrate deploy
docker compose restart nginx
docker compose ps
```

Ou use o script:

```bash
./deploy.sh
```

Para rodar seed junto:

```bash
RUN_SEED=true ./deploy.sh
```

## 5. Nginx externo da VPS

O compose publica o Nginx interno em `127.0.0.1:8082`.

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

## 6. Uploads

As imagens ficam no volume Docker `uploads_data` e sao servidas pelo Nginx interno em `/uploads/...`.

Comandos uteis:

```bash
docker volume ls | grep uploads
docker compose exec -T app find /app/public/uploads -maxdepth 3 -type f
docker compose exec -T nginx find /usr/share/nginx/html/uploads -maxdepth 3 -type f
```

## 7. Desenvolvimento local com MySQL em container

Use o arquivo de override:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.local.yml exec -T app npm run prisma:seed
```

O override usa variaveis `LOCAL_*` para apontar o app para o MySQL `db` e para `http://localhost:8082`, sem alterar as variaveis de producao.

Dados locais do MySQL em container:

```text
Host: 127.0.0.1
Porta: 3307
Database: sorteador_times
Usuario: sorteador_user
Senha: change_me
Root: root
Senha root: change_root_me
```

## 8. Diagnostico

```bash
docker compose logs -f app
docker compose logs -f nginx
docker compose exec -T app npx prisma migrate status
docker compose exec -T app npx prisma db seed
```

Para diagnosticar o banco local em container, inclua o override:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f db
```
