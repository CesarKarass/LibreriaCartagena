#!/usr/bin/env bash
# Detiene los servicios levantados por ./start-dev.sh
set -uo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS="$RAIZ/.dev-logs"
PUERTOS=(3000 5000 5173)

rojo()  { printf '\033[1;31m%s\033[0m\n' "$*"; }
verde() { printf '\033[1;32m%s\033[0m\n' "$*"; }
amar()  { printf '\033[1;33m%s\033[0m\n' "$*"; }

# 1. PIDs anotados por start-dev.sh
if [[ -f "$LOGS/pids" ]]; then
  while IFS= read -r pid; do
    [[ -n "$pid" ]] || continue
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done < "$LOGS/pids"
  rm -f "$LOGS/pids"
fi

# 2. Procesos hijos que puedan quedar escuchando
pkill -f "Cartagena.Api.dll" 2>/dev/null || true
pkill -f "node .*Frontend/node_modules/.bin/vite" 2>/dev/null || true
pkill -f "sh -c vite" 2>/dev/null || true

# 3. Red de seguridad: si algo sigue ocupando los puertos, avisa con el PID.
sleep 1
quedan=0
for puerto in "${PUERTOS[@]}"; do
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
