#!/usr/bin/env bash
# Detiene los servicios levantados por ./start-local.sh, incluida la MariaDB local.
set -uo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS="$RAIZ/.dev-logs"
DB_BASE="$HOME/.local/share/cartagena-mysql"
PUERTOS=(3000 5173)

rojo()  { printf '\033[1;31m%s\033[0m\n' "$*"; }
verde() { printf '\033[1;32m%s\033[0m\n' "$*"; }
amar()  { printf '\033[1;33m%s\033[0m\n' "$*"; }

if [[ -f "$LOGS/pids" ]]; then
  while IFS= read -r pid; do
    [[ -n "$pid" ]] || continue
    kill "$pid" 2>/dev/null || true
  done < "$LOGS/pids"
  rm -f "$LOGS/pids"
fi

pkill -f "node .*Frontend/node_modules/.bin/vite" 2>/dev/null || true
pkill -f "microservicio-login/src/server.js" 2>/dev/null || true

if [[ -f "$DB_BASE/mysqld.pid" ]]; then
  kill "$(cat "$DB_BASE/mysqld.pid")" 2>/dev/null || true
fi

sleep 1

quedan=0
for puerto in "${PUERTOS[@]}" 3307; do
  if ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${puerto}$"; then
    rojo "El puerto $puerto sigue ocupado:"
    ss -ltnp 2>/dev/null | grep -E "[:.]${puerto}\b" || true
    quedan=1
  fi
done

if [[ "$quedan" -eq 0 ]]; then
  verde "Servicios detenidos."
else
  amar "Detén manualmente los procesos de arriba (kill -9 <pid>) y vuelve a intentar."
  exit 1
fi
