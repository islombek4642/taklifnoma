# --- Stage 1: build ---
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 2: runtime ---
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# procps: provides pgrep, used by the healthcheck below (this process has
# no HTTP server to curl, unlike the other three apps).
RUN apt-get update && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN chown -R node:node /app
USER node

# Long-polling process, no HTTP server — healthcheck is a liveness check
# on the process itself, matching sibling projects' worker/scheduler
# services (which are also not HTTP-facing).
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD pgrep -f "node dist/index.js" || exit 1

CMD ["node", "dist/index.js"]
