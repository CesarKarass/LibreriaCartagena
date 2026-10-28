import { Link } from 'react-router-dom';

export default function AvisoPrivacidadPage() {
  return (
    <article className="legal">
      <header className="legal__head">
        <p className="legal__eyebrow">Información legal</p>
        <h1>Aviso de Privacidad</h1>
        <p className="legal__intro">
          En <strong>Librería Cartagena</strong> resguardamos los datos personales que nos
          confías al crear tu cuenta o realizar una compra. Este aviso describe qué datos
          recabamos, para qué los usamos y cómo puedes ejercer tus derechos.
        </p>
        <p className="legal__fecha">Última actualización: 28 de octubre de 2026</p>
      </header>

      <section className="legal__bloque">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          Librería El País de las Maravillas, S.A. de C.V., responsable del uso de tus datos
          personales. Domicilio para notificaciones y ejercicio de derechos:{' '}
          <a href="mailto:contacto@libreriacartagena.com">contacto@libreriacartagena.com</a>.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>2. Datos personales que recabamos</h2>
        <p>Para operar la tienda en línea recabamos las siguientes categorías:</p>
        <ul>
          <li>
            <strong>Identificación:</strong> nombre completo y nombre de usuario.
          </li>
          <li>
            <strong>Contacto:</strong> correo electrónico y teléfono.
          </li>
          <li>
            <strong>Domicilio de entrega:</strong> calle, número, colonia, ciudad, estado y
            código postal.
          </li>
          <li>
            <strong>Compra y pago:</strong> libros adquiridos, importes, método de pago
            seleccionado y estado del pedido.
          </li>
        </ul>
        <p>
          <strong>No almacenamos los números completos de tarjeta ni los CVV.</strong> El pago
          con tarjeta se realiza en la pasarela de prueba (sandbox) del sitio; nosotros sólo
          guardamos el resultado del cobro.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>3. Finalidades del tratamiento</h2>
        <p>
          <strong>Primarias (necesarias para prestarte el servicio):</strong> crear y custodiar
          tu cuenta, gestionar tu carrito, procesar pedidos, cobrar, enviar tus libros, darte
          seguimiento de compra y atender preguntas o devoluciones.
        </p>
        <p>
          <strong>Secundarias (opcionales):</strong> enviarte novedades del catálogo, ofertas y
          recomendaciones. Puedes negar este tratamiento sin que eso afecte tu compra, respondiendo
          a cualquiera de nuestros correos con la palabra “BAJA”.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>4. Transferencias de datos</h2>
        <p>Compartimos datos únicamente con quien hace posible la entrega:</p>
        <ul>
          <li>
            <strong>Pasarelas de pago y bancos</strong> para autorizar la operación (cuando pagas
            con tarjeta o transferencia).
          </li>
          <li>
            <strong>Empresa de paquetería</strong> para entregar tu pedido: nombre, dirección y
            teléfono del destinatario.
          </li>
          <li>
            <strong>Autoridades competentes</strong>, cuando la ley lo requiera.
          </li>
        </ul>
      </section>

      <section className="legal__bloque">
        <h2>5. Derechos ARCO</h2>
        <p>
          Tienes derecho a <strong>A</strong>cceder, <strong>R</strong>ectificar,
          <strong>C</strong>ancelar u <strong>O</strong>ponerte al tratamiento de tus datos, así
          como a revocar tu consentimiento. Para ejercerlos escribe a{' '}
          <a href="mailto:contacto@libreriacartagena.com">contacto@libreriacartagena.com</a>{' '}
          indicando tu nombre, el derecho que deseas ejercer y un medio para comunicarte la
          respuesta. Daremos respuesta en un plazo máximo de <strong>20 días hábiles</strong>.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>6. Cookies y almacenamiento local</h2>
        <ul>
          <li>
            <strong>Sesión:</strong> guardamos un token de autenticación en tu navegador para que
            no tengas que iniciar sesión en cada visita. Puedes cerrar sesión para eliminarlo.
          </li>
          <li>
            <strong>Carrito de invitado:</strong> si no has iniciado sesión, los libros que
            agregues se guardan en tu navegador (almacenamiento local) hasta que inicies sesión o
            cierres la pestaña; al entrar a tu cuenta se integran a tu carrito.
          </li>
          <li>No utilizamos cookies de publicidad ni de terceros para rastrearte en otros sitios.</li>
        </ul>
      </section>

      <section className="legal__bloque">
        <h2>7. Seguridad de los datos</h2>
        <p>
          Aplicamos medidas administrativas y técnicas para proteger tus datos: comunicación cifrada
          (HTTPS), contraseñas guardadas en forma irreversible (hash), tokens firmados con
          vencimiento y validaciones en el servidor. Si detectamos un incidente de seguridad
          afectado a tus datos, te lo notificaremos.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>8. Cambios a este aviso</h2>
        <p>
          Cualquier modificación a este aviso se publicará en esta misma página con la fecha de
          actualización. Si el cambio afecta las finalidades para las que usamos tus datos, te
          avisaremos por correo antes de aplicarlo.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>9. Autoridad de control</h2>
        <p>
          Si consideras que tu derecho a la protección de datos ha sido lesionado, puedes acudir
          al Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos
          Personales (INAI) en{' '}
          <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer">
            www.inai.org.mx
          </a>.
        </p>
      </section>

      <footer className="legal__pie">
        <Link to="/terminos" className="btn legal__btn">
          Ver Términos y Condiciones
        </Link>
        <Link to="/" className="btn btn--outline legal__btn">
          Volver al catálogo
        </Link>
      </footer>
    </article>
  );
}
