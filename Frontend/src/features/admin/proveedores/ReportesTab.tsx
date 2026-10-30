import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../services/api';
import { obtenerReporteCompras } from '../../../services/proveedoresService';
import type { ReporteCompras } from '../../../types/proveedores';
import { claseEstado, fecha, importe, mesActual, nombreMes } from './comun';

export default function ReportesTab({ token }: { token: string | null }) {
  const [mes, setMes] = useState(mesActual());
  const [reporte, setReporte] = useState<ReporteCompras | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (periodo: string) => {
      if (!token) return;
      setCargando(true);
      try {
        setReporte(await obtenerReporteCompras(periodo, token));
        setError(null);
      } catch (err) {
        setReporte(null);
        setError(
          err instanceof ApiError ? err.message : 'No se pudo generar el reporte de compras.',
        );
      } finally {
        setCargando(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void cargar(mes);
  }, [cargar, mes]);

  const resumen = useMemo(() => {
    const compras = reporte?.compras ?? [];
    const recibidas = compras.filter((c) => c.estado.trim().toLowerCase() === 'recibido');
    const pendientes = compras.length - recibidas.length;
    const total = Number(reporte?.total ?? 0);
    return {
      pedidos: compras.length,
      recibidas: recibidas.length,
      pendientes,
      total,
      promedio: compras.length ? total / compras.length : 0,
    };
  }, [reporte]);

  const porProveedor = useMemo(() => {
    const mapa = new Map<string, { nombre: string; pedidos: number; total: number }>();
    for (const compra of reporte?.compras ?? []) {
      const actual = mapa.get(compra.nombre) ?? { nombre: compra.nombre, pedidos: 0, total: 0 };
      actual.pedidos += 1;
      actual.total += Number(compra.costo_total);
      mapa.set(compra.nombre, actual);
    }
    return [...mapa.values()].sort((a, b) => b.total - a.total);
  }, [reporte]);

  return (
    <div className="admin-prov__panel">
      <div className="admin-inv__toolbar">
        <label className="admin-inv__buscar admin-prov__mes">
          <span>Mes del reporte</span>
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        </label>
        <button type="button" className="btn" onClick={() => void cargar(mes)} disabled={cargando}>
          {cargando ? 'Consultando…' : 'Consultar'}
        </button>
        <span className="admin-inv__conteo">Periodo: {nombreMes(mes)}</span>
      </div>

      {error && <p className="checkout__error" role="alert">{error}</p>}

      <div className="admin-inv__alertas" aria-label="Resumen de compras del mes">
        <article className="alerta alerta--valor">
          <span className="alerta__valor">{importe(resumen.total)}</span>
          <span className="alerta__texto">Total comprado en {nombreMes(mes)}</span>
        </article>
        <article className="alerta alerta--ok">
          <span className="alerta__valor">{resumen.pedidos}</span>
          <span className="alerta__texto">Pedidos de compra</span>
        </article>
        <article className={`alerta${resumen.pendientes > 0 ? ' alerta--alto' : ' alerta--ok'}`}>
          <span className="alerta__valor">{resumen.pendientes}</span>
          <span className="alerta__texto">Pendientes de recibir</span>
        </article>
        <article className="alerta alerta--ok">
          <span className="alerta__valor">{importe(resumen.promedio)}</span>
          <span className="alerta__texto">Promedio por pedido</span>
        </article>
      </div>

      <div className="panel admin-inv__tabla-wrap">
        {cargando ? (
          <p className="state">Generando reporte…</p>
        ) : !reporte || reporte.compras.length === 0 ? (
          <p className="state">No hay compras registradas en {nombreMes(mes)}.</p>
        ) : (
          <table className="admin-inv__tabla">
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Fecha</th>
                <th scope="col">Proveedor</th>
                <th scope="col">Estado</th>
                <th scope="col" className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {reporte.compras.map((compra) => (
                <tr key={compra.id_pedido}>
                  <td className="admin-inv__clave">#{compra.id_pedido}</td>
                  <td>{fecha(compra.fecha)}</td>
                  <td>{compra.nombre}</td>
                  <td>
                    <span className={claseEstado(compra.estado)}>{compra.estado}</span>
                  </td>
                  <td className="num">{importe(compra.costo_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>
                  <strong>Total del mes</strong>
                </td>
                <td className="num">
                  <strong>{importe(reporte.total)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {porProveedor.length > 0 && (
        <div className="panel admin-inv__tabla-wrap">
          <h2>Compras por proveedor</h2>
          <table className="admin-inv__tabla">
            <thead>
              <tr>
                <th scope="col">Proveedor</th>
                <th scope="col" className="num">Pedidos</th>
                <th scope="col" className="num">Total</th>
                <th scope="col" className="num">% del mes</th>
              </tr>
            </thead>
            <tbody>
              {porProveedor.map((fila) => (
                <tr key={fila.nombre}>
                  <td>{fila.nombre}</td>
                  <td className="num">{fila.pedidos}</td>
                  <td className="num">{importe(fila.total)}</td>
                  <td className="num">
                    {resumen.total > 0
                      ? `${((fila.total / resumen.total) * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
