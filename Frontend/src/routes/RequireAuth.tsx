import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types/auth';
import { ETIQUETA_ROL } from '../utils/roles';

interface RequireAuthProps {
  children: ReactNode;
  roles?: Rol[];
}

export default function RequireAuth({ children, roles }: RequireAuthProps) {
  const { cargando, autenticado, usuario } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <p className="state" aria-live="polite">
        Comprobando tu sesión…
      </p>
    );
  }

  if (!autenticado || !usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (roles && !roles.includes(usuario.rol)) {
    return (
      <section className="state state--denegado" role="alert">
        <h1>Acceso restringido</h1>
        <p>
          Esta sección requiere un rol distinto. Tu rol actual es{' '}
          <strong>{ETIQUETA_ROL[usuario.rol]}</strong>.
        </p>
        <Link className="btn btn--outline" to="/">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  return <>{children}</>;
}
