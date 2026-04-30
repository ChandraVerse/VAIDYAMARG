# ─── Base ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./

# ─── Dependencies ─────────────────────────────────────────────────────────
FROM base AS deps
RUN npm ci --only=production && cp -R node_modules /tmp/prod_modules
RUN npm ci

# ─── Build ────────────────────────────────────────────────────────────────
FROM deps AS builder
COPY . .
RUN npm run build
RUN npx prisma generate

# ─── Development ──────────────────────────────────────────────────────────
FROM deps AS development
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "start:dev"]

# ─── Production ───────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nestjs

COPY --from=builder /tmp/prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

USER nestjs
EXPOSE 3000

# Run DB migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
