#!/usr/bin/env sh
set -eu

log() {
    printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "Atualizando branch main"
git pull origin main

log "Construindo e subindo containers"
docker compose up -d --build

log "Aguardando containers inicializarem"
sleep 10

log "Executando migrations Prisma"
docker compose exec -T app npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
    log "Executando seed inicial"
    docker compose exec -T app npm run prisma:seed
fi

log "Recarregando Nginx para atualizar upstream do app"
docker compose restart nginx

log "Deploy finalizado"
docker compose ps
