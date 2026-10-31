import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import {
  actualizarEnvio,
  listarEnviosAdmin,
  validarEntregaAdmin,
} from '../../services/tiendaService';
import type { EnvioAdmin } from '../../types/tienda';

const ESTADOS = ['Procesando', 'En Preparación', 'En Camino', 'Entregado'] as const;

const ESTADO_INFO: Record<string, { etiqueta: string; clase: string }> = {
  Procesando: { etiqueta: 'Procesando', clase: 'proceso' },
  'En Preparación': { etiqueta: 'En preparación', clase: 'preparacion' },
  'En Camino': { etiqueta: 'En camino', clase: 'camino' },
  Entregado: { etiqueta: 'Entregado', clase: 'entregado' },
  Cancelado: { etiqueta: 'Cancelado', clase: 'cancelado' },
};

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function folio(id: number): string {
  return `#ORD-${String(id).padStart(4, '0')}`;
}

function parseFecha(valor: string | null): Date | null {
  if (!valor) return null;
  const normalizado = valor.includes('T') ? valor : valor.replace(' ', 'T');
  const texto = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalizado) ? normalizado : `${normalizado}Z`;
  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatearFecha(valor: string | null): string {
  const fecha = parseFecha(valor);
  if (!fecha) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha);
}

function infoEstado(estado: string) {
  return ESTADO_INFO[estado] ?? { etiqueta: estado, clase: 'proceso' };
}

