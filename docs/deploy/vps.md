# Deploy em VPS Linux

Base preparada para Node.js, PM2, Nginx e PostgreSQL.

## Variaveis

Crie `.env` no servidor com:

```bash
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sortearor_times?schema=public"
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
```

## Build

```bash
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
```

## PM2

```bash
pm2 start npm --name sortearor-times -- start
pm2 save
pm2 startup
```

## Nginx

```nginx
server {
  server_name seu-dominio.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
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
