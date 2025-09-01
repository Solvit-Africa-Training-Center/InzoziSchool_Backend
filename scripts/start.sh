#!/bin/sh
set -euo pipefail

# Colors
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

log() { echo "${GREEN}[$(date)] $1${NC}"; }
warn() { echo "${YELLOW}[$(date)] $1${NC}"; }
error() { echo "${RED}[$(date)] ERROR: $1${NC}"; }

log "Starting Inzozi Backend (Dev Mode)..."

# Wait for PostgreSQL
log "Waiting for PostgreSQL at ${DEV_HOST}:${DEV_PORT}..."
for i in $(seq 1 30); do
  if nc -z "$DEV_HOST" "$DEV_PORT" >/dev/null 2>&1; then
    log "✅ PostgreSQL is ready!"
    break
  fi
  warn "🟨 PostgreSQL not ready yet... retrying ($i/30)"
  sleep 2
done

# Run migrations
log "🔧 Running migrations..."
npx sequelize-cli db:migrate --config src/config/config.js || {
  error "Migrations failed!"
  exit 1
}

# Seed (optional in dev)
log "🌱 Seeding database..."
npx sequelize-cli db:seed:all --config src/config/config.js || {
  error "Seeding failed!"
  exit 1
}

# Start dev server (no build step)
log "🚀 Starting dev server with 'npm run dev'..."
exec npm run dev