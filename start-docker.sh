#!/usr/bin/env bash
# =============================================================================
# Librería Cartagena - arranque con Docker
#
#   MySQL (contenedor mysql-cartagena) -> se une a la red libreria-network
#   Gateway Nginx                      -> http://localhost:8081
#   API C#                             -> http://localhost:8083 (directo)
#   Login Node                         -> http://localhost:3000 (directo)
#   Frontend Vite (nativo)             -> http://localhost:5173  (proxy -> gateway)
#
# Uso:   ./start-docker.sh      (Ctrl+C detiene Vite; el stack sigue en Docker)
#        ./start-docker.sh --down   para apagar también los contenedores
# =============================================================================
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$RAIZ/Backend/Cartagena"
FRONTEND="$RAIZ/Frontend"
LOGS="$RAIZ/.dev-logs"
CONTENEDOR="mysql-cartagena"
RED="libreria-network"
GATEWAY_PORT="${GATEWAY_PORT:-8081}"
VITE_PORT="${VITE_PORT:-5173}"

mkdir -p "$LOGS"

azul()  { printf '\033[1;34m%s\033[0m\n' "$*"; }
verde() { printf '\033[1;32m%s\033[0m\n' "$*"; }
rojo()  { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }
amar()  { printf '\033[1;33m%s\033[0m\n' "$*"; }
morir() { rojo "ERROR: $*"; exit 1; }

[[ -f "$BACKEND/.env" ]] || morir "No existe $BACKEND/.env. Copia .env.example y completa los valores."
set -a
# shellcheck disable=SC1091
source "$BACKEND/.env"
set +a

command -v docker >/dev/null || morir "Docker no está instalado."
docker compose version >/dev/null 2>&1 || morir "Falta el plugin 'docker compose'."

cd "$BACKEND"

if [[ "${1:-}" == "--down" ]]; then
  azul "Apagando el stack..."
  docker compose down --remove-orphans
  verde "Stack detenido. MySQL ($CONTENEDOR) se deja encendido."
  exit 0
fi

# ---------------------------------------------------------------------------
# 1. Red compartida con la base de datos existente
# ---------------------------------------------------------------------------
azul "[1/4] Red y base de datos"

docker network inspect "$RED" >/dev/null 2>&1 || docker network create "$RED" >/dev/null
verde "  Red $RED lista."

docker inspect "$CONTENEDOR" >/dev/null 2>&1 || morir "No existe el contenedor '$CONTENEDOR'."
if [[ "$(docker inspect -f '{{.State.Running}}' "$CONTENEDOR")" != "true" ]]; then
  echo "  Iniciando $CONTENEDOR..."
  docker start "$CONTENEDOR" >/dev/null
fi
docker update --restart unless-stopped "$CONTENEDOR" >/dev/null 2>&1 || true

if ! docker inspect -f '{{json .NetworkSettings.Networks}}' "$CONTENEDOR" | grep -q "\"$RED\""; then
  echo "  Conectando $CONTENEDOR a $RED con alias 'mysql'..."
  docker network connect --alias mysql "$RED" "$CONTENEDOR"
fi
verde "  MySQL disponible para el stack en mysql:3306."

echo -n "  Esperando MySQL "
for _ in $(seq 1 60); do
  if (exec 3<>"/dev/tcp/127.0.0.1/3307") 2>/dev/null; then
    echo " OK"
    break
  fi
  echo -n "."
  sleep 1
done

# ---------------------------------------------------------------------------
# 2. Levantar el stack
# ---------------------------------------------------------------------------
azul "[2/4] Construyendo y levantando contenedores (la primera vez tarda)"
docker compose up -d --build

# ---------------------------------------------------------------------------
# 3. Esperar gateway y crear usuarios demo
# ---------------------------------------------------------------------------
azul "[3/4] Esperando servicios"
echo -n "  Gateway "
for _ in $(seq 1 120); do
  if curl -fsS -m 2 "http://localhost:$GATEWAY_PORT/health" >/dev/null 2>&1; then
    echo " OK"
    break
  fi
  echo -n "."
  sleep 2
done
curl -fsS -m 2 "http://localhost:$GATEWAY_PORT/health" >/dev/null 2>&1 \
  || morir "El gateway no respondió. Revisa: docker compose logs gateway"

# Aplica el esquema y asegura los usuarios demo dentro del contenedor de login.
echo "  Aplicando esquema y usuarios demo..."
docker compose exec -T login npm run --silent db:schema
docker compose exec -T login npm run --silent db:demo

# ---------------------------------------------------------------------------
# 4. Frontend apuntando al gateway
# ---------------------------------------------------------------------------
azul "[4/4] Frontend Vite (proxy -> $GATEWAY_PORT)"
if ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${VITE_PORT}$"; then
  morir "El puerto $VITE_PORT ya está ocupado. Usa ./stop-dev.sh"
fi

[[ -d "$FRONTEND/node_modules" ]] || (cd "$FRONTEND" && npm ci --silent)

limpiar() {
  trap - EXIT INT TERM
  echo
  amar "Deteniendo Vite. El stack Docker sigue arriba."
  echo "  Para apagarlo: ./start-docker.sh --down"
  exit 0
}
trap limpiar EXIT INT TERM

echo
verde "  Frontend:  http://localhost:$VITE_PORT"
echo  "  Gateway:   http://localhost:$GATEWAY_PORT"
echo  "  API C#:    http://localhost:8083/scalar/v1"
echo  "  MySQL:     127.0.0.1:3307 (usuario_app / app123)"
echo
echo  "  Ctrl+C detiene solo Vite."

cd "$FRONTEND"
VITE_AUTH_PROXY_TARGET="http://localhost:$GATEWAY_PORT" \
VITE_API_PROXY_TARGET="http://localhost:$GATEWAY_PORT" \
npm run dev -- --host 127.0.0.1
