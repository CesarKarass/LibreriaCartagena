#!/usr/bin/env bash
# =============================================================================
# Librería Cartagena - arranque de desarrollo SIN Docker
#
#   MariaDB local del proyecto  -> 127.0.0.1:3307
#   Login Node                  -> http://localhost:3000
#   Frontend Vite               -> http://localhost:5173
#
# Uso:   ./start-local.sh        (Ctrl+C detiene todo)
#
# Sustituye a ./start-dev.sh en equipos sin Docker. La base de datos vive en
# ~/.local/share/cartagena-mysql y no toca la MariaDB del sistema.
# =============================================================================
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$RAIZ/Backend/Cartagena"
LOGIN_DIR="$BACKEND/servicios/microservicio-login"
FRONTEND="$RAIZ/Frontend"
LOGS="$RAIZ/.dev-logs"

DB_BASE="$HOME/.local/share/cartagena-mysql"
DB_PORT_LOCAL="3307"
LOGIN_PORT="3000"
VITE_PORT="5173"

mkdir -p "$LOGS"

azul()  { printf '\033[1;34m%s\033[0m\n' "$*"; }
verde() { printf '\033[1;32m%s\033[0m\n' "$*"; }
rojo()  { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }
amar()  { printf '\033[1;33m%s\033[0m\n' "$*"; }

morir() { rojo "ERROR: $*"; exit 1; }

comando() { command -v "$1" >/dev/null 2>&1 || morir "Falta el comando '$1'."; }

ocupado() { ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]$1$"; }

comando mariadbd
comando mariadb-install-db
comando node
comando npm
comando curl

PIDS=()

limpiar() {
  local codigo=$?
  trap - EXIT INT TERM
  echo
  amar "Deteniendo login y frontend (la base de datos sigue encendida)..."
  for pid in "${PIDS[@]:-}"; do
    [[ -n "${pid:-}" ]] && kill "$pid" 2>/dev/null || true
  done
  for pid in "${PIDS[@]:-}"; do
    [[ -n "${pid:-}" ]] && wait "$pid" 2>/dev/null || true
  done
  rm -f "$LOGS/pids"
  verde "Servicios detenidos. Para apagar también la base: ./stop-local.sh"
  exit "$codigo"
}
trap limpiar EXIT INT TERM

# ---------------------------------------------------------------------------
# 1. Base de datos
# ---------------------------------------------------------------------------
azul "[1/4] MariaDB local"

if [[ ! -d "$DB_BASE/data/mysql" ]]; then
  echo "  Inicializando datadir en $DB_BASE/data ..."
  mkdir -p "$DB_BASE"
  mariadb-install-db --datadir="$DB_BASE/data" \
    --auth-root-authentication-method=normal \
    --skip-test-db --user="$(id -un)" >/dev/null
fi

if ! ocupado "$DB_PORT_LOCAL"; then
  echo "  Arrancando MariaDB en 127.0.0.1:$DB_PORT_LOCAL ..."
  nohup /usr/sbin/mariadbd \
    --datadir="$DB_BASE/data" \
    --port="$DB_PORT_LOCAL" \
    --bind-address=127.0.0.1 \
    --socket="$DB_BASE/mysql.sock" \
    --pid-file="$DB_BASE/mysqld.pid" \
    --log-error="$DB_BASE/error.log" \
    >/dev/null 2>&1 &
  for _ in $(seq 1 30); do
    ocupado "$DB_PORT_LOCAL" && break
    sleep 1
  done
fi

ocupado "$DB_PORT_LOCAL" || morir "MariaDB no respondió en el puerto $DB_PORT_LOCAL. Revisa $DB_BASE/error.log"
verde "  MariaDB lista en 127.0.0.1:$DB_PORT_LOCAL"

# ---------------------------------------------------------------------------
# 2. Dependencias, esquema y usuarios demo
# ---------------------------------------------------------------------------
azul "[2/4] Esquema y usuarios demo"

[[ -f "$LOGIN_DIR/.env" ]] || morir "No existe $LOGIN_DIR/.env. Copia .env.example y ajusta DB_*."

[[ -d "$LOGIN_DIR/node_modules" ]] || (cd "$LOGIN_DIR" && npm ci --silent)
[[ -d "$FRONTEND/node_modules" ]] || (cd "$FRONTEND" && npm ci --silent)

(cd "$LOGIN_DIR" && npm run --silent db:usuario-app)
(cd "$LOGIN_DIR" && npm run --silent db:schema)
(cd "$LOGIN_DIR" && npm run --silent db:usuarios)

# ---------------------------------------------------------------------------
# 3. Arranque de servicios
# ---------------------------------------------------------------------------
azul "[3/4] Arrancando servicios"

ocupado "$LOGIN_PORT" && morir "El puerto $LOGIN_PORT ya está ocupado. Usa ./stop-local.sh"
ocupado "$VITE_PORT" && morir "El puerto $VITE_PORT ya está ocupado. Usa ./stop-local.sh"

(cd "$LOGIN_DIR" && exec node src/server.js) >"$LOGS/login.log" 2>&1 &
PIDS+=("$!")

(cd "$FRONTEND" && exec npm run dev -- --host 0.0.0.0) >"$LOGS/vite.log" 2>&1 &
PIDS+=("$!")

printf '%s\n' "${PIDS[@]}" > "$LOGS/pids"

esperar() {
  local url="$1" nombre="$2" log="$3" pid="$4"
  printf '  Esperando %s ' "$nombre"
  for _ in $(seq 1 60); do
    if curl -fsS -m 2 "$url" >/dev/null 2>&1; then
      echo "OK"
      return 0
    fi
    kill -0 "$pid" 2>/dev/null || break
    printf '.'
    sleep 1
  done
  echo
  rojo "No respondió $nombre. Últimas líneas de $log:"
  tail -n 25 "$log" >&2
  return 1
}

esperar "http://localhost:$LOGIN_PORT/api/v1/salud" "login" "$LOGS/login.log" "${PIDS[0]}" || exit 1
esperar "http://localhost:$VITE_PORT/" "Vite" "$LOGS/vite.log" "${PIDS[1]}" || exit 1

# ---------------------------------------------------------------------------
# 4. Resumen
# ---------------------------------------------------------------------------
azul "[4/4] Listo"
echo
verde "  Frontend:  http://localhost:$VITE_PORT"
echo  "  Login:     http://localhost:$LOGIN_PORT/api/v1"
echo  "  MySQL:     127.0.0.1:$DB_PORT_LOCAL  (DB: tienda_online)"
echo
amar "  Usuarios demo (contraseña: ClaveDemo123)"
echo  "    admin     / ADMIN"
echo  "    vendedor  / VENDEDOR"
echo  "    cliente   / CLIENTE"
echo
echo  "  Logs: $LOGS"
echo  "  Ctrl+C para detener."
echo

while kill -0 "${PIDS[0]}" 2>/dev/null && kill -0 "${PIDS[1]}" 2>/dev/null; do
  sleep 2
done

rojo "Algún servicio se detuvo. Revisa los logs en $LOGS"
exit 1
