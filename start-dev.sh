#!/usr/bin/env bash
# =============================================================================
# Librería Cartagena - arranque de desarrollo (modo nativo)
#
#   MySQL (contenedor mysql-cartagena)  -> 127.0.0.1:3307
#   Login Node                          -> http://localhost:3000
#   API ASP.NET Core                    -> http://localhost:5000
#   Frontend Vite                       -> http://localhost:5173
#
# Uso:   ./start-dev.sh        (Ctrl+C detiene todo)
# =============================================================================
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$RAIZ/Backend/Cartagena"
LOGIN_DIR="$BACKEND/servicios/microservicio-login"
API_CSPROJ="$BACKEND/backend/Cartagena.Api/Cartagena.Api.csproj"
API_DIR="$BACKEND/backend/Cartagena.Api"
FRONTEND="$RAIZ/Frontend"
LOGS="$RAIZ/.dev-logs"

CONTENEDOR="mysql-cartagena"
DB_HOST_LOCAL="127.0.0.1"
DB_PORT_LOCAL="3307"
LOGIN_PORT="3000"
API_PORT="5000"
VITE_PORT="5173"

mkdir -p "$LOGS"

azul()  { printf '\033[1;34m%s\033[0m\n' "$*"; }
verde() { printf '\033[1;32m%s\033[0m\n' "$*"; }
rojo()  { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }
amar()  { printf '\033[1;33m%s\033[0m\n' "$*"; }

morir() { rojo "ERROR: $*"; exit 1; }

comando() { command -v "$1" >/dev/null 2>&1 || morir "Falta el comando '$1'."; }

puerto_libre() {
  local puerto="$1"
  if ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]${puerto}$"; then
    return 1
  fi
  return 0
}

exigir_puerto() {
  local puerto="$1" servicio="$2"
  if ! puerto_libre "$puerto"; then
    rojo "El puerto $puerto ya está ocupado ($servicio)."
    rojo "Detén el proceso anterior con:  ./stop-dev.sh"
    ss -ltnp 2>/dev/null | grep -E "[:.]${puerto}\b" || true
    exit 1
  fi
}

# Carga .env del backend (JWT_SECRET, DB_*, etc.)
if [[ ! -f "$BACKEND/.env" ]]; then
  morir "No existe $BACKEND/.env. Copia .env.example y completa los valores."
fi
set -a
# shellcheck disable=SC1091
source "$BACKEND/.env"
set +a

DB_USER="${DB_USER:-usuario_app}"
DB_PASSWORD="${DB_PASSWORD:-app123}"
DB_NAME="${DB_NAME:-tienda_online}"

comando docker
comando node
comando npm
comando dotnet
comando curl

PIDS=()
limpiar() {
  local codigo=$?
  trap - EXIT INT TERM
  echo
  amar "Deteniendo servicios..."
  for pid in "${PIDS[@]:-}"; do
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  for pid in "${PIDS[@]:-}"; do
    if [[ -n "${pid:-}" ]]; then wait "$pid" 2>/dev/null || true; fi
  done
  # La API puede dejar el proceso hijo de dotnet escuchando.
  pkill -f "Cartagena.Api.dll" 2>/dev/null || true
  rm -f "$LOGS/pids"
  verde "Servicios detenidos. (MySQL sigue encendido: docker stop $CONTENEDOR)"
  exit "$codigo"
}
trap limpiar EXIT INT TERM

# ---------------------------------------------------------------------------
# 1. Base de datos
# ---------------------------------------------------------------------------
azul "[1/5] Base de datos MySQL"

if ! docker inspect "$CONTENEDOR" >/dev/null 2>&1; then
  morir "No existe el contenedor '$CONTENEDOR'. Restáuralo desde el respaldo:
  docker run -d --name $CONTENEDOR -p 127.0.0.1:$DB_PORT_LOCAL:3306 \\
    -e MYSQL_ROOT_PASSWORD=root123 -e MYSQL_DATABASE=$DB_NAME \\
    -e MYSQL_USER=$DB_USER -e MYSQL_PASSWORD=$DB_PASSWORD mysql:8.0"
fi

if [[ "$(docker inspect -f '{{.State.Running}}' "$CONTENEDOR")" != "true" ]]; then
  echo "  Iniciando contenedor $CONTENEDOR..."
  docker start "$CONTENEDOR" >/dev/null
fi

# Que no se vuelva a apagar al reiniciar la PC.
docker update --restart unless-stopped "$CONTENEDOR" >/dev/null 2>&1 || true

echo -n "  Esperando MySQL en $DB_HOST_LOCAL:$DB_PORT_LOCAL "
for _ in $(seq 1 60); do
  if (exec 3<>"/dev/tcp/$DB_HOST_LOCAL/$DB_PORT_LOCAL") 2>/dev/null; then
    echo " OK"
    break
  fi
  echo -n "."
  sleep 1
done

if ! (exec 3<>"/dev/tcp/$DB_HOST_LOCAL/$DB_PORT_LOCAL") 2>/dev/null; then
  morir "MySQL no respondió en $DB_HOST_LOCAL:$DB_PORT_LOCAL. Revisa: docker logs $CONTENEDOR"
fi

# ---------------------------------------------------------------------------
# 2. Dependencias y esquema
# ---------------------------------------------------------------------------
azul "[2/5] Dependencias y esquema"

if [[ ! -d "$LOGIN_DIR/node_modules" ]]; then
  echo "  Instalando dependencias del login..."
  (cd "$LOGIN_DIR" && npm ci --silent)
