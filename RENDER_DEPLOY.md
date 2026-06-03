# Deploy no Render

Este projeto esta preparado para deploy no Render usando Dockerfile e PostgreSQL.

## Servico Web

Crie um **Web Service** no Render apontando para este repositorio e selecione deploy via **Dockerfile**.

O container expoe a porta `3000`, mas o Next.js tambem respeita a variavel `PORT` definida pelo Render.

## Banco PostgreSQL

Crie um banco PostgreSQL no Render e copie a **Internal Database URL** para as variaveis do Web Service.

## Variaveis de ambiente

Configure estas variaveis no Render:

```env
NODE_ENV=production
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://NOME-DO-SERVICO.onrender.com
PORT=3000
```

## Migrations

A imagem Docker contem o Prisma CLI. Depois do primeiro deploy, execute no Shell do Render:

```sh
npx prisma migrate deploy
```

Se quiser popular dados iniciais, execute:

```sh
npm run prisma:seed
```

## Observacoes

- Nao envie o arquivo `.env` real para o Git.
- Use a URL interna do PostgreSQL no `DATABASE_URL`.
- O Dockerfile gera o Prisma Client e o build standalone do Next.js dentro da imagem.
- O container inicia com `node server.js`, gerado pelo `output: "standalone"` do Next.js.
