# ─── VaidyaMarg — convenience commands ───────────────────────────

.PHONY: up down dev build logs ps migrate seed clean

## Start all services in production mode
up:
	docker compose up -d

## Stop all services
down:
	docker compose down

## Start in development mode (hot-reload)
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

## Rebuild all images
build:
	docker compose build --no-cache

## Tail logs for all services
logs:
	docker compose logs -f

## Show running containers
ps:
	docker compose ps

## Run Prisma migrations inside the api container
migrate:
	docker compose exec api npx prisma migrate deploy

## Seed the database
seed:
	docker compose exec api npx prisma db seed

## Remove all containers, volumes, and networks
clean:
	docker compose down -v --remove-orphans
