# --- Stage 1: build ---
FROM node:20-slim AS builder
WORKDIR /app

# openssl must be present here, before `prisma generate` runs: Prisma
# probes the local OpenSSL version to pick the "native" engine binary, and
# without it present it silently falls back to a stale default
# (debian-openssl-1.1.x) instead of matching what the runtime stage
# actually has (Debian bookworm's openssl 3.0.x) — the schema's explicit
# binaryTargets is the real fix (guarantees the right engine ships
# regardless of "native" detection), this just keeps "native" accurate too.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# `prisma generate` never connects to a database, so a dummy DATABASE_URL
# is enough to satisfy Prisma's config loader for this build-time step only.
COPY prisma ./prisma
ENV DATABASE_URL="file:/tmp/build.db"
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 2: runtime ---
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# curl: Docker healthcheck. openssl: Prisma's query engine dynamically
# links against it on Debian and fails to load without it.
RUN apt-get update && apt-get install -y --no-install-recommends curl openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# SQLite file lives on a mounted volume at /app/data (see docker-compose.yml)
# so it survives container recreation.
RUN mkdir -p /app/data && chown -R node:node /app
USER node

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "dist/presentation/server.js"]
