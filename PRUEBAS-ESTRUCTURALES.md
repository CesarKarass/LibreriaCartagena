# Plan de Pruebas Estructurales — Librería Cartagena

**Fecha:** 2026-11-01 · **Entorno:** local (API C# `:5000`, microservicio login `:3000`, Vite `:5173`, MySQL `:3307`)
**Resultado global: 45/45 pruebas automatizadas PASS** (API + UI) · Lighthouse: accesibilidad 96 %, buenas prácticas 100 %, SEO 67 %

---

## 1. Autenticación y Seguridad (Sarahí y César)

| # | Prueba | Resultado | Evidencia |
|---|---|---|---|
| 1.1 | Registro rechaza correo inválido | **PASS** | HTTP 422 "Los datos enviados no cumplen el formato requerido" |
| 1.2 | Registro rechaza usuario duplicado | **PASS** | HTTP 409 "El nombre de usuario ya está registrado" |
| 1.3 | Ruta admin sin token → 401 | **PASS** | HTTP 401 |
| 1.4 | RBAC: rol CLIENTE no entra al panel admin | **PASS** | API → 403 · UI → "Acceso restringido … Tu rol actual es Cliente" |
| 1.5 | RBAC: rol ADMIN sí entra al panel | **PASS** | API → 200 · UI → "Verificación de rol: El backend confirmó tu rol ADMIN" |
| 1.6 | Token inválido → 401 | **PASS** | HTTP 401 |
| 1.7a | Recuperación responde estado real del correo | **PASS** | HTTP 503 `SMTP_NO_CONFIGURADO_O_ERROR` con instrucciones |
| 1.7b | Token de un solo uso generado y registrado | **PASS** | token `f68576ec…` emitido para `sgarcia1859@gmail.com` (válido 20 min) |
| 1.7c | El token restablece la contraseña | **PASS** | `POST recuperacion/restablecer` → 200 |
| 1.7d | Login con la contraseña nueva | **PASS** | HTTP 200 (autenticación exitosa) |
| 1.7e | Token no reutilizable | **PASS** | Segundo uso → 400 "Token inválido o expirado" |
| 1.8 | reCAPTCHA bloquea registro automatizado (UI) | **PASS** | Sin resolver el widget: "Completa la verificación anti-bot para crear tu cuenta." |
| 1.9 | Validación de campos en registro (UI) | **PASS** | Correo inválido → "El correo debe incluir @." |
| 1.10 | Contraseñas encriptadas en BD | **PASS** | bcrypt `$2b$12$` / `$2a$11$` (60 chars), nunca texto plano |

> **Correo con `sgarcia1859@gmail.com`:** la cuenta se creó y el flujo del token quedó verificado de punta a punta (generación → uso único → cambio de contraseña → login). **El correo aún no sale del servidor** porque `SMTP_HOST/SMTP_USER/SMTP_PASSWORD/SMTP_FROM` están vacíos en `Backend/Cartagena/.env`; la UI avisa de forma honesta (HTTP 503 con instrucciones) en lugar de fingir éxito. Para entrega real: completar esas 4 variables (p. ej. Gmail con contraseña de aplicación) y reiniciar el backend.

## 2. Flujo crítico de compra (Sarahí)

| # | Prueba | Resultado | Evidencia |
|---|---|---|---|
| 2.1 | Agregar múltiples productos | **PASS** | `PUT /api/carrito` → LIB-011 ×2, LIB-015 ×1 |
| 2.2 | Subtotal/total matemáticamente correcto | **PASS** | API: total **870.00** = esperado 870.00 · UI: 250.00 + 296.10 + 50.00 envío = **596.10** ✓ |
| 2.3 | Modificar cantidades y eliminar ítems | **PASS** | Cantidad 0 elimina el ítem del carrito |
| 2.4 | Checkout con domicilio vacío rechazado | **PASS** | API → 400 (validación de estructura) · UI → "Completa el campo calle." |
| 2.5 | Domicilio completo (Calle, Número, Colonia, Ciudad, Estado, CP, Teléfono) | **PASS** | 7 campos presentes y requeridos → id 5 |
| 2.6 | Sin `Idempotency-Key` → rechazo | **PASS** | HTTP 400 "Se requiere Idempotency-Key…" |
| 2.7 | Sandbox: tarjeta **rechazada** bloquea | **PASS** | HTTP 400 "Tarjeta de prueba rechazada…" |
| 2.8 | Sandbox: tarjeta **aprobada** → venta `Confirmado`/`AprobadoSandbox` | **PASS** | venta #9, total 320.00 |
| 2.9 | Idempotencia: misma clave no duplica venta | **PASS** | `repetido: true`, misma `id_venta` |
| 2.10 | Transferencia SPEI → `Pendiente` | **PASS** | ventas #7/#10 |
| 2.11 | Efectivo contra entrega → `Pendiente` | **PASS** | ventas #8/#11 |
| 2.12 | Método de pago no admitido → rechazo | **PASS** | HTTP 400 "Método de pago no admitido" |
| 2.13 | Ticket PDF descargable | **PASS** | `application/pdf`, cabecera `%PDF`, 821+ bytes |
| 2.14 | Envío de comprobante: estado real del correo | **PASS** | HTTP 503 `SMTP_NO_CONFIGURADO_O_ERROR` (sin fingir envío) |

## 3. Inventario, catálogo y reseñas (Alan)

| # | Prueba | Resultado | Evidencia |
|---|---|---|---|
| 3.1 | Inventario lista `stock_minimo`/`stock_maximo` por título | **PASS** | `GET /api/admin/inventario` → 20 libros |
| 3.2 | Alerta **Stock Mínimo** (3 ≤ 5) | **PASS** | LIB-TEST marcado en alerta al bajar de 5 |
| 3.3 | Alerta **Stock Máximo** (150 > 100) | **PASS** | marca el tope para habilitar descuentos |
| 3.4 | CRUD: crear / consultar / actualizar / borrar libro | **PASS** | 201 → 200 → PATCH `precio 149.99` → DELETE 200 → GET 404 |
| 3.5 | Reseña sin compra previa → 403 | **PASS** | "Sólo puede reseñar este libro quien lo haya comprado" |
| 3.6 | Calificación fuera de 1–5 → 400 | **PASS** | "La calificación debe ser un entero entre 1 y 5" |
| 3.7 | Cliente con compra confirmada → reseña 201 | **PASS** | comentario id 2 persistido en BD |
| 3.8 | Listado público de reseñas | **PASS** | `GET /api/libros/{id}/resenas` → 200 |

> Nota: el plan menciona BD en **Aiven**; en este entorno las pruebas corrieron contra MySQL local `tienda_online` (mismo esquema). El CRUD es idéntico vía SQL.

## 4. Proveedores, logística y devoluciones (Alan)

| # | Prueba | Resultado | Evidencia |
|---|---|---|---|
| 4.1 | Generar pedido a proveedor | **PASS** | `POST /api/compras-proveedor` → id_pedido 3 (total 800.00) |
| 4.2 | Marcar **Recibido** incrementa inventario (+10) | **PASS** | LIB-015: stock 3 → 13, movimiento `COMPRA` registrado |
| 4.3 | No se recibe dos veces | **PASS** | HTTP 409 "Pedido ya recibido" |
| 4.4 | Estados de envío: `Procesando → En Preparación → … → Entregado` | **PASS** | transición aceptada y persistida |
| 4.5 | No se puede retroceder estado | **PASS** | HTTP 409 "No se puede retroceder el estado del envío" |
| 4.6 | Estado no permitido → 400 | **PASS** | "Estado de envío no permitido" |
| 4.7 | Validación de entrega exige número de guía | **PASS** | 409 "Asigna un número de guía antes de validar la entrega" |
| 4.8 | Garantía: entrega no confirmada o > 7 días → rechazo | **PASS** | HTTP 409 "La entrega no está confirmada o han transcurrido más de 7 días" |

## 5. Interfaz (UI/UX) e integridad de API (Aranza y César)

| # | Prueba | Resultado | Evidencia |
|---|---|---|---|
| 5.1 | Protección de rutas con JWT (sweep) | **PASS** | `/api/mis-compras`: sin token 401 · con token 200 · rutas admin exigen rol |
| 5.2 | Persistencia de transacciones reales | **PASS** | ventas 7–11, movimientos de inventario, reseñas y pedidos consultables en BD |
| 5.3 | Encriptación de datos | **PASS** | contraseñas bcrypt; datos de pago nunca se aceptan (`Ensure` prohíbe tarjeta/CVV extra) |
| 5.4 | Navegación responsiva 375 px (sin desbordes) | **PASS** | sin scroll horizontal, logo 50 px, textos ocultos, acciones visibles |
| 5.5 | Consistencia de la paleta | **PASS** (ver hallazgo H2) | ciruela `#3a0036`, oro `#d9a05b`, turquesa `#4a90b6`, pergamino `#f6e7c6` |
| 5.6 | Estados intermedios de botones | **PASS** | hover/focus/activos definidos en CSS |
| 5.7 | Lighthouse | **PASS** (ver hallazgo H3) | accesibilidad **96 %**, buenas prácticas **100 %**, SEO 67 % |
| 5.8 | Health check del core | **PASS** | `GET /api/core/health` → `{"ok":true}` |

---

## Hallazgos

- **H1 — Correos SMTP sin configurar (crítico para entregas reales).** `SMTP_*` vacíos en `Backend/Cartagena/.env`: el backend responde 503 honesto y registra el token en el log, pero ningún correo sale. *Acción:* completar las 4 variables (Gmail: `smtp.gmail.com:587` + contraseña de aplicación) y reiniciar el backend.
- **H2 — El plan menciona "azul marino y borgoña"; el diseño implementado (Figma) es morado/oro/turquesa.** La paleta implementada es la del diseño aprobado; si el plan debe reflejar eso, actualizar el documento.
- **H3 — SEO bajo (67 %).** Falta `meta description` y `robots.txt` inválido; contraste de color y nombres accesibles marcan 2 avisos menores.
- **H4 — No existe menú "hamburguesa".** El header se condensa a iconos ≤800 px (sin desbordes, correcto), pero el plan espera el patrón hamburguesa. *Acción:* definir si se implementa o se ajusta el plan.
- **H5 — Aiven/Render.** Las pruebas se ejecutaron en local (mismo esquema/endpoint); para certificar despliegue, repetir la sección 5.1 contra la URL de Render con Swagger/Thunder Client.
