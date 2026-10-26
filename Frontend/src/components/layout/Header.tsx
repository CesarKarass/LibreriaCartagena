import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [text, setText] = useState(params.get('q') ?? '');

  useEffect(() => { setText(params.get('q') ?? ''); }, [params]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = text.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  return (
    <header className="header">
      <Link to="/" className="brand" aria-label="Cartagena Bookstore, ir al inicio">
        <img src={logo} alt="" className="brand__logo" />
        <span className="brand__slogan">Donde la magia de leer no tiene fin</span>
      </Link>

      <form className="search" role="search" onSubmit={onSubmit}>
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Buscar por título, autor o ISBN…"
          aria-label="Buscar libros"
        />
        <button type="submit" aria-label="Buscar">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>

      <nav className="nav" aria-label="Principal">
        <Link to="/carrito" className="nav__link">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 4h3l2.5 11h11L21 7H6.5" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" />
          </svg>
          <span>Carrito</span>
          <span className="badge" aria-label={`${totalItems} artículos`}>{totalItems}</span>
        </Link>
        <Link to="/cuenta" className="nav__link">
          <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3.2" /><path d="M5.8 18.4c1.4-2.6 3.6-3.8 6.2-3.8s4.8 1.2 6.2 3.8" />
          </svg>
          <span>Mi Cuenta</span>
        </Link>
      </nav>
    </header>
  );
}
