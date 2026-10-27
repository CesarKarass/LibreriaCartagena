import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthApiError, consultarPanelAdmin } from '../../services/authService';
import { nombreParaMostrar } from '../../utils/roles';
import { mensajeErrorAuth } from './mensajes';

type EstadoPanel = 'cargando' | 'verificado' | 'error';

const MODULOS = [
  {
    titulo: 'Usuarios y roles',
    descripcion: 'Alta de usuarios, asignación de roles y control de cuentas.',
  },
  {
    titulo: 'Catálogo e inventario',
    descripcion: 'Libros, precios, existencias y ofertas de la librería.',
  },
  {
    titulo: 'Pedidos y ventas',
    descripcion: 'Seguimiento de compras, pagos y entregas.',
  },
  {
    titulo: 'Reportes',
    descripcion: 'Indicadores de ventas y comportamiento del catálogo.',
  },
];

export default function AdminPage() {
  const { usuario, token, cerrarSesion } = useAuth();
  const [estado, setEstado] = useState<EstadoPanel>('cargando');
  const [detalle, setDetalle] = useState<string | null>(null);
  const [idConfirmado, setIdConfirmado] = useState<number | null>(null);

  useEffect(() => {
    if (!token || !usuario) return;
    let cancelado = false;
    setEstado('cargando');
    setDetalle(null);

    consultarPanelAdmin(token)
      .then((datos) => {
        if (cancelado) return;
        setIdConfirmado(datos.idUsuario);
        setEstado('verificado');
      })
      .catch((error: unknown) => {
        if (cancelado) return;
        if (error instanceof AuthApiError && (error.estadoHttp === 401 || error.estadoHttp === 403)) {
          cerrarSesion();
          return;
        }
        setDetalle(mensajeErrorAuth(error));
        setEstado('error');
      });

    return () => {
      cancelado = true;
    };
  }, [token, usuario, cerrarSesion]);

  if (!usuario) return null;

  return (
    <div className="account">
      <header className="account__hero">
        <div className="account__avatar account__avatar--admin" aria-hidden="true">
          ⚙
        </div>
        <div className="account__identity">
          <p className="account__eyebrow">Panel de administración</p>
          <h1>Hola, {nombreParaMostrar(usuario)}</h1>
          <p className="account__handle">Sesión con privilegios de administrador</p>
          <span className="role role--admin">ADMIN</span>
        </div>
      </header>

      <section className="panel" aria-labelledby="estado-rol">
        <h2 id="estado-rol">Verificación de rol</h2>
        {estado === 'cargando' && (
          <p className="state" aria-live="polite">
            Validando tu rol con el microservicio de autenticación…
          </p>
        )}
        {estado === 'verificado' && (
          <p className="state state--ok" aria-live="polite">
            El backend confirmó tu rol <strong>ADMIN</strong>
            {idConfirmado !== null ? ` para el usuario #${idConfirmado}` : ''}. Las rutas de
            administración están habilitadas.
          </p>
        )}
        {estado === 'error' && (
          <p className="state state--error" role="alert">
            No se pudo validar el panel con el backend: {detalle}
          </p>
        )}
      </section>

      <section aria-labelledby="modulos-admin">
        <h2 id="modulos-admin" className="account__seccion">
          Módulos del sistema
        </h2>
        <div className="admin__modules">
          {MODULOS.map((modulo) => (
            <article className="admin__module" key={modulo.titulo}>
              <h3>{modulo.titulo}</h3>
              <p>{modulo.descripcion}</p>
              <span className="admin__pendiente">Módulo en construcción</span>
            </article>
          ))}
        </div>
      </section>

      <div className="account__actions">
        <Link className="btn btn--outline" to="/">
          Volver al catálogo
        </Link>
        <Link className="btn btn--outline" to="/cuenta">
          Mi cuenta
        </Link>
        <button
          type="button"
          className="btn btn--peligro"
          onClick={() => {
            cerrarSesion();
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
