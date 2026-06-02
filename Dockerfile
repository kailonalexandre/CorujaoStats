FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache libc6-compat

COPY package.json ./
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
