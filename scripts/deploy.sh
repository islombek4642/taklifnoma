#!/bin/bash
# Taklifnoma Production Deployment Script
# Run on server: bash scripts/deploy.sh

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}=== Taklifnoma Deployment ===${NC}"

# Pull first, before anything else, and re-exec into the freshly pulled
# script. Without this, a script that pulls new code into the very file
# bash is currently executing keeps running with the OLD file content for
# the rest of its steps (bash already has it open) - so a fix committed to
# deploy.sh itself would silently not take effect until the NEXT run. `exec`
# replaces the process image, forcing bash to re-read $0 from disk fresh.
# TAKLIFNOMA_DEPLOY_REEXECUTED guards against re-pulling/re-execing forever.
echo -e "${YELLOW}[1/8] Pulling latest code...${NC}"
if [[ -z "${TAKLIFNOMA_DEPLOY_REEXECUTED:-}" ]]; then
  git stash
  git pull origin main
  git stash pop 2>/dev/null || true
  echo "Re-executing deploy.sh from the freshly pulled version..."
  export TAKLIFNOMA_DEPLOY_REEXECUTED=1
  exec bash "$0" "$@"
else
  echo "Already running the freshly pulled version."
fi

echo -e "${YELLOW}[2/8] Pre-flight checks...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Docker not installed. Installing...${NC}"
  curl -fsSL https://get.docker.com | sudo sh
fi

if [[ ! -f .env ]]; then
  echo -e "${RED}.env not found. Copy .env.example to .env and fill in values.${NC}"
  exit 1
fi

if ! grep -q '^TELEGRAM_BOT_TOKEN=.\+' .env || grep -q '^TELEGRAM_BOT_TOKEN=replace-with' .env; then
  echo -e "${RED}TELEGRAM_BOT_TOKEN in .env is missing or still the placeholder value. Set a real token from @BotFather.${NC}"
  exit 1
fi

echo -e "${YELLOW}[3/8] Ensuring proxy_network exists...${NC}"
if ! sudo docker network inspect proxy_network &>/dev/null; then
  sudo docker network create proxy_network
fi

echo -e "${YELLOW}[4/8] Backing up backend database...${NC}"
mkdir -p backups
if sudo docker volume inspect taklifnoma_backend_data &>/dev/null; then
  BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).db"
  sudo docker run --rm \
    -v taklifnoma_backend_data:/data:ro \
    -v "$PROJECT_DIR/backups":/backup \
    alpine sh -c "if [ -f /data/prod.db ]; then cp /data/prod.db /backup/${BACKUP_NAME} && gzip /backup/${BACKUP_NAME}; fi" \
    && echo -e "${GREEN}Backup created: backups/${BACKUP_NAME}.gz${NC}" \
    || echo -e "${YELLOW}Backup skipped (no database file yet — first deploy?)${NC}"
else
  echo -e "${YELLOW}Backup skipped (volume doesn't exist yet — first deploy)${NC}"
fi

echo -e "${YELLOW}[5/8] Building images...${NC}"
sudo docker compose down
sudo docker compose build

# Migrations must run BEFORE the backend service starts: on a fresh/
# un-migrated database, the backend's first request would fail against
# missing tables. Running via `compose run` (a one-off container, not the
# long-running "backend" service) sidesteps any chicken-and-egg startup
# ordering issue entirely.
echo -e "${YELLOW}[6/8] Running backend database migrations...${NC}"
sudo docker compose run --rm -T backend npx prisma migrate deploy

echo -e "${YELLOW}[7/8] Starting containers...${NC}"
sudo docker compose up -d

echo -e "${YELLOW}[8/8] Checking health...${NC}"
echo "Waiting for containers to initialize..."
sleep 10

# backend/public-site images have curl; miniapp (nginx:alpine) only has
# BusyBox's wget, no curl — check each with the tool its image actually has.
check_health_curl() {
  local service="$1"
  local url="$2"
  local http_code
  http_code=$(sudo docker compose exec -T "$service" curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")
  if [[ "$http_code" == "200" ]]; then
    echo -e "${GREEN}${service} is healthy.${NC}"
  else
    echo -e "${RED}${service} health check failed (status: ${http_code}). Check logs: docker compose logs ${service}${NC}"
  fi
}

check_health_wget() {
  local service="$1"
  local url="$2"
  if sudo docker compose exec -T "$service" wget -q -O /dev/null "$url" 2>/dev/null; then
    echo -e "${GREEN}${service} is healthy.${NC}"
  else
    echo -e "${RED}${service} health check failed. Check logs: docker compose logs ${service}${NC}"
  fi
}

check_health_curl backend "http://localhost:3000/health"
check_health_curl public-site "http://localhost:4000/health"
check_health_wget miniapp "http://127.0.0.1/health"

if sudo docker compose ps bot --format '{{.Status}}' | grep -qi "healthy\|Up"; then
  echo -e "${GREEN}bot is running.${NC}"
else
  echo -e "${RED}bot is not running as expected. Check logs: docker compose logs bot${NC}"
fi

echo -e "${GREEN}=== Deployment Complete ===${NC}"
DOMAIN_VALUE=$(grep '^DOMAIN=' .env | cut -d= -f2)
API_DOMAIN_VALUE=$(grep '^API_DOMAIN=' .env | cut -d= -f2)
MINIAPP_DOMAIN_VALUE=$(grep '^MINIAPP_DOMAIN=' .env | cut -d= -f2)
echo "Test: curl -I https://${DOMAIN_VALUE}/health"
echo "Test: curl -I https://${API_DOMAIN_VALUE}/health"
echo "Test: curl -I https://${MINIAPP_DOMAIN_VALUE}/health"
