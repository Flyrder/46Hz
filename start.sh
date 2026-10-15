#!/usr/bin/env bash
# ==============================================================================
# 46Hz Letterbox Launcher Script (macOS / Linux / POSIX Shell)
# Supports macOS (Darwin Apple Silicon arm64 & Intel x86_64) and Linux
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Text Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Defaults
PORT=3000
DO_VERIFY=false
VERIFY_ONLY=false
DO_SEED=false
PROD_MODE=false
NO_START=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --verify|-v)
      DO_VERIFY=true
      shift
      ;;
    --verify-only)
      VERIFY_ONLY=true
      shift
      ;;
    --seed|-s)
      DO_SEED=true
      shift
      ;;
    --prod|-p)
      PROD_MODE=true
      shift
      ;;
    --no-start)
      NO_START=true
      shift
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ./start.sh [options]"
      echo "Options:"
      echo "  --verify, -v      Run full verification suites during startup"
      echo "  --verify-only     Run verification and exit immediately"
      echo "  --seed, -s        Seed database with sample data"
      echo "  --prod, -p        Launch production server instead of dev server"
      echo "  --port <number>   Custom port (default: 3000)"
      echo "  --no-start        Prepare DB and Prisma client without starting server"
      exit 0
      ;;
    *)
      echo -e "${RED}[ERROR] Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${CYAN}==========================================================${NC}"
echo -e "${CYAN}             46Hz - 마음의 소리 익명 우체통               ${NC}"
echo -e "${CYAN}          Human-Centered Heart Sound Letterbox            ${NC}"
echo -e "${CYAN}==========================================================${NC}"

OS="$(uname -s)"
ARCH="$(uname -m)"
echo -e "[INFO] Detected Platform: ${GREEN}${OS}${NC} (${ARCH})"

# 1. Check or create .env file
if [[ ! -f "$SCRIPT_DIR/.env" ]]; then
  if [[ -f "$SCRIPT_DIR/.env.example" ]]; then
    echo -e "${YELLOW}[INFO] .env not found. Creating from .env.example...${NC}"
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
  else
    echo -e "${YELLOW}[WARN] .env not found and .env.example is missing.${NC}"
  fi
fi

# 2. Check if port 5432 is responding
check_port() {
  local port=5432
  if command -v nc >/dev/null 2>&1; then
    nc -z 127.0.0.1 "$port" >/dev/null 2>&1
    return $?
  fi
  if command -v lsof >/dev/null 2>&1; then
    lsof -i :"$port" >/dev/null 2>&1
    return $?
  fi
  # Fallback using node
  node -e "
    const net = require('net');
    const s = net.createConnection({ port: $port, host: '127.0.0.1', timeout: 1000 }, () => {
      s.end();
      process.exit(0);
    });
    s.on('error', () => process.exit(1));
    s.on('timeout', () => { s.destroy(); process.exit(1); });
  " >/dev/null 2>&1
  return $?
}

echo -e "\n[1/4] Checking PostgreSQL database service (port 5432)..."
if ! check_port; then
  echo -e "${YELLOW}[INFO] Port 5432 is not responding. Checking container managers...${NC}"

  if command -v docker >/dev/null 2>&1; then
    echo -e "${CYAN}[INFO] Managing container with Docker CLI...${NC}"
    if docker ps -a --format '{{.Names}}' | grep -Eq '^46hz-postgres$'; then
      echo -e "${GREEN}[INFO] Starting existing 46hz-postgres container...${NC}"
      docker start 46hz-postgres
    else
      echo -e "${GREEN}[INFO] Creating and launching 46hz-postgres container (PostgreSQL 19 Beta)...${NC}"
      docker run -d --name 46hz-postgres -p 127.0.0.1:5432:5432 \
        -e POSTGRES_USER=46hz -e POSTGRES_PASSWORD=46hz -e POSTGRES_DB=46hz_letterbox \
        -v 46hz_postgres_data:/var/lib/postgresql/data \
        postgres:19beta4-alpine3.24
    fi
  elif [[ "$OS" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
    echo -e "${CYAN}[INFO] macOS Homebrew detected. Checking PostgreSQL services...${NC}"
    if brew services list | grep -q "postgresql"; then
      brew services start postgresql || true
    fi
  else
    echo -e "${RED}[ERROR] Neither Docker nor local PostgreSQL was found on port 5432.${NC}"
    echo -e "Please start PostgreSQL or Docker manually."
    exit 1
  fi

  # Wait for PostgreSQL to be ready
  echo -e "[INFO] Waiting for PostgreSQL to accept connections..."
  retries=20
  while ! check_port; do
    retries=$((retries - 1))
    if [[ $retries -le 0 ]]; then
      echo -e "${RED}[ERROR] PostgreSQL did not become ready in time.${NC}"
      exit 1
    fi
    sleep 1
  done
  echo -e "${GREEN}[OK] PostgreSQL is ready and accepting connections on port 5432.${NC}"
else
  echo -e "${GREEN}[OK] PostgreSQL is active on port 5432.${NC}"
fi

# 3. Generate Prisma Client & Migrate Schema
echo -e "\n[2/4] Generating Prisma Client and verifying schema..."
npm run prisma:generate

echo -e "\n[3/4] Ensuring database migrations are applied..."
npm run prisma:migrate || {
  echo -e "${YELLOW}[WARN] prisma:migrate encountered an issue, trying deploy fallback...${NC}"
  npx prisma7 migrate deploy || true
}

if [[ "$DO_SEED" == "true" ]]; then
  echo -e "\n[INFO] Seeding database with initial data..."
  npm run prisma:seed
fi

# 4. Optional Verification
if [[ "$DO_VERIFY" == "true" || "$VERIFY_ONLY" == "true" ]]; then
  echo -e "\n[*] Running backend verification suite..."
  npm run verify:backend

  echo -e "\n[*] Running test suite (Vitest)..."
  npm run test:run

  if [[ "$VERIFY_ONLY" == "true" ]]; then
    echo -e "\n${GREEN}[SUCCESS] All checks and verifications passed successfully!${NC}"
    exit 0
  fi
fi

if [[ "$NO_START" == "true" ]]; then
  echo -e "\n${GREEN}[SUCCESS] Environment ready. (Skipping server start as requested)${NC}"
  exit 0
fi

# 5. Launch Application Server
echo -e "\n[4/4] Starting 46Hz Letterbox application on http://localhost:${PORT}..."
echo -e "Press Ctrl+C to stop the server.\n"

export PORT="$PORT"
if [[ "$PROD_MODE" == "true" ]]; then
  npm run build
  exec npm start
else
  exec npm run dev
fi
