import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { listarPedidosAdmin } from '../../services/tiendaService';
import type { PedidoAdmin } from '../../types/tienda';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function folio(id: number): string {
  return `#ORD-${String(id).padStart(4, '0')}`;
}

function formatearFecha(valor: string): string {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(fecha);
}

const ESTADOS = ['todos', 'Pendiente', 'Confirmado', 'Cancelado'] as const;

export default function AdminPedidosPage() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<(typeof ESTADOS)[number]>('todos');

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setError(null);
    try {
      setPedidos(await listarPedidosAdmin(token));
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return pedidos.filter((pedido) => {
      const coincideTexto =
        !texto ||
        pedido.nombre.toLowerCase().includes(texto) ||
        folio(pedido.id_pedido).toLowerCase().includes(texto);
      const coincideEstado = filtro === 'todos' || pedido.estado === filtro;
      return coincideTexto && coincideEstado;
    });
  }, [pedidos, busqueda, filtro]);

  const resumen = useMemo(
    () => ({
      total: pedidos.length,
      ingresos: pedidos
        .filter((pedido) => pedido.estado !== 'Cancelado')
        .reduce((suma, pedido) => suma + Number(pedido.total), 0),
      pendientes: pedidos.filter((pedido) => pedido.estado === 'Pendiente').length,
      entregados: pedidos.filter((pedido) => pedido.estado_envio === 'Entregado').length,
    }),
    [pedidos],
  );

  return (
    <div className="admin-inv">
      <header className="admin-inv__head">
        <div>
          <p className="admin-inv__eyebrow">Administración</p>
          <h1>Pedidos y ventas</h1>
          <p className="admin-inv__subtitulo">
            Consulta todas las compras, su estado de pago y el avance de la entrega. Para actualizar
            guías o validar entregas usa el panel de logística.
          </p>
        </div>
        <div className="admin-inv__acciones">
          <Link className="btn btn--outline" to="/admin">
            Volver al panel
          </Link>
          <Link className="btn" to="/admin/logistica">
            Ir a logística
          </Link>
        </div>
      </header>

      <section className="admin-inv__alertas" aria-label="Resumen de pedidos">
        <div className="alerta alerta--valor">
          <span className="alerta__valor">{resumen.total}</span>
          <span className="alerta__texto">Pedidos registrados</span>
        </div>
        <div className="alerta alerta--ok">
          <span className="alerta__valor">{money.format(resumen.ingresos)}</span>
          <span className="alerta__texto">Ventas netas</span>
        </div>
        <div className="alerta alerta--alto">
          <span className="alerta__valor">{resumen.pendientes}</span>
          <span className="alerta__texto">Pagos pendientes</span>
        </div>
        <div className="alerta">
          <span className="alerta__valor">{resumen.entregados}</span>
          <span className="alerta__texto">Entregados</span>
        </div>
      </section>

      {error && (
        <p className="pedidos-page__error" role="alert">
          {error}
        </p>
      )}

      <section className="panel admin-inv__tabla-wrap">
        <div className="admin-inv__toolbar">
          <label className="admin-inv__buscar">
            <span>Buscar pedido</span>
            <input
              type="search"
              placeholder="Folio o cliente…"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </label>
          <div className="admin-inv__chips" role="group" aria-label="Filtrar por estado">
            {ESTADOS.map((estado) => (
              <button
                key={estado}
                type="button"
                className={filtro === estado ? 'chip chip--on' : 'chip'}
                onClick={() => setFiltro(estado)}
              >
                {estado === 'todos' ? 'Todos' : estado}
              </button>
            ))}
          </div>
          <span className="admin-inv__conteo">
            {filtrados.length} de {pedidos.length}
          </span>
        </div>

        {cargando ? (
          <p className="state" aria-live="polite">
            Cargando pedidos…
          </p>
        ) : (
          <table className="admin-inv__tabla">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th className="num">Total</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Envío</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((pedido) => (
                <tr key={pedido.id_pedido}>
                  <td>
                    <strong className="admin-inv__clave">{folio(pedido.id_pedido)}</strong>
                  </td>
                  <td>{pedido.nombre}</td>
                  <td>{formatearFecha(pedido.fecha)}</td>
                  <td className="num">{money.format(Number(pedido.total))}</td>
                  <td>
                    <span
                      className={
                        pedido.estado === 'Cancelado'
                          ? 'pill pill--bajo'
                          : pedido.estado === 'Confirmado'
                            ? 'pill pill--ok'
                            : 'pill pill--alto'
                      }
                    >
                      {pedido.estado}
                    </span>
                  </td>
                  <td>{pedido.estado_pago}</td>
                  <td>{pedido.estado_envio ?? 'Sin envío'}</td>
                  <td>
                    <div className="admin-inv__fila-acciones">
                      <Link className="btn-mini" to={`/pedido/${pedido.id_pedido}`}>
                        Ver detalle
                      </Link>
                      <Link className="btn-mini" to="/admin/logistica">
                        Logística
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!cargando && filtrados.length === 0 && (
          <p className="state">No hay pedidos que coincidan con el filtro.</p>
        )}
      </section>
    </div>
  );
}
