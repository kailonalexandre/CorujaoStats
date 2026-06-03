#!/usr/bin/env sh
set -eu

log() {
    printf '\n[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "Atualizando branch main"
git pull origin main

COMPOSE_FILES="${COMPOSE_FILES:-docker-compose.yml}"
COMPOSE_ARGS=""
for file in $COMPOSE_FILES; do
    COMPOSE_ARGS="$COMPOSE_ARGS -f $file"
done

log "Construindo e subindo containers"
docker compose $COMPOSE_ARGS up -d --build

log "Aguardando containers inicializarem"
sleep 10

log "Executando migrations Prisma"
docker compose $COMPOSE_ARGS exec -T app npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
    log "Executando seed inicial"
    docker compose $COMPOSE_ARGS exec -T app npm run prisma:seed
fi

log "Recarregando Nginx para atualizar upstream do app"
docker compose $COMPOSE_ARGS restart nginx

log "Deploy finalizado"
docker compose $COMPOSE_ARGS ps
