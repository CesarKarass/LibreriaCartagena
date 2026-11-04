# Hoja 1 de 2 · Cómo funciona Librería Cartagena

**Cartagena Bookstore** es una tienda en línea de libros: catálogo, compras,
cuentas de usuario y panel de administración. Todo se usa desde el navegador.

| Dónde entrar | Dirección |
|---|---|
| Sitio en producción | https://libreria-carta-agena.web.app |
| Dirección alternativa | https://libreria-carta-agena.firebaseapp.com |
| Soporte por correo | libreriacartaagena302987@gmail.com |

> Funciona en cualquier navegador (Chrome, Firefox, Edge, Safari), se adapta a
> teléfono, tablet y computadora y **no requiere instalar nada**.

## 1. Crear una cuenta

1. Entra al sitio y pulsa **«Regístrate aquí»** debajo del formulario de acceso.
2. Completa los datos: nombre completo, usuario, correo, teléfono y contraseña.
3. Marca **«No soy un robot»** (si no: *«Completa la verificación anti-bot para
   entrar»*) y pulsa **«Crear mi cuenta»**. Si el usuario ya existe, se avisa
   al escribirlo.

| Rol | Qué puede hacer |
|---|---|
| **CLIENTE** | Comprar, ver su carrito, sus pedidos y su perfil. |
| **ADMIN** | Todo lo anterior **más** el panel de administración completo. |
| **VENDEDOR** | Acceso de cliente: **no tiene panel de administración**. |
| **REPARTIDOR** | Acceso de cliente; el reparto se asigna desde el panel. |

## 2. Iniciar sesión

1. Escribe tu **correo o nombre de usuario** y tu **contraseña** (botón
   **MOSTRAR** para verla) · marca **«No soy un robot»** · pulsa
   **«Entrar a la Madriguera»**. El sitio te devuelve a la página que
   intentabas abrir.

> ⏱ La sesión dura **15 minutos** por seguridad; al expirar pide volver a entrar.

## 3. ¿Olvidaste tu contraseña?

1. En el acceso pulsa **«¿Olvidaste tu contraseña?»**, escribe tu **correo o
   nombre de usuario** y pulsa **«Enviar Enlace de Recuperación»**.
2. Revisa tu bandeja (y **spam**): llega un correo con un **token de un solo
   uso** válido por **20 minutos**.
3. Pega el token, escribe tu **nueva contraseña** y entra con ella.

> 📬 El token va al **correo registrado en tu cuenta**. Las cuentas de ejemplo
> (`admin`, `cliente`, `vendedor`) tienen correos de prueba: usa una cuenta con
> correo real para probarlo. Si aparece *«El servicio de correo no está
> configurado…»*, escribe a **libreriacartaagena302987@gmail.com** y te la
> restablecemos manualmente.

## 4. Comprar un libro

1. **Buscar:** barra del encabezado (título, autor o ISBN) o recorre el
   catálogo; los filtros afinan por **categoría**, **género** y **formato**.
2. **Ver detalle:** pulsa un libro para ver descripción, precio, stock, reseñas
   y el botón de agregar.
3. **Carrito:** «Agregar al Carrito» actualiza el contador; ahí cambias
   cantidades con **−** / **+**, quitas líneas con **«Quitar»** y ves el
   **Resumen del Pedido** (subtotal, envío, descuentos y total).
4. **Entrega, pago y comprobante:** eliges o registras tu domicilio, confirmas
   el método de pago y finalizas; el **ticket en PDF** queda en
   **Mi cuenta → Mis compras**.

---

# Hoja 2 de 2 · Tu cuenta, el panel y ayuda

## 5. Mi cuenta

Entra a **«Mi Cuenta»** (esquina superior derecha):

| Sección | Qué encuentras |
|---|---|
| **Perfil** | Tus datos, tu correo y tu **selector de personaje** (avatar). |
| **Mis compras** | Historial, estado y descarga del ticket en PDF. |
| **Mis pedidos** | Seguimiento de tus pedidos y envíos. |
| **Cambiar contraseña** | Pide la contraseña actual y la nueva. |
| **Cerrar sesión** | Cierra la sesión en este dispositivo. |

> La sección **«Preferencias» ya no existe**: todo pasó a **Perfil** y a
> **Cambiar contraseña**.

**Configuración** (ruta `/configuracion`) reúne **Datos personales** (nombre,
usuario no editable, correo y teléfono → «Guardar cambios») y **Seguridad**
(contraseña actual, nueva y confirmación: mínimo **8 caracteres, una mayúscula,
un número y un carácter especial**).

## 6. Panel de administración (solo rol ADMIN)

Con una cuenta **ADMIN** aparece **«Panel de administración»** con el sello
**ADMIN**; primero confirma tu rol con el backend y luego muestra los módulos:

| Módulo | Qué puedes hacer ahí |
|---|---|
| **Usuarios y roles** | Dar de alta usuarios, asignar roles y deshabilitar cuentas. |
| **Catálogo e inventario** | Libros, precios, descuentos y alertas de stock. |
| **Pedidos y ventas** | Seguimiento de compras, pagos y estados de venta. |
| **Logística y entregas** | Estados de envío, guías y validación de entregas. |
| **Proveedores y compras** | Proveedores, órdenes, mermas, devoluciones y reportes. |
| **Reportes** | Indicadores de ventas y reporte de inventario en PDF. |

**Proveedores:** *Panel → Proveedores y compras* → **«+ Nuevo proveedor»** →
solo el **Nombre** es obligatorio → **«Registrar proveedor»**. **«Editar»**
cambia y **«Eliminar»** quita (solo si **no tiene compras registradas**); el
buscador filtra por nombre, razón social, RFC, contacto, correo o teléfono. Hay
pestañas de **Órdenes de compra**, **Mermas y devoluciones** y **Reportes de
compras**. Al pie del panel está siempre **libreriacartaagena302987@gmail.com**.

## 7. Errores frecuentes

| Mensaje | Qué hacer |
|---|---|
| *«Completa la verificación anti-bot»* | Marca «No soy un robot» y vuelve a enviar. |
| *«Acceso restringido» / «Requiere rol ADMIN»* | Pide a un administrador el rol adecuado. |
| *«El servicio de correo no está configurado…»* | Escribe a libreriacartaagena302987@gmail.com. |
| *«Token inválido o expirado»* / *«Tu sesión expiró»* | Venció (20 min) o pasaron los 15 minutos: repite el proceso. |
| Página en blanco o *«Error 500 al consultar /proveedores»* | Recarga con **Ctrl + F5** (ya corregido). |
| *«Ya existe un proveedor con ese RFC»* | Usa el RFC real o edita el existente. |

## 8. Contacto y soporte

- **Correo:** libreriacartaagena302987@gmail.com (también al pie del panel).
- **Aviso de Privacidad** y **Términos y Condiciones:** en el pie del sitio.

*Guía rápida · Librería Cartagena · materia SOA · Edición 2026.*
