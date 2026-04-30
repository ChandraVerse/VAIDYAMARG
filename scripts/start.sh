#!/bin/bash
# VaidyaMarg — Quick Start Script
set -e

echo "🚀 Starting VaidyaMarg..."

# Check .env exists
if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please fill in your .env values before running again!"
  exit 1
fi

# Build and start all services
echo "🐳 Building Docker images..."
docker-compose build

echo "▶️  Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "🗄️  Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

echo "🌱 Seeding medicine database..."
docker-compose exec backend npx ts-node src/modules/medicines/seed/medicines.seed.ts

echo ""
echo "✅ VaidyaMarg is running!"
echo "   🌐 API:     http://localhost:3000"
echo "   📖 Docs:   http://localhost:3000/api/docs"
echo "   🤖 OCR:    http://localhost:8001"
echo "   🗄️  DB:     localhost:5432"
echo "   🔴 Redis:  localhost:6379"
