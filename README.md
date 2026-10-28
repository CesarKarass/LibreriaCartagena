# Librería Cartagena

Sistema de tienda en línea: catálogo, autenticación, ventas, inventario y logística.

| Componente | Tecnología | Carpeta |
|---|---|---|
| Frontend | React + Vite | `Frontend/` |
| Login / JWT | Node.js + Express | `Backend/Cartagena/servicios/microservicio-login/` |
| API principal | ASP.NET Core 10 | `Backend/Cartagena/backend/Cartagena.Api/` |
| Servicios auxiliares | Flask / Node | `Backend/Cartagena/servicios/` |
| Base de datos | MySQL 8 | contenedor `mysql-cartagena` (puerto **3307**) |
| Gateway | Nginx | `Backend/Cartagena/gateway/` |

El frontend **nunca** se conecta a MySQL. Habla por HTTP con el login
(`/api/v1/*`) y con la API C# (`/api/*`).

---

## Arranque rápido (desarrollo nativo)

Requisitos: Docker, Node 20+, .NET SDK 10, `curl`.

```bash
./start-dev.sh
```

El script:

1. enciende `mysql-cartagena` (127.0.0.1:**3307**) y lo deja con `restart unless-stopped`;
2. instala dependencias si faltan y aplica el esquema (`rol`, `usuario`, `token_cuenta`);
3. crea/actualiza los usuarios demo;
4. compila y arranca login, API C# y Vite.

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Login | http://localhost:3000/api/v1 |
| API C# | http://localhost:5000/api |
| Scalar (OpenAPI) | http://localhost:5000/scalar/v1 |
| MySQL | 127.0.0.1:3307 / `tienda_online` |

Usuarios demo (contraseña `ClaveDemo123`):

| Usuario | Rol |
|---|---|
| `admin` | ADMIN |
| `vendedor` | VENDEDOR |
| `cliente` | CLIENTE |
| `inactivo` | CLIENTE deshabilitado (sirve para probar el 403) |

`Ctrl+C` detiene todo. Si algo queda colgado: `./stop-dev.sh`.
Los logs están en `.dev-logs/`.

## Arranque con Docker

```bash
./start-docker.sh          # construye y levanta el stack + Vite
./start-docker.sh --down   # apaga los contenedores
```

El script crea la red `libreria-network`, conecta el MySQL existente con el
alias `mysql` y apunta Vite al gateway (8081). Servicios:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Gateway | http://localhost:8081 |
| API C# directa | http://localhost:8083 |
| Login directo | http://localhost:3000 |

## Base de datos (DBeaver)

| Campo | Valor |
|---|---|
| Host | `127.0.0.1` |
| Puerto | `3307` |
| Base | `tienda_online` |
| Usuario | `usuario_app` |
| Contraseña | `app123` |

Si el puerto 3307 no responde es que el contenedor está apagado:

```bash
docker start mysql-cartagena
docker update --restart unless-stopped mysql-cartagena
```

No uses el MySQL del sistema en 3306: es otra instancia.

### Restaurar el respaldo

```bash
docker exec -i mysql-cartagena mysql -uroot -proot123 tienda_online \
  < Backend/Cartagena/backups/tienda_online.sql
```

## Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| DBeaver: conexión rechazada en 3307 | `docker start mysql-cartagena` |
| Login responde 503 | MySQL apagado o credenciales de `.env` incorrectas |
| Login responde 401 con un usuario válido | falta la tabla o el usuario; corre `npm run db:schema && npm run db:demo` |
| `npm run db:usuarios`: "Rol no configurado" | aplica primero `npm run db:schema` |
| Vite: `ECONNREFUSED` en `/api` | los backends no están arriba o el puerto no coincide |
| "El puerto 3000/5000/5173 ya está ocupado" | `./stop-dev.sh` |
| `network libreria-network ... not found` | usa `./start-docker.sh` (la crea) |

## Notas de configuración

- `Backend/Cartagena/.env` aplica a la ejecución **nativa** (`DB_HOST=localhost`, `DB_PORT=3307`).
- En Docker, `docker-compose.yml` fuerza `DB_HOST=mysql` y `DB_PORT=3306` dentro de la red.
- `JWT_SECRET` y `JWT_ISSUER` deben ser idénticos en el login Node y en la API C#; por eso ambos leen el mismo `.env`.
- El esquema de autenticación vive en `servicios/microservicio-login/database/esquema.sql` y usa las tablas reales `rol`, `usuario` y `token_cuenta` de `tienda_online`.
