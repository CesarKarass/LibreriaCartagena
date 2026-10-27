import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CAPACIDADES_ROL, DESCRIPCION_ROL, ETIQUETA_ROL, nombreParaMostrar } from '../../utils/roles';

function formatearFecha(valor: string | null): string {
  if (!valor) return 'Todavía no registrado';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha);
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

export default function CuentaPage() {
  const { usuario, sesion, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const temporizador = window.setInterval(() => setAhora(Date.now()), 30_000);
    return () => window.clearInterval(temporizador);
  }, []);

  if (!usuario) return null;

  const nombre = nombreParaMostrar(usuario);
  const minutosRestantes = sesion
    ? Math.max(0, Math.ceil((sesion.expiraEnMs - ahora) / 60_000))
    : 0;

  const salir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <div className="account">
      <header className="account__hero">
        <div className="account__avatar" aria-hidden="true">
          {iniciales(nombre) || '?'}
        </div>
        <div className="account__identity">
          <p className="account__eyebrow">Mi cuenta</p>
          <h1>{nombre}</h1>
          <p className="account__handle">@{usuario.nombreUsuario}</p>
          <span className={`role role--${usuario.rol.toLowerCase()}`}>{ETIQUETA_ROL[usuario.rol]}</span>
        </div>
      </header>

      <div className="account__grid">
        <section className="panel" aria-labelledby="datos-cuenta">
          <h2 id="datos-cuenta">Datos de la cuenta</h2>
          <dl className="account__data">
            <div>
              <dt>Usuario</dt>
              <dd>{usuario.nombreUsuario}</dd>
            </div>
            <div>
              <dt>Correo electrónico</dt>
              <dd>{usuario.email ?? 'Sin correo registrado'}</dd>
            </div>
            <div>
              <dt>Identificador</dt>
              <dd>#{usuario.idUsuario}</dd>
            </div>
            <div>
              <dt>Último acceso</dt>
              <dd>{formatearFecha(usuario.ultimoAcceso)}</dd>
            </div>
            <div>
              <dt>Sesión</dt>
              <dd>
                {minutosRestantes > 0
                  ? `Vence en ~${minutosRestantes} min`
                  : 'A punto de vencer'}
              </dd>
            </div>
          </dl>
        </section>

        <section className={`panel panel--rol panel--${usuario.rol.toLowerCase()}`} aria-labelledby="rol-cuenta">
          <h2 id="rol-cuenta">Tu rol</h2>
          <p className="panel__rol">{ETIQUETA_ROL[usuario.rol]}</p>
          <p className="panel__descripcion">{DESCRIPCION_ROL[usuario.rol]}</p>
          <ul className="account__capacidades">
            {CAPACIDADES_ROL[usuario.rol].map((capacidad) => (
              <li key={capacidad}>{capacidad}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="account__actions">
        <Link className="btn btn--outline" to="/">
          Seguir explorando el catálogo
        </Link>
        {usuario.rol === 'ADMIN' && (
          <Link className="btn" to="/admin">
            Ir al panel de administración
          </Link>
        )}
        <button type="button" className="btn btn--peligro" onClick={salir}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
