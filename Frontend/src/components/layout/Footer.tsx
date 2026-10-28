import { Link } from 'react-router-dom';

/** Redes sociales oficiales de Librería Cartagena (abren en una pestaña nueva). */
const REDES = [
  {
    nombre: 'WhatsApp',
    url: 'https://whatsapp.com/channel/0029VbEJvPmDJ6H2SjkSAM2N',
    icono: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4.2.4.3.1.2.1.7-.1 1.3z" />
      </svg>
    ),
  },
  {
    nombre: 'Instagram',
    url: 'https://www.instagram.com/libreriacartaagena302987/',
    icono: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4.5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    nombre: 'Facebook',
    url: 'https://www.facebook.com/share/1F2n6wELoY/',
    icono: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
      </svg>
    ),
  },
  {
    nombre: 'Twitter / X',
    url: 'https://www.instagram.com/cesarkarass19/',
    icono: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.5 4.7a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4a4.2 4.2 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.9A8.3 8.3 0 0 1 2 18.4a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z" />
      </svg>
    ),
  },
] as const;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__col footer__col--brand">
          <h2 className="footer__titulo">Cartagena</h2>
          <p className="footer__mision">
            Librería El País de las Maravillas. Un rincón donde cada página abre
            una puerta a lo imposible.
          </p>
          <p className="footer__copyright">© 2026 Cartagena Bookstore. Todos los derechos reservados.</p>
        </div>

        <div className="footer__col">
          <h3 className="footer__titulo-seccion">Información Legal</h3>
          <ul className="footer__links">
            <li><Link to="/aviso-privacidad">Aviso de Privacidad</Link></li>
            <li><Link to="/terminos">Términos y Condiciones</Link></li>
            <li><a href="mailto:contacto@libreriacartagena.com">Contacto</a></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__titulo-seccion">Síguenos en la Madriguera</h3>
          <p className="footer__redes-texto">Conecta con nuestras redes sociales:</p>
          <div className="footer__redes">
            {REDES.map((red) => (
              <a
                key={red.nombre}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Librería Cartagena en ${red.nombre}`}
                title={red.nombre}
                className="footer__red"
              >
                {red.icono}
              </a>
            ))}
          </div>
          <p className="footer__diseno">Diseñado con magia literaria.</p>
        </div>
      </div>
    </footer>
  );
}
