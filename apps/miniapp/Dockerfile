# --- Stage 1: build ---
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src

# Vite inlines import.meta.env.VITE_* at build time (not read at runtime),
# so these must be supplied as build args — see docker-compose.yml's
# `build.args` for this service.
ARG VITE_API_BASE_URL
ARG VITE_PUBLIC_SITE_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_PUBLIC_SITE_BASE_URL=${VITE_PUBLIC_SITE_BASE_URL}
RUN npx tsc -b && npx vite build

# --- Stage 2: runtime ---
# Static output only — no Node runtime needed, so this is plain nginx
# rather than matching the other three apps' node:20-slim.
FROM nginx:1.27-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 127.0.0.1, not "localhost": BusyBox's wget resolves "localhost" to ::1
# first per /etc/hosts and gives up immediately ("Connection refused")
# rather than falling back to IPv4 when the host has no IPv6 route — nginx
# itself is fine (external traffic through the docker network works), only
# this in-container loopback check needs the explicit address.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O- http://127.0.0.1/health || exit 1

EXPOSE 80
