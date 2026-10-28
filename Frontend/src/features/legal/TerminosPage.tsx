import { Link } from 'react-router-dom';

export default function TerminosPage() {
  return (
    <article className="legal">
      <header className="legal__head">
        <p className="legal__eyebrow">Información legal</p>
        <h1>Términos y Condiciones</h1>
        <p className="legal__intro">
          Estos términos regulan el uso del sitio web de <strong>Librería Cartagena</strong>
          (Librería El País de las Maravillas, S.A. de C.V.). Al navegar, crear una cuenta o
          realizar una compra en el sitio aceptas lo que se describe a continuación.
        </p>
        <p className="legal__fecha">Última actualización: 28 de octubre de 2026</p>
      </header>

      <section className="legal__bloque">
        <h2>1. Responsable del sitio</h2>
        <p>
          Librería El País de las Maravillas, S.A. de C.V., operadora de la tienda en línea
          “Librería Cartagena”. Para cualquier duda sobre estos términos puedes escribirnos a{' '}
          <a href="mailto:contacto@libreriacartagena.com">contacto@libreriacartagena.com</a> o
          a través de nuestras redes sociales en el pie de página.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>2. Objeto</h2>
        <p>
          El sitio permite consultar el catálogo de libros, crear una cuenta, armar un carrito de
          compras y realizar pedidos en línea con entrega a domicilio. El uso del sitio implica la
          aceptación de estos términos y del <Link to="/aviso-privacidad">Aviso de Privacidad</Link>.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>3. Catálogo, precios y disponibilidad</h2>
        <ul>
          <li>Los precios se muestran en pesos mexicanos (MXN) e incluyen IVA.</li>
          <li>
            Algunos títulos pueden tener descuento temporal; en ese caso se muestra el precio
            original tachado junto al precio de oferta.
          </li>
          <li>
            La disponibilidad se valida al momento de confirmar el pedido. Si un libro se agota
            después de tu compra te avisaremos por correo para ofrecerte una alternativa o el
            reembolso completo.
          </li>
          <li>Las fotografías son ilustrativas del ejemplar físico que se envía.</li>
        </ul>
      </section>

      <section className="legal__bloque">
        <h2>4. Pedidos y formas de pago</h2>
        <p>Para comprar necesitas una cuenta con correo electrónico válido. Aceptamos:</p>
        <ul>
          <li>
            <strong>Tarjeta de crédito o débito</strong> (Visa, Mastercard, AMEX). El sitio
            utiliza un entorno de pruebas: no se realiza ningún cargo real.
          </li>
          <li>
            <strong>Transferencia SPEI</strong> mediante la CLABE interbancaria que se muestra
            al confirmar el pedido; un administrador valida el pago antes de despacharlo.
          </li>
          <li>
            <strong>Efectivo contra entrega</strong>: pagas al recibir el pedido en tu domicilio.
          </li>
        </ul>
        <p>
          Cada pedido recibe un folio de comprobante (por ejemplo, TKT-2026-001) que sirve para
          dar seguimiento. Los pedidos se confirman una sola vez: el sitio utiliza una clave de
          idempotencia para evitar cobros duplicados por doble clic.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>5. Envíos</h2>
        <ul>
          <li>El costo de envío estándar es de <strong>$50.00 MXN</strong> por pedido.</li>
          <li>Los pedidos confirmados se despachan en un plazo de 2 a 5 días hábiles.</li>
          <li>
            El pedido se entrega en el domicilio que registraste al pagar; es responsabilidad del
            cliente proporcionar calle, número, colonia, ciudad, estado, código postal y teléfono
            correctos.
          </li>
        </ul>
      </section>

      <section className="legal__bloque">
        <h2>6. Cancelaciones, devoluciones y garantías</h2>
        <ul>
          <li>
            Puedes cancelar un pedido mientras no haya sido despachado, escribiéndonos con tu
            folio.
          </li>
          <li>
            Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
            Particulares y la legislación aplicable a compras a distancia, cuentas con{' '}
            <strong>10 días hábiles</strong> a partir de la entrega para devolver un libro en
            excelentes condiciones y recibir reembolso.
          </li>
          <li>
            Si el libro llega dañado o no corresponde a tu pedido, repóngalo sin costo: envíanos
            fotos del ejemplar y del empaque.
          </li>
          <li>
            Los pedidos pagados contra entrega se cancelan sin cargo antes de que el repartidor
            realice el cobro.
          </li>
        </ul>
      </section>

      <section className="legal__bloque">
        <h2>7. Reseñas y comentarios</h2>
        <p>
          Sólo las personas que compraron un libro pueden dejar reseña y calificación para ese
          título (comprador verificado). Las reseñas deben respetar a otros lectores: no se
          publican insultos, datos personales de terceros ni publicidad ajena. Podemos retirar
          comentarios que incumplan estas reglas.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>8. Cuenta de usuario</h2>
        <ul>
          <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
          <li>Las cuentas son personales e intransferibles.</li>
          <li>
            Podemos suspender cuentas con intentos fallidos reiterados o actividad que ponga en
            riesgo la seguridad del sitio.
          </li>
        </ul>
      </section>

      <section className="legal__bloque">
        <h2>9. Propiedad intelectual</h2>
        <p>
          El nombre Librería Cartagena, su logotipo, textos, fotografías y diseño del sitio son
          propiedad de Librería El País de las Maravillas, S.A. de C.V. o de sus licenciantes.
          Queda prohibida su reproducción total o parcial sin autorización por escrito.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>10. Limitación de responsabilidad</h2>
        <p>
          El sitio se ofrece “tal cual”. No garantizamos interrupciones absolutas del servicio
          por causas ajenas a nosotros (fallas de internet, mantenimiento o casos fortuitos),
          aunque actuaremos para restablecerlo a la brevedad. Nuestra responsabilidad se limita
          al valor del pedido correspondiente.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>11. Leyes aplicables y jurisdicción</h2>
        <p>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
          controversia se someterá a los tribunales competentes de tu domicilio o, en su caso, a
          los de la Ciudad de México, renunciando a cualquier otro fuero que pudiera
          corresponderle.
        </p>
      </section>

      <section className="legal__bloque">
        <h2>12. Cambios a estos términos</h2>
        <p>
          Podemos actualizar estos términos para reflejar cambios legales o del servicio. Los
          cambios aplican desde su publicación en esta página; la fecha de la última
          actualización aparece al inicio del documento.
        </p>
      </section>

      <footer className="legal__pie">
        <Link to="/aviso-privacidad" className="btn legal__btn">
          Ver Aviso de Privacidad
        </Link>
        <Link to="/" className="btn btn--outline legal__btn">
          Volver al catálogo
        </Link>
      </footer>
    </article>
  );
}
