import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { confirmarEntrega, obtenerMisCompras, solicitarGarantia } from '../../services/tiendaService';
import type { Compra, CompraItem } from '../../types/tienda';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const MOTIVOS = [
  'Defecto de impresión / Páginas rotas',
  'Libro incorrecto',
  'Producto dañado en el envío',
  'Falta un ejemplar del pedido',
  'Otro motivo',
];

const ESTADOS_ENVIO: Record<string, { etiqueta: string; clase: string }> = {
  Procesando: { etiqueta: 'Procesando', clase: 'proceso' },
  'En Preparación': { etiqueta: 'En preparación', clase: 'preparacion' },
  'En Camino': { etiqueta: 'En camino', clase: 'camino' },
  Entregado: { etiqueta: 'Entregado', clase: 'entregado' },
  Cancelado: { etiqueta: 'Cancelado', clase: 'cancelado' },
};

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
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha);
}

function formatearFechaHora(valor: string | null): string {
  const fecha = parseFecha(valor);
  if (!fecha) return '—';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha);
}

function folio(id: number): string {
  return `#ORD-${String(id).padStart(4, '0')}`;
}

/** Días completos transcurridos desde la entrega (para el plazo de garantía). */
function diasDesdeEntrega(valor: string | null): number | null {
  const fecha = parseFecha(valor);
  if (!fecha) return null;
  return Math.floor((Date.now() - fecha.getTime()) / 86_400_000);
}

function diasGarantia(valor: string | null): number | null {
  const dias = diasDesdeEntrega(valor);
  if (dias === null) return null;
  const restantes = 7 - dias;
  return restantes >= 0 ? restantes : null;
}

function claveOpcion(compra: Compra, item: CompraItem): string {
  return `${compra.id_venta}:${item.id_libro}`;
}

interface OpcionGarantia {
  compra: Compra;
  item: CompraItem;
  dias: number;
}

