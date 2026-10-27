# Módulo de autenticación, registro y roles

## Rutas

| Ruta | Acceso | Pantalla |
| --- | --- | --- |
| `/login` | Público | Login con usuario o correo |
| `/registro` | Público | Alta de cliente con reCAPTCHA |
| `/recuperar-password` | Público | Solicitud de token por correo |
| `/restablecer-password` | Público | Token + nueva contraseña |
| `/cuenta` | Autenticado | Datos de la cuenta y rol |
| `/admin` | Solo `ADMIN` | Panel protegido por rol |

Las rutas protegidas usan `src/routes/RequireAuth.tsx`. Si no hay sesión, redirigen a
`/login` guardando la ruta de origen para volver después de autenticarse.

## Endpoints consumidos

| Operación | Método y ruta | Servicio |
| --- | --- | --- |
| Login | `POST /api/v1/auth/login` | Microservicio login (Node) |
| Registro | `POST /api/v1/auth/registro` | Microservicio login (Node) |
| Verificar sesión | `GET /api/v1/auth/verificar` | Microservicio login (Node) |
| Panel admin | `GET /api/v1/auth/admin/panel` | Microservicio login (Node) |
| Solicitar recuperación | `POST /api/cuenta/recuperacion/solicitar` | API principal (C#) |
| Restablecer contraseña | `POST /api/cuenta/recuperacion/restablecer` | API principal (C#) |

En desarrollo, Vite hace proxy de `/api/v1` al puerto `3000` y de `/api` al puerto `5000`, de
modo que no hay problemas de CORS. Los destinos se cambian con `VITE_AUTH_PROXY_TARGET` y
`VITE_API_PROXY_TARGET`.

## Variables de entorno

Ver `Frontend/.env.example`. Las importantes son:

- `VITE_API_URL=/api` y `VITE_AUTH_API_URL=/api/v1`: rutas relativas consumidas por la app.
- `VITE_API_PROXY_TARGET` y `VITE_AUTH_PROXY_TARGET`: destinos del proxy de Vite.
- `VITE_RECAPTCHA_SITE_KEY`: site key de reCAPTCHA v2. El repositorio usa la clave pública de
  prueba de Google; hay que reemplazarla en producción.

`VITE_USE_MOCKS` solo afecta al catálogo de libros, no a la autenticación.

## Sesión y roles

- La sesión se guarda en `localStorage` bajo `cartagena.sesion.v1`.
- Al cargar la app se valida el token con `/auth/verificar`.
- El JWT vence a los 15 minutos; la app cierra la sesión automáticamente.
- Roles soportados: `ADMIN`, `VENDEDOR` y `CLIENTE`.
- El registro siempre crea usuarios `CLIENTE`.
- `ADMIN` puede entrar a `/admin`; el backend vuelve a validar el rol en
  `/auth/admin/panel`, no solo el guard del frontend.

## reCAPTCHA

El widget se renderiza con `src/components/auth/Recaptcha.tsx` en el formulario de registro y su
token se envía como `captchaToken` al endpoint de registro. El backend solo lo verifica cuando
`RECAPTCHA_ENABLED=true` y `RECAPTCHA_SECRET` está configurado.

Para probar con las claves de prueba de Google:

```env
# Frontend
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Backend
RECAPTCHA_ENABLED=true
RECAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

## Comprobaciones

```bash
cd Frontend
npx tsc --noEmit
npm run build
```
