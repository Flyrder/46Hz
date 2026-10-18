#!/bin/sh
set -e

# Synchronize database contract via Prisma 8 if DATABASE_URL is provided
if [ -n "$DATABASE_URL" ]; then
  echo "[46Hz] Synchronizing database contract via Prisma 8..."
  if [ -f "./node_modules/prisma/dist/prisma.js" ]; then
    node ./node_modules/prisma/dist/prisma.js contract emit || echo "[46Hz] Contract emit skipped or already applied."
  elif command -v npx >/dev/null 2>&1; then
    npx prisma contract emit || echo "[46Hz] Contract emit skipped or already applied."
  fi
fi

echo "[46Hz] Starting 46Hz Letterbox application on port ${PORT:-3000}..."
exec "$@"
