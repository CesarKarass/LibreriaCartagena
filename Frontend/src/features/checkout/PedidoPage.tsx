import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError, apiBlob, apiGet } from '../../services/api';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const ENVIO = 50.0;

const METODOS: Record<number, string> = {
  1: 'Tarjeta de Crédito o Débito',
  2: 'Transferencia SPEI',
  5: 'Efectivo Contra Entrega',
};

interface Venta {
  id_venta: number;
  id_usuario: number;
  id_tipo_pago: number;
  fecha: string;
  total: string | number;
  estado: string;
  estado_pago: string;
  referencia_pago?: string | null;
}

interface VentaItem {
  id_libro: string;
  titulo: string;
  cantidad: number;
  precio_unitario: string | number;
}

interface EstadoPedido {
  venta: Venta;
  items: VentaItem[];
}

function folioDe(venta: Venta): string {
  const anio = new Date(venta.fecha).getFullYear() || new Date().getFullYear();
  return `TKT-${anio}-${String(venta.id_venta).padStart(3, '0')}`;
}

function fechaLegible(valor: string): string {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

export default function PedidoPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [pedido, setPedido] = useState<EstadoPedido | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    if (!id || !token) return;
    let cancelado = false;
    apiGet<EstadoPedido>(`/ventas/${encodeURIComponent(id)}`, undefined, token)
      .then((datos) => {
        if (!cancelado) setPedido(datos);
      })
      .catch((err: unknown) => {
        if (!cancelado) setError(err instanceof ApiError ? err.message : 'No se pudo cargar tu pedido.');
      });
    return () => {
      cancelado = true;
    };
  }, [id, token]);

  const descargarPdf = useCallback(async () => {
    if (!token || !id || descargando) return;
    setDescargando(true);
    setError(null);
    try {
      // Un <a> normal no envía el JWT: hay que descargar el blob con Authorization.
      const blob = await apiBlob(`/ventas/${encodeURIComponent(id)}/ticket.pdf`, token);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `comprobante-${id}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo descargar el comprobante.');
    } finally {
      setDescargando(false);
    }
  }, [token, id, descargando]);

  if (error && !pedido) {
    return (
      <section className="pedido">
        <div className="panel pedido__error">
          <h1>No pudimos cargar tu pedido</h1>
          <p>{error}</p>
          <Link to="/" className="btn">Volver al catálogo</Link>
        </div>
      </section>
    );
  }

  if (!pedido) {
    return (
      <section className="pedido">
        <p className="state">Cargando tu comprobante…</p>
      </section>
    );
  }

  const { venta, items } = pedido;
  const subtotal = items.reduce(
    (suma, item) => suma + Number(item.precio_unitario) * item.cantidad,
    0,
  );
  const total = Number(venta.total);
  const metodo = METODOS[venta.id_tipo_pago] ?? `Método #${venta.id_tipo_pago}`;

  return (
    <section className="pedido">
      <header className="pedido__hero">
        <div className="pedido__check" aria-hidden="true">✓</div>
        <p className="pedido__eyebrow">Pedido confirmado</p>
        <h1>¡Gracias por tu compra!</h1>
        <p className="pedido__subtitulo">
          Tu pedido está registrado en Librería Cartagena. Te avisaremos por correo cuando salga
          para envío.
        </p>
      </header>

      <article className="panel ticket" aria-label="Comprobante de compra">
        <div className="ticket__head">
          <div>
            <p className="ticket__marca">Cartagena</p>
            <p className="ticket__folio">Folio <strong>#{folioDe(venta)}</strong></p>
          </div>
          <div className="ticket__meta">
            <p><span>Fecha</span><strong>{fechaLegible(venta.fecha)}</strong></p>
            <p><span>Método</span><strong>{metodo}</strong></p>
            <p>
              <span>Estado</span>
              <strong>
                {venta.estado}
                {venta.estado_pago && venta.estado_pago !== 'Pendiente'
                  ? ` · ${venta.estado_pago}`
                  : ''}
              </strong>
            </p>
            {venta.referencia_pago && (
              <p><span>Referencia</span><strong>{venta.referencia_pago}</strong></p>
            )}
          </div>
        </div>

        <table className="ticket__tabla">
          <thead>
            <tr>
              <th scope="col">Concepto</th>
              <th scope="col" className="ticket__num">Cant.</th>
              <th scope="col" className="ticket__num">Precio</th>
              <th scope="col" className="ticket__num">Importe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id_libro}>
                <td>{item.titulo}</td>
                <td className="ticket__num">{item.cantidad}</td>
                <td className="ticket__num">{money.format(Number(item.precio_unitario))}</td>
                <td className="ticket__num">
                  {money.format(Number(item.precio_unitario) * item.cantidad)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ticket__totales">
          <div>
            <dt>Subtotal</dt>
            <dd>{money.format(subtotal)}</dd>
          </div>
          <div>
            <dt>Costo de Envío</dt>
            <dd>{money.format(ENVIO)}</dd>
          </div>
          <div className="ticket__total">
            <dt>Total Pagado</dt>
            <dd>{money.format(total + ENVIO)}</dd>
          </div>
        </dl>

        <p className="ticket__nota">
          Conserva este comprobante; el número de folio sirve para dar seguimiento a tu pedido.
        </p>
      </article>

      {error && <p className="checkout__error" role="alert">{error}</p>}

      <div className="pedido__acciones">
        <button
          type="button"
          className="btn"
          onClick={() => void descargarPdf()}
          disabled={descargando}
        >
          {descargando ? 'Preparando PDF…' : 'Descargar Comprobante en PDF'}
        </button>
        <button type="button" className="btn btn--outline" onClick={() => window.print()}>
          Imprimir Ticket
        </button>
        <Link to="/" className="btn btn--outline">Seguir comprando</Link>
        <Link to="/cuenta" className="btn btn--outline">Mis pedidos</Link>
      </div>
    </section>
  );
}
