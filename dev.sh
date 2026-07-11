#!/bin/bash
# Inicia backend (Go) e frontend (Vite) juntos. Ctrl+C encerra os dois.

cleanup() {
  kill $(jobs -p) 2>/dev/null
}
trap cleanup EXIT INT TERM

echo "🐝 Backend  -> http://localhost:3001"
echo "🐝 Frontend -> http://localhost:5173"
echo

(cd "$(dirname "$0")/backend" && go run main.go) &
(cd "$(dirname "$0")/frontend" && npm run dev) &

wait
