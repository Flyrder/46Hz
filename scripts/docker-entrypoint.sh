#!/bin/sh
set -e

# Synchronize database schema if DATABASE_URL is provided
if [ -n "$DATABASE_URL" ]; then
  echo "[46Hz] Synchronizing database schema via Prisma..."
  node ./node_modules/prisma/build/index.js db push --skip-generate || echo "[46Hz] Schema sync skipped or already applied."
fi

echo "[46Hz] Starting 46Hz Letterbox application on port ${PORT:-3000}..."
exec "$@"
