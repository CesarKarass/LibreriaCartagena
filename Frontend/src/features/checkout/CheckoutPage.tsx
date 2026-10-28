import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { precioUnitario, useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ApiError, apiGet, apiPost, apiPostCon, apiPut } from '../../services/api';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const ENVIO = 50.0;

type Metodo = 'tarjeta' | 'transferencia' | 'efectivo contra entrega';

interface Domicilio {
  id_domicilio: number;
  direccion: string;
  calle: string;
  numero: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  telefono: string;
}

interface FormDomicilio {
  calle: string;
  numero: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  telefono: string;
}

const FORM_VACIO: FormDomicilio = {
  calle: '',
  numero: '',
  colonia: '',
  ciudad: '',
  estado: '',
  codigo_postal: '',
  telefono: '',
};

const SOLO_DIGITOS = /\D/g;

function soloDigitos(valor: string): string {
  return valor.replace(SOLO_DIGITOS, '');
}

function formatearTarjeta(valor: string): string {
  return soloDigitos(valor).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatearVencimiento(valor: string): string {
  const d = soloDigitos(valor).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrecio, clearCart } = useCart();
  const { token } = useAuth();

  const [domicilios, setDomicilios] = useState<Domicilio[]>([]);
  const [domicilioId, setDomicilioId] = useState<number | 'nuevo'>('nuevo');
  const [form, setForm] = useState<FormDomicilio>(FORM_VACIO);

  const [metodo, setMetodo] = useState<Metodo>('tarjeta');
  const [tarjeta, setTarjeta] = useState({ numero: '', vencimiento: '', cvv: '', titular: '' });

  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Clave única del pedido: evita cobros dobles si el botón se pulsa dos veces.
  const [claveIdempotencia] = useState(
    () => `tk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  );

  const ahorro = items.reduce((total, { book, cantidad }) => {
    const descuento = book.precioOferta !== undefined ? book.precio - book.precioOferta : 0;
    return total + descuento * cantidad;
  }, 0);
  const totalConEnvio = totalPrecio + ENVIO;

  // Carga los domicilios guardados del cliente para ofrecerlos como opción.
  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    apiGet<{ data: Domicilio[] }>('/domicilios', undefined, token)
      .then((res) => {
        if (cancelado) return;
        const lista = res.data ?? [];
        setDomicilios(lista);
        if (lista.length > 0) {
          setDomicilioId(lista[0].id_domicilio);
          setForm({
            calle: lista[0].calle,
            numero: lista[0].numero,
            colonia: lista[0].colonia,
            ciudad: lista[0].ciudad,
            estado: lista[0].estado,
            codigo_postal: lista[0].codigo_postal,
            telefono: lista[0].telefono,
          });
        }
      })
      .catch(() => {
        // Sin domicilios previos: se queda en "nuevo".
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  const cambiar = (campo: keyof FormDomicilio) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    if (domicilioId !== 'nuevo') setDomicilioId('nuevo');
  };

  const requiereNuevo = domicilioId === 'nuevo';

  const validar = (): string | null => {
    if (items.length === 0) return 'Tu carrito está vacío.';
    if (requiereNuevo) {
      for (const [campo, valor] of Object.entries(form)) {
        if (!valor.trim()) return `Completa el campo ${campo.replace('_', ' ')}.`;
      }
      if (!/^\d{5}$/.test(form.codigo_postal)) return 'El código postal debe tener 5 dígitos.';
      if (soloDigitos(form.telefono).length < 10) return 'El teléfono debe tener 10 dígitos.';
    }
    if (metodo === 'tarjeta') {
      const digitos = soloDigitos(tarjeta.numero);
      if (digitos.length !== 16) return 'El número de tarjeta debe tener 16 dígitos.';
      const [mes, anio] = tarjeta.vencimiento.split('/');
      const m = Number(mes);
      const a = Number(anio);
      if (!/^\d{2}\/\d{2}$/.test(tarjeta.vencimiento) || m < 1 || m > 12)
        return 'El vencimiento debe tener el formato MM/AA (mes 01 a 12).';
      const ahora = new Date();
      if (a < ahora.getFullYear() % 100 || (a === ahora.getFullYear() % 100 && m < ahora.getMonth() + 1))
        return 'La tarjeta está vencida.';
      if (soloDigitos(tarjeta.cvv).length < 3) return 'El CVV debe tener 3 o 4 dígitos.';
      if (!tarjeta.titular.trim()) return 'Escribe el nombre del titular de la tarjeta.';
      // Simulación sandbox: las tarjetas terminadas en 0000 se declinan a propósito.
      if (digitos.endsWith('0000'))
        return 'Pago rechazado por la simulación de prueba: las tarjetas terminadas en 0000 se declinan. Usa otro número para continuar.';
    }
    return null;
  };

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || enviando) return;
    const problema = validar();
    setError(problema);
    if (problema) return;

    setEnviando(true);
    setError(null);
    try {
      // 1) Domicilio de envío (nuevo o existente).
      let idDomicilio = domicilioId;
      if (idDomicilio === 'nuevo') {
        const creado = await apiPost<{ id_domicilio: number }>('/domicilios', form, token);
        idDomicilio = creado.id_domicilio;
      }

      // 2) Asegura que el carrito del servidor tenga las cantidades actuales.
      await Promise.all(
        items.map((i) =>
          apiPut(`/carrito/${encodeURIComponent(i.book.id)}`, { cantidad: i.cantidad }, token),
        ),
      );

      // 3) Simulación sandbox: cualquier tarjeta pasa salvo que termine en 0000.
      const digitos = soloDigitos(tarjeta.numero);
      const sandbox = metodo !== 'tarjeta' || !digitos.endsWith('0000') ? 'aprobado' : 'rechazado';

      const venta = await apiPostCon<{ id_venta: number; total: string; estado: string }>(
        '/checkout',
        {
          id_domicilio: idDomicilio,
          tipo_pago: metodo,
          sandbox_resultado: sandbox,
        },
        token,
        { 'Idempotency-Key': claveIdempotencia },
      );

      clearCart();
      navigate(`/pedido/${venta.id_venta}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo procesar tu pedido.');
      setEnviando(false);
    }
  };

  const resumenLineas = useMemo(
    () =>
      items.map(({ book, cantidad }) => ({
        id: book.id,
        titulo: book.titulo,
        cantidad,
        unitario: precioUnitario(book),
        subtotal: precioUnitario(book) * cantidad,
      })),
    [items],
  );

  if (items.length === 0) {
    return (
      <section className="checkout checkout--vacio">
        <h1 className="checkout__titulo">Finalizar compra</h1>
        <div className="panel cart__vacio">
          <p className="cart__vacio-texto">No hay libros en tu carrito para pagar.</p>
          <Link to="/" className="btn">Explorar el catálogo</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout">
      <header className="checkout__head">
        <p className="checkout__eyebrow">Paso 2 de 2 · Pago</p>
        <h1 className="checkout__titulo">Datos de Envío y Pago</h1>
        <p className="checkout__subtitulo">
          Los datos se envían de forma segura a la API de Librería Cartagena.
        </p>
      </header>

      <form className="checkout__layout" onSubmit={enviar} noValidate>
        <div className="checkout__columnas">
          {/* ---------------- Domicilio ---------------- */}
          <section className="panel checkout__bloque" aria-labelledby="tit-envio">
            <h2 id="tit-envio">Domicilio de Envío</h2>

            {domicilios.length > 0 && (
              <div className="checkout__domicilios" role="radiogroup" aria-label="Domicilios guardados">
                {domicilios.map((d) => (
                  <label className="checkout__domicilio" key={d.id_domicilio}>
                    <input
                      type="radio"
                      name="domicilio"
                      checked={domicilioId === d.id_domicilio}
                      onChange={() => setDomicilioId(d.id_domicilio)}
                    />
                    <span>
                      <strong>{d.direccion}</strong>
                      {d.ciudad}, {d.estado} · C.P. {d.codigo_postal} · {d.telefono}
                    </span>
                  </label>
                ))}
                <label className="checkout__domicilio">
                  <input
                    type="radio"
                    name="domicilio"
                    checked={requiereNuevo}
                    onChange={() => setDomicilioId('nuevo')}
                  />
                  <span><strong>Otro domicilio</strong> (llenar los datos de abajo)</span>
                </label>
              </div>
            )}

            <div className="checkout__campos">
              <label className="field">
                <span>Calle</span>
                <input value={form.calle} onChange={cambiar('calle')} disabled={!requiereNuevo} autoComplete="street-address" />
              </label>
              <label className="field field--corto">
                <span>Número</span>
                <input value={form.numero} onChange={cambiar('numero')} disabled={!requiereNuevo} />
              </label>
              <label className="field">
                <span>Colonia</span>
                <input value={form.colonia} onChange={cambiar('colonia')} disabled={!requiereNuevo} />
              </label>
              <label className="field">
                <span>Ciudad</span>
                <input value={form.ciudad} onChange={cambiar('ciudad')} disabled={!requiereNuevo} autoComplete="address-level2" />
              </label>
              <label className="field">
                <span>Estado</span>
                <input value={form.estado} onChange={cambiar('estado')} disabled={!requiereNuevo} autoComplete="address-level1" />
              </label>
              <label className="field field--corto">
                <span>Código Postal</span>
                <input value={form.codigo_postal} onChange={cambiar('codigo_postal')} disabled={!requiereNuevo} inputMode="numeric" maxLength={5} />
              </label>
              <label className="field">
                <span>Teléfono</span>
                <input value={form.telefono} onChange={cambiar('telefono')} disabled={!requiereNuevo} inputMode="tel" autoComplete="tel" />
              </label>
            </div>
          </section>

          {/* ---------------- Método de pago ---------------- */}
          <section className="panel checkout__bloque" aria-labelledby="tit-pago">
            <h2 id="tit-pago">Método de Pago</h2>

            <div className="checkout__metodos" role="radiogroup" aria-label="Método de pago">
              <label className={`checkout__metodo${metodo === 'tarjeta' ? ' checkout__metodo--on' : ''}`}>
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'tarjeta'}
                  onChange={() => setMetodo('tarjeta')}
                />
                <span className="checkout__metodo-nombre">Tarjeta de Crédito o Débito</span>
                <span className="checkout__metodo-nota">Visa · Mastercard · AMEX (simulación sandbox)</span>
              </label>

              <label className={`checkout__metodo${metodo === 'transferencia' ? ' checkout__metodo--on' : ''}`}>
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'transferencia'}
                  onChange={() => setMetodo('transferencia')}
                />
                <span className="checkout__metodo-nombre">Transferencia SPEI</span>
                <span className="checkout__metodo-nota">Te enviamos la CLABE para completar el pago</span>
              </label>

              <label className={`checkout__metodo${metodo === 'efectivo contra entrega' ? ' checkout__metodo--on' : ''}`}>
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'efectivo contra entrega'}
                  onChange={() => setMetodo('efectivo contra entrega')}
                />
                <span className="checkout__metodo-nombre">Efectivo Contra Entrega</span>
                <span className="checkout__metodo-nota">Pagas al recibir tu pedido en casa</span>
              </label>
            </div>

            {metodo === 'tarjeta' && (
              <div className="checkout__tarjeta">
                <label className="field field--ancho">
                  <span>Número de Tarjeta</span>
                  <input
                    value={tarjeta.numero}
                    onChange={(e) => setTarjeta((t) => ({ ...t, numero: formatearTarjeta(e.target.value) }))}
                    placeholder="0000 0000 0000 0000"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={19}
                  />
                </label>
                <label className="field">
                  <span>Vencimiento (MM/AA)</span>
                  <input
                    value={tarjeta.vencimiento}
                    onChange={(e) => setTarjeta((t) => ({ ...t, vencimiento: formatearVencimiento(e.target.value) }))}
                    placeholder="MM/AA"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                  />
                </label>
                <label className="field field--corto">
                  <span>CVV</span>
                  <input
                    value={tarjeta.cvv}
                    onChange={(e) => setTarjeta((t) => ({ ...t, cvv: soloDigitos(e.target.value).slice(0, 4) }))}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    type="password"
                  />
                </label>
                <label className="field field--ancho">
                  <span>Nombre del Titular</span>
                  <input
                    value={tarjeta.titular}
                    onChange={(e) => setTarjeta((t) => ({ ...t, titular: e.target.value }))}
                    placeholder="Como aparece en la tarjeta"
                    autoComplete="cc-name"
                  />
                </label>
                <p className="checkout__sandbox">
                  Entorno de prueba: no se realiza ningún cargo real. Cualquier tarjeta se aprueba;
                  usa un número terminado en <strong>0000</strong> para simular un rechazo.
                </p>
              </div>
            )}

            {metodo === 'transferencia' && (
              <div className="checkout__spei">
                <p><strong>CLABE Interbancaria:</strong> 012180001112223344</p>
                <p><strong>Beneficiario:</strong> Librería El País de las Maravillas, S.A. de C.V.</p>
                <p><strong>Referencia:</strong> se genera al confirmar el pedido. Sube el comprobante
                  desde tu banco y un administrador validará el pago.</p>
              </div>
            )}

            {metodo === 'efectivo contra entrega' && (
              <div className="checkout__spei">
                <p>Prepara el importe exacto: <strong>{money.format(totalConEnvio)}</strong>.</p>
                <p>Nuestro repartidor te llevará el pedido y cobrará al entregarlo.</p>
              </div>
            )}
          </section>
        </div>

        {/* ---------------- Resumen ---------------- */}
        <aside className="panel checkout__resumen" aria-label="Resumen del pedido">
          <h2>Resumen del Pedido</h2>
          <ul className="checkout__lineas">
            {resumenLineas.map((l) => (
              <li key={l.id}>
                <span className="checkout__linea-titulo">{l.titulo}</span>
                <span className="checkout__linea-cant">×{l.cantidad}</span>
                <span className="checkout__linea-importe">{money.format(l.subtotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="cart__lineas">
            <div>
              <dt>Subtotal de libros</dt>
              <dd>{money.format(totalPrecio)}</dd>
            </div>
            <div>
              <dt>Costo de Envío</dt>
              <dd>{money.format(ENVIO)}</dd>
            </div>
            {ahorro > 0 && (
              <div className="cart__ahorro">
                <dt>Descuentos aplicados</dt>
                <dd style={{ color: '#2f6b4f' }}>- {money.format(ahorro)}</dd>
              </div>
            )}
          </dl>

          <div className="cart__total">
            <span>Total Pagado</span>
            <strong>{money.format(totalConEnvio)}</strong>
          </div>

          {error && (
            <p className="checkout__error" role="alert">{error}</p>
          )}

          <button type="submit" className="btn checkout__pagar" disabled={enviando}>
            {enviando ? 'Procesando pedido…' : 'Confirmar y Pagar'}
          </button>

          <Link to="/carrito" className="cart__seguir">
            ← Volver al carrito
          </Link>

          <p className="cart__nota">
            Al confirmar aceptas los Términos y Condiciones de Librería Cartagena.
          </p>
        </aside>
      </form>
    </section>
  );
}