export default function MisPedidosPage() {
  const { token } = useAuth();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [seleccion, setSeleccion] = useState('');
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [descripcion, setDescripcion] = useState('');
  const [enviandoGarantia, setEnviandoGarantia] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setError(null);
    try {
      setCompras(await obtenerMisCompras(token));
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudo cargar tu historial de compras.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const opciones = useMemo<OpcionGarantia[]>(() => {
    return compras.flatMap((compra) => {
      if (compra.estado_envio !== 'Entregado') return [];
      const dias = diasGarantia(compra.fecha_entrega);
      if (dias === null) return [];
      return compra.items
        .filter(
          (item) =>
            !compra.garantias.some(
              (garantia) => garantia.id_libro === item.id_libro && garantia.estado !== 'Rechazada',
            ),
        )
        .map((item) => ({ compra, item, dias }));
    });
  }, [compras]);

  useEffect(() => {
    if (opciones.length === 0) {
      setSeleccion('');
      return;
    }
    const existe = opciones.some((opcion) => claveOpcion(opcion.compra, opcion.item) === seleccion);
    if (!existe) setSeleccion(claveOpcion(opciones[0].compra, opciones[0].item));
  }, [opciones, seleccion]);

  const opcionElegida = opciones.find(
    (opcion) => claveOpcion(opcion.compra, opcion.item) === seleccion,
  );

  const confirmar = async (compra: Compra) => {
    if (!token || !compra.id_envio) return;
    setConfirmando(compra.id_envio);
    setError(null);
    setAviso(null);
    try {
      await confirmarEntrega(compra.id_envio, token);
      setAviso(`Confirmaste la entrega del pedido ${folio(compra.id_venta)}. ¡Gracias por avisarnos!`);
      await cargar();
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudo confirmar la entrega.');
    } finally {
      setConfirmando(null);
    }
  };

  const enviarGarantia = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!token || !opcionElegida) return;
    setEnviandoGarantia(true);
    setError(null);
    setAviso(null);
    try {
      const texto = descripcion.trim();
      await solicitarGarantia(
        {
          id_venta: opcionElegida.compra.id_venta,
          id_libro: opcionElegida.item.id_libro,
          motivo: texto ? `${motivo}: ${texto}` : motivo,
        },
        token,
      );
      setDescripcion('');
      setMotivo(MOTIVOS[0]);
      setAviso('Tu solicitud de garantía fue enviada. Te contactaremos para dar seguimiento.');
      await cargar();
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudo enviar la solicitud de garantía.');
    } finally {
      setEnviandoGarantia(false);
    }
  };

  return (
    <div className="pedidos-page">
      <header className="pedidos-page__head">
        <div>
          <p className="pedidos-page__eyebrow">Mi cuenta</p>
          <h1>Historial de Compras y Garantías</h1>
          <p className="pedidos-page__subtitulo">
            Consulta tus pedidos, rastrea el envío, confirma la entrega y solicita garantías.
          </p>
        </div>
        <p className="pedidos-page__conteo">
          {compras.length} {compras.length === 1 ? 'pedido registrado' : 'pedidos registrados'} en tu
          madriguera
        </p>
      </header>

      {aviso && (
        <p className="pedidos-page__aviso" role="status">
          {aviso}
        </p>
      )}
      {error && (
        <p className="pedidos-page__error" role="alert">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="state" aria-live="polite">
          Cargando tus compras…
        </p>
      ) : compras.length === 0 ? (
        <section className="pedidos-page__vacio panel">
          <h2>Aún no tienes compras</h2>
          <p>Cuando hagas tu primer pedido aparecerá aquí con su guía y estado de entrega.</p>
          <Link className="btn" to="/">
            Explorar el catálogo
          </Link>
        </section>
      ) : (
        <div className="pedidos-page__layout">
          <section className="pedidos-lista" aria-label="Compras realizadas">
            {compras.map((compra) => {
              const estado = ESTADOS_ENVIO[compra.estado_envio ?? ''] ?? {
                etiqueta: compra.estado_envio ?? 'Sin envío',
                clase: 'proceso',
              };
              const puedeConfirmar =
                compra.estado_envio === 'En Camino' && !compra.confirmado_cliente;
              const garantiaActiva = compra.garantias.find((g) => g.estado !== 'Rechazada');
              const dias = diasGarantia(compra.fecha_entrega);
              const portada = compra.items[0]?.imagen_portada;

              return (
                <article className="compra-card" key={compra.id_venta}>
                  <div className="compra-card__cover">
                    {portada ? (
                      <img src={portada} alt="" />
                    ) : (
                      <span>
                        Folio
                        <strong>{folio(compra.id_venta)}</strong>
                      </span>
                    )}
                  </div>

                  <div className="compra-card__body">
                    <div className="compra-card__top">
                      <div>
                        <h2>
                          Pedido {folio(compra.id_venta)}{' '}
                          <span className="compra-card__fecha">({formatearFecha(compra.fecha)})</span>
                        </h2>
                        <p className="compra-card__libros">
                          {compra.items.map((item) => `${item.titulo} (x${item.cantidad})`).join(', ') ||
                            'Sin artículos'}
                        </p>
                      </div>
                      <div className="compra-card__estados">
                        <span className={`pill pill--envio-${estado.clase}`}>{estado.etiqueta}</span>
                        {compra.confirmado_cliente && <span className="pill pill--ok">✓ Recibido</span>}
                        {garantiaActiva && (
                          <span className="pill pill--garantia">
                            Garantía {garantiaActiva.estado.toLowerCase()}
                            {dias !== null ? ` (${dias} días)` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="compra-card__meta">
                      <p className="compra-card__total">{money.format(Number(compra.total))} MXN</p>
                      <p>
                        <span>Guía:</span>{' '}
                        {compra.numero_guia ?? 'Pendiente de asignar por logística'}
                      </p>
                      <p>
                        <span>Pago:</span> {compra.metodo_pago} · {compra.estado_pago}
                      </p>
                      <p>
                        <span>Entrega:</span>{' '}
                        {compra.direccion_completa || compra.direccion || 'Domicilio no registrado'}
                      </p>
                      {compra.fecha_entrega && (
                        <p>
                          <span>Recibido:</span> {formatearFechaHora(compra.fecha_entrega)}
                        </p>
                      )}
                    </div>

                    {compra.garantias.length > 0 && (
                      <ul className="compra-card__garantias">
                        {compra.garantias.map((garantia) => (
                          <li key={garantia.id_solicitud}>
                            <strong>{garantia.titulo}</strong> · {garantia.estado} ·{' '}
                            {formatearFecha(garantia.fecha)}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="compra-card__acciones">
                      <Link className="btn-mini" to={`/pedido/${compra.id_venta}`}>
                        Ver comprobante
                      </Link>
                      {puedeConfirmar && (
                        <button
                          type="button"
                          className="btn compra-card__confirmar"
                          disabled={confirmando === compra.id_envio}
                          onClick={() => void confirmar(compra)}
                        >
                          {confirmando === compra.id_envio ? 'Confirmando…' : '✓ Confirmar entrega'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="garantia-panel panel" aria-labelledby="garantia-titulo">
            <h2 id="garantia-titulo">Solicitar Garantía / Devolución</h2>
            <p className="garantia-panel__nota">
              Las garantías aplican exclusivamente dentro del plazo de 7 días posteriores a la
              recepción del pedido.
            </p>

            {opciones.length === 0 ? (
              <p className="garantia-panel__vacio">
                No tienes artículos elegibles en este momento. La opción se habilita cuando un pedido
                aparece como <strong>Entregado</strong> y está dentro del plazo de 7 días.
              </p>
            ) : (
              <form className="garantia-panel__form" onSubmit={enviarGarantia}>
                <label className="field">
                  <span>Pedido elegible</span>
                  <select value={seleccion} onChange={(evento) => setSeleccion(evento.target.value)}>
                    {opciones.map((opcion) => (
                      <option
                        key={claveOpcion(opcion.compra, opcion.item)}
                        value={claveOpcion(opcion.compra, opcion.item)}
                      >
                        {folio(opcion.compra.id_venta)} · {opcion.item.titulo} ({opcion.dias} días)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Motivo de la garantía</span>
                  <select value={motivo} onChange={(evento) => setMotivo(evento.target.value)}>
                    {MOTIVOS.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Descripción del problema</span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    placeholder="Describe el inconveniente con tu ejemplar…"
                    value={descripcion}
                    onChange={(evento) => setDescripcion(evento.target.value)}
                  />
                </label>

                <button type="submit" className="btn" disabled={enviandoGarantia || !opcionElegida}>
                  {enviandoGarantia ? 'Enviando…' : 'Enviar Solicitud de Garantía'}
                </button>
              </form>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
