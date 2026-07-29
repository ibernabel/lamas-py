#!/usr/bin/env bash
# Start all LAMaS development services (DB, Backend, Frontend) in a single terminal session

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting LAMaS Development Environment..."

# 1. Start Database Container
echo "📦 [1/3] Starting PostgreSQL Database..."
docker compose up -d db

# 2. Setup trap for clean process exit on Ctrl+C
cleanup() {
    echo -e "\n🛑 Stopping LAMaS development servers..."
    kill $(jobs -p) 2>/dev/null || true
    echo "✅ Shutdown complete."
}
trap cleanup EXIT INT TERM

# 3. Start FastAPI Backend in background
echo "⚡ [2/3] Starting FastAPI Backend (port 8001)..."
(cd backend && uv run uvicorn app.main:app --port 8001 --reload) &

# Brief pause to allow backend initialization
sleep 2

# 4. Start Next.js Frontend in foreground
echo "🎨 [3/3] Starting Next.js Frontend (port 3000)..."
(cd frontend && pnpm run dev)