fi
if [[ ! -d "$FRONTEND/node_modules" ]]; then
  echo "  Instalando dependencias del frontend..."
  (cd "$FRONTEND" && npm ci --silent)
fi

echo "  Aplicando esquema (rol, usuario, token_cuenta)..."
(cd "$LOGIN_DIR" && DB_HOST="$DB_HOST_LOCAL" DB_PORT="$DB_PORT_LOCAL" npm run --silent db:schema)

echo "  Asegurando usuarios demo (admin / vendedor / cliente)..."
(cd "$LOGIN_DIR" && DB_HOST="$DB_HOST_LOCAL" DB_PORT="$DB_PORT_LOCAL" npm run --silent db:demo)

# ---------------------------------------------------------------------------
# 3. Puertos y build
# ---------------------------------------------------------------------------
azul "[3/5] Comprobando puertos y compilando API"
exigir_puerto "$LOGIN_PORT" "login Node"
exigir_puerto "$API_PORT" "API C#"
exigir_puerto "$VITE_PORT" "Vite"

echo "  Compilando Cartagena.Api..."
if ! dotnet build "$API_CSPROJ" -c Debug --nologo -v quiet >"$LOGS/build.log" 2>&1; then
  rojo "Falló la compilación. Últimas líneas:"
  tail -n 30 "$LOGS/build.log" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 4. Arranque
# ---------------------------------------------------------------------------
azul "[4/5] Arrancando servicios"

(cd "$LOGIN_DIR" && exec env \
  NODE_ENV=development PORT="$LOGIN_PORT" API_PREFIX=/api/v1 \
  DB_HOST="$DB_HOST_LOCAL" DB_PORT="$DB_PORT_LOCAL" \
  DB_NAME="$DB_NAME" DB_USER="$DB_USER" DB_PASSWORD="$DB_PASSWORD" \
  node src/server.js) >"$LOGS/login.log" 2>&1 &
PIDS+=("$!")

(cd "$API_DIR" && exec env \
  DB_HOST="$DB_HOST_LOCAL" DB_PORT="$DB_PORT_LOCAL" DB_NAME="$DB_NAME" \
  DB_USER="$DB_USER" DB_PASSWORD="$DB_PASSWORD" \
  JWT_SECRET="$JWT_SECRET" JWT_ISSUER="${JWT_ISSUER:-microservicio-login}" \
  CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:5173}" \
  ASPNETCORE_ENVIRONMENT=Development \
  ASPNETCORE_URLS="http://localhost:$API_PORT" \
  dotnet "$API_DIR/bin/Debug/net10.0/Cartagena.Api.dll") >"$LOGS/api.log" 2>&1 &
PIDS+=("$!")

(cd "$FRONTEND" && exec env \
  VITE_AUTH_PROXY_TARGET="http://localhost:$LOGIN_PORT" \
  VITE_API_PROXY_TARGET="http://localhost:$API_PORT" \
  npm run dev -- --host 127.0.0.1) >"$LOGS/vite.log" 2>&1 &
PIDS+=("$!")

printf '%s\n' "${PIDS[@]}" > "$LOGS/pids"

esperar() {
  local url="$1" nombre="$2" log="$3" pid="$4"
  echo -n "  Esperando $nombre "
  for _ in $(seq 1 90); do
    if curl -fsS -m 2 "$url" >/dev/null 2>&1; then
      echo " OK"
      return 0
    fi
    # Si el proceso murió, no seguir esperando.
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    echo -n "."
    sleep 1
  done
  echo
  rojo "No respondió $nombre. Últimas líneas de $log:"
  tail -n 25 "$log" >&2
  return 1
}

esperar "http://localhost:$LOGIN_PORT/api/v1/salud" "login" "$LOGS/login.log" "${PIDS[0]}" || exit 1
esperar "http://localhost:$API_PORT/api/core/health" "API C#" "$LOGS/api.log" "${PIDS[1]}" || exit 1
esperar "http://localhost:$VITE_PORT/" "Vite" "$LOGS/vite.log" "${PIDS[2]}" || exit 1

# ---------------------------------------------------------------------------
# 5. Resumen
# ---------------------------------------------------------------------------
azul "[5/5] Listo"
echo
verde "  Frontend:  http://localhost:$VITE_PORT"
echo  "  Login:     http://localhost:$LOGIN_PORT/api/v1"
echo  "  API C#:    http://localhost:$API_PORT/api"
echo  "  Swagger:   http://localhost:$API_PORT/scalar/v1"
echo  "  MySQL:     $DB_HOST_LOCAL:$DB_PORT_LOCAL  (DB: $DB_NAME, usuario: $DB_USER)"
echo
amar "  Usuarios demo (contraseña: ${USUARIOS_DEMO_PASSWORD:-ClaveDemo123})"
echo  "    admin     / ADMIN"
echo  "    vendedor  / VENDEDOR"
echo  "    cliente   / CLIENTE"
echo
echo  "  Logs: $LOGS"
echo  "  Ctrl+C para detener.  ./stop-dev.sh si quedó algo colgado."
echo

while kill -0 "${PIDS[0]}" 2>/dev/null && kill -0 "${PIDS[1]}" 2>/dev/null && kill -0 "${PIDS[2]}" 2>/dev/null; do
  sleep 2
done

rojo "Algún servicio se detuvo. Revisa los logs en $LOGS"
exit 1