export default function AdminLogisticaPage() {
  const { token } = useAuth();
  const [envios, setEnvios] = useState<EnvioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [tab, setTab] = useState<'guias' | 'validacion'>('guias');
  const [busqueda, setBusqueda] = useState('');
  const [guias, setGuias] = useState<Record<number, string>>({});
  const [estados, setEstados] = useState<Record<number, string>>({});
  const [guardando, setGuardando] = useState<number | null>(null);
  const [validando, setValidando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setError(null);
    try {
      const datos = await listarEnviosAdmin(token);
      setEnvios(datos);
      setGuias(Object.fromEntries(datos.map((envio) => [envio.id_envio, envio.numero_guia ?? ''])));
      setEstados(Object.fromEntries(datos.map((envio) => [envio.id_envio, envio.estado])));
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudieron cargar los envíos.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return envios;
    return envios.filter((envio) =>
      [envio.cliente, envio.correo, envio.numero_guia, envio.libros, folio(envio.id_venta)]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(texto)),
    );
  }, [envios, busqueda]);

  const resumen = useMemo(
    () => ({
      total: envios.length,
      pendientes: envios.filter((e) => e.estado !== 'Entregado' && e.estado !== 'Cancelado').length,
      enCamino: envios.filter((e) => e.estado === 'En Camino').length,
      entregados: envios.filter((e) => e.estado === 'Entregado').length,
    }),
    [envios],
  );

  const guardar = async (envio: EnvioAdmin) => {
    if (!token) return;
    const estado = estados[envio.id_envio] ?? envio.estado;
    const guia = (guias[envio.id_envio] ?? '').trim();
    if ((estado === 'En Camino' || estado === 'Entregado') && !guia) {
      setError('Asigna un número de guía antes de poner el envío en camino o entregado.');
      return;
    }
    setGuardando(envio.id_envio);
    setError(null);
    setAviso(null);
    try {
      await actualizarEnvio(
        envio.id_envio,
        { estado, numero_guia: guia || null },
        token,
      );
      setAviso(`Envío ${folio(envio.id_venta)} actualizado a "${estado}".`);
      await cargar();
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudo actualizar el envío.');
    } finally {
      setGuardando(null);
    }
  };

  const validar = async (envio: EnvioAdmin) => {
    if (!token) return;
    setValidando(envio.id_envio);
    setError(null);
    setAviso(null);
    try {
      await validarEntregaAdmin(envio.id_envio, token);
      setAviso(`Entrega validada para ${folio(envio.id_venta)}.`);
      await cargar();
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudo validar la entrega.');
    } finally {
      setValidando(null);
    }
  };

  const opcionesEstado = (envio: EnvioAdmin) => {
    const actual = ESTADOS.indexOf(envio.estado as (typeof ESTADOS)[number]);
    return ESTADOS.map((estado, indice) => {
      const deshabilitado =
        envio.estado === 'Cancelado' || (actual >= 0 && indice < actual) || (actual === 3 && indice < 3);
      return { estado, deshabilitado };
    });
  };

  return (
    <div className="admin-inv admin-logistica">
      <header className="admin-inv__head">
        <div>
          <p className="admin-inv__eyebrow">Administración</p>
          <h1>Panel de Rastreo y Asignación de Guías de Envío</h1>
          <p className="admin-inv__subtitulo">
            Actualiza el estado de cada envío, asigna la guía manual y valida la recepción del
            cliente. Las órdenes se muestran de la más reciente a la más antigua.
          </p>
        </div>
        <div className="admin-inv__acciones">
          <Link className="btn btn--outline" to="/admin">
            Volver al panel
          </Link>
          <button type="button" className="btn" onClick={() => void cargar()}>
            Actualizar
          </button>
        </div>
      </header>

      <section className="admin-inv__alertas" aria-label="Resumen de envíos">
        <div className="alerta alerta--valor">
          <span className="alerta__valor">{resumen.total}</span>
          <span className="alerta__texto">Envíos totales</span>
        </div>
        <div className="alerta alerta--alto">
          <span className="alerta__valor">{resumen.pendientes}</span>
          <span className="alerta__texto">Pendientes de entrega</span>
        </div>
        <div className="alerta">
          <span className="alerta__valor">{resumen.enCamino}</span>
          <span className="alerta__texto">En camino</span>
        </div>
        <div className="alerta alerta--ok">
          <span className="alerta__valor">{resumen.entregados}</span>
          <span className="alerta__texto">Entregados</span>
        </div>
      </section>

      {aviso && (
        <p className="admin-inv__aviso" role="status">
          {aviso}
        </p>
      )}
      {error && (
        <p className="pedidos-page__error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-prov__tabs" role="tablist" aria-label="Secciones de logística">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'guias'}
          className="admin-prov__tab"
          onClick={() => setTab('guias')}
        >
          Rastreo y guías
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'validacion'}
          className="admin-prov__tab"
          onClick={() => setTab('validacion')}
        >
          Validación de entregas
        </button>
      </div>

      <section className="panel admin-inv__tabla-wrap">
        <div className="admin-inv__toolbar">
          <label className="admin-inv__buscar">
            <span>Buscar envío</span>
            <input
              type="search"
              placeholder="Folio, cliente, guía o libro…"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </label>
          <span className="admin-inv__conteo">
            {filtrados.length} de {envios.length} envíos
          </span>
        </div>

        {cargando ? (
          <p className="state" aria-live="polite">
            Cargando envíos…
          </p>
        ) : tab === 'guias' ? (
          <table className="admin-inv__tabla admin-logistica__tabla">
            <thead>
              <tr>
                <th>Folio Orden</th>
                <th>Cliente y Destino</th>
                <th>Libros del Pedido</th>
                <th>Número de Guía (Manual)</th>
                <th>Estado del Envío</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((envio) => (
                <tr key={envio.id_envio}>
                  <td>
                    <strong className="admin-inv__clave">{folio(envio.id_venta)}</strong>
                    <span className="admin-inv__rango">{money.format(Number(envio.total))}</span>
                  </td>
                  <td>
                    <strong>{envio.cliente}</strong>
                    <span className="admin-inv__autor">
                      {envio.direccion || envio.ciudad || 'Sin domicilio'}
                    </span>
                    <span className="admin-inv__rango">{envio.telefono || envio.correo || '—'}</span>
                  </td>
                  <td className="admin-logistica__libros">{envio.libros || 'Sin detalle'}</td>
                  <td>
                    <input
                      className="admin-logistica__guia"
                      type="text"
                      maxLength={100}
                      placeholder="Asignar guía…"
                      value={guias[envio.id_envio] ?? ''}
                      onChange={(evento) =>
                        setGuias((actuales) => ({
                          ...actuales,
                          [envio.id_envio]: evento.target.value,
                        }))
                      }
                      aria-label={`Número de guía para ${folio(envio.id_venta)}`}
                    />
                  </td>
                  <td>
                    <select
                      className="admin-logistica__estado"
                      value={estados[envio.id_envio] ?? envio.estado}
                      onChange={(evento) =>
                        setEstados((actuales) => ({
                          ...actuales,
                          [envio.id_envio]: evento.target.value,
                        }))
                      }
                      disabled={envio.estado === 'Cancelado'}
                      aria-label={`Estado del envío ${folio(envio.id_venta)}`}
                    >
                      {opcionesEstado(envio).map((opcion) => (
                        <option key={opcion.estado} value={opcion.estado} disabled={opcion.deshabilitado}>
                          {opcion.estado}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn admin-logistica__guardar"
                      disabled={guardando === envio.id_envio}
                      onClick={() => void guardar(envio)}
                    >
                      {guardando === envio.id_envio ? 'Guardando…' : 'Guardar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="admin-inv__tabla admin-logistica__tabla">
            <thead>
              <tr>
                <th>Folio Orden</th>
                <th>Cliente / Destinatario</th>
                <th>Número de Guía</th>
                <th>Estatus en Ruta</th>
                <th>Recepción del Cliente</th>
                <th>Acción del Sistema</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((envio) => {
                const info = infoEstado(envio.estado);
                const tieneGuia = Boolean(envio.numero_guia?.trim());
                return (
                  <tr key={envio.id_envio}>
                    <td>
                      <strong className="admin-inv__clave">{folio(envio.id_venta)}</strong>
                    </td>
                    <td>
                      <strong>{envio.cliente}</strong>
                      <span className="admin-inv__autor">
                        {envio.direccion || envio.ciudad || 'Sin domicilio'}
                      </span>
                    </td>
                    <td>
                      {envio.numero_guia ? (
                        <span className="admin-logistica__guia-texto">{envio.numero_guia}</span>
                      ) : (
                        <span className="admin-inv__rango">Sin asignar</span>
                      )}
                    </td>
                    <td>
                      <span className={`pill pill--envio-${info.clase}`}>{info.etiqueta}</span>
                    </td>
                    <td>
                      {envio.confirmado_cliente ? (
                        <span className="admin-logistica__recibido">
                          ✓ Recibido ({formatearFecha(envio.fecha_entrega)})
                        </span>
                      ) : envio.estado === 'Entregado' ? (
                        <span className="admin-logistica__recibido">
                          Validado por logística ({formatearFecha(envio.fecha_entrega)})
                        </span>
                      ) : (
                        <span className="admin-inv__rango">Pendiente de firma/recibo</span>
                      )}
                    </td>
                    <td>
                      {envio.estado === 'En Camino' ? (
                        <button
                          type="button"
                          className="btn admin-logistica__validar"
                          disabled={!tieneGuia || validando === envio.id_envio}
                          onClick={() => void validar(envio)}
                          title={tieneGuia ? 'Confirmar la entrega' : 'Asigna una guía primero'}
                        >
                          {validando === envio.id_envio ? 'Validando…' : '✓ Validar entrega'}
                        </button>
                      ) : envio.estado === 'Entregado' ? (
                        <span className="admin-logistica__validado">Validado en el sistema</span>
                      ) : (
                        <span className="admin-inv__rango">Pon el envío “En Camino” para validar</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!cargando && filtrados.length === 0 && (
          <p className="state">No hay envíos que coincidan con la búsqueda.</p>
        )}
      </section>
    </div>
  );
}
