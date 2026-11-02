import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/logo.png';
import slogan from '../../assets/Fotografias_Cartagena/Slogan.png';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { usePersonaje } from '../../utils/avatar';
import { ETIQUETA_ROL, inicialesDe, nombreParaMostrar } from '../../utils/roles';

type IconName =
  | 'search'
  | 'cart'
  | 'user'
  | 'chevron'
  | 'profile'
  | 'orders'
  | 'settings'
  | 'panel'
  | 'logout'
  | 'users'
  | 'truck';

const ICONS: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  cart: (
    <>
      <path d="M2 4h3l2.5 11h11L21 7H6.5" />
      <circle cx="9" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M5.8 18.4c1.4-2.6 3.6-3.8 6.2-3.8s4.8 1.2 6.2 3.8" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.5 20c1.4-3.2 4-4.8 7.5-4.8s6.1 1.6 7.5 4.8" />
    </>
  ),
  orders: (
    <>
      <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1z" />
    </>
  ),
  panel: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M9 8l-4 4 4 4M5 12h10" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 20c1.1-2.8 3.3-4.2 6.2-4.2s5.1 1.4 6.2 4.2" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 5.2M17.8 15.8c1.6.6 2.8 2 3.4 4.2" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h11v11H2zM13 10h4l4 4v3h-8z" />
      <circle cx="6" cy="18.5" r="1.6" />
      <circle cx="17" cy="18.5" r="1.6" />
    </>
  ),
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function Header() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { usuario, autenticado, cerrarSesion } = useAuth();
  const personaje = usePersonaje(usuario?.nombreUsuario);
  const [text, setText] = useState(params.get('q') ?? '');
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const cuentaRef = useRef<HTMLDivElement>(null);

  const esAdmin = usuario?.rol === 'ADMIN';
  const esStaff = usuario?.rol === 'ADMIN' || usuario?.rol === 'REPARTIDOR';
  const nombre = usuario ? nombreParaMostrar(usuario) : '';

  useEffect(() => {
    setText(params.get('q') ?? '');
  }, [params]);

  // Al navegar, cierra el menú de cuenta.
  useEffect(() => {
    setCuentaAbierta(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const alPulsarFuera = (evento: MouseEvent) => {
      const objetivo = evento.target as Node;
      if (cuentaRef.current && !cuentaRef.current.contains(objetivo)) setCuentaAbierta(false);
    };
    const alPulsarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setCuentaAbierta(false);
    };
    document.addEventListener('mousedown', alPulsarFuera);
    document.addEventListener('keydown', alPulsarTecla);
    return () => {
      document.removeEventListener('mousedown', alPulsarFuera);
      document.removeEventListener('keydown', alPulsarTecla);
    };
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  const salir = () => {
    setCuentaAbierta(false);
    cerrarSesion();
    navigate('/');
  };

  return (
    <header className="header site-header">
      <div className="menu busqueda-centro site-header__bar">
        <Link to="/" className="identidad-tienda brand" aria-label="Librería Cartagena, ir al inicio">
          <img src={logo} alt="" className="logo-tienda" />
          <img
            src={slogan}
            alt="Donde la magia de leer no tiene fin"
            className="brand__slogan"
          />
        </Link>

        <form className="busqueda-menu search" role="search" onSubmit={onSubmit}>
          <input
            className="input-busqueda"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Buscar por título, autor o ISBN…"
            aria-label="Buscar libros"
          />
          <button className="boton-busqueda" type="submit" aria-label="Buscar">
            <Icon name="search" size={20} />
          </button>
        </form>

        <div className="opciones-menu site-header__actions">
          <Link to="/carrito" className="header-action" aria-label={`Carrito, ${totalItems} artículos`}>
            <Icon name="cart" size={26} />
            <span className="header-action__text">Carrito</span>
            <span className="badge">{totalItems}</span>
          </Link>

          <div className="account-menu" ref={cuentaRef}>
            <button
              type="button"
              className="header-action"
              aria-haspopup="menu"
              aria-expanded={cuentaAbierta}
              onClick={() => setCuentaAbierta((valor) => !valor)}
            >
              <Icon name="user" size={26} />
              <span className="header-action__text">Mi Cuenta</span>
              <span className={`account-menu__chevron${cuentaAbierta ? ' account-menu__chevron--on' : ''}`}>
                <Icon name="chevron" size={16} />
              </span>
            </button>

            {cuentaAbierta && (
              <div className="account-menu__panel" role="menu">
                {autenticado && usuario ? (
                  <>
                    <div className="account-menu__head">
                      <span className="account-menu__avatar" aria-hidden="true">
                        {personaje ? (
                          <span className="account-menu__avatar-emoji">{personaje.emoji}</span>
                        ) : (
                          inicialesDe(nombre) || 'C'
                        )}
                      </span>
                      <div className="account-menu__identity">
                        <p className="account-menu__name">{nombre}</p>
                        <p className="account-menu__email">{usuario.email ?? usuario.nombreUsuario}</p>
                        <span className={`role role--${usuario.rol.toLowerCase()}`}>
                          {ETIQUETA_ROL[usuario.rol]}
                        </span>
                      </div>
                    </div>

                    <ul className="account-menu__list">
                      <li>
                        <Link className="account-menu__item" to="/cuenta" role="menuitem">
                          <Icon name="profile" /> Mi Perfil
                        </Link>
                      </li>
                      <li>
                        <Link className="account-menu__item" to="/mis-pedidos" role="menuitem">
                          <Icon name="orders" /> Mis Pedidos
                        </Link>
                      </li>
                      <li>
                        <Link className="account-menu__item" to="/configuracion" role="menuitem">
                          <Icon name="settings" /> Configuración
                        </Link>
                      </li>
                    </ul>

                    {esStaff && (
                      <>
                        <p className="account-menu__section">Administración</p>
                        <ul className="account-menu__list">
                          {esAdmin && (
                            <>
                              <li>
                                <Link className="account-menu__item" to="/admin" role="menuitem">
                                  <Icon name="panel" /> Panel general
                                </Link>
                              </li>
                              <li>
                                <Link className="account-menu__item" to="/admin/usuarios" role="menuitem">
                                  <Icon name="users" /> Usuarios y roles
                                </Link>
                              </li>
                            </>
                          )}
                          <li>
                            <Link className="account-menu__item" to="/admin/logistica" role="menuitem">
                              <Icon name="truck" /> Logística y entregas
                            </Link>
                          </li>
                        </ul>
                      </>
                    )}

                    <div className="account-menu__sep" />
                    <button type="button" className="account-menu__item account-menu__item--danger" onClick={salir} role="menuitem">
                      <Icon name="logout" /> Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="account-menu__invitado">
                    <p className="account-menu__name">Mi Cuenta</p>
                    <p className="account-menu__email">
                      Inicia sesión para ver tus pedidos, confirmar entregas y administrar tu perfil.
                    </p>
                    <div className="account-menu__botones">
                      <Link className="btn" to="/login">
                        Iniciar sesión
                      </Link>
                      <Link className="btn btn--outline" to="/registro">
                        Crear cuenta
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
