import { Link } from 'react-router-dom';
import { precioUnitario, useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function CartPage() {
  const { items, totalItems, totalPrecio, setCantidad, removeFromCart, clearCart, sincronizando } = useCart();
  const { autenticado } = useAuth();

  // Al recargar con sesión, el carrito se descarga del servidor: evitamos parpadeo de "vacío".
  if (items.length === 0 && sincronizando) {
    return (
      <section className="cart cart--vacio">
        <h1 className="cart__title">Tu carrito</h1>
        <p className="state" aria-live="polite">Sincronizando tu carrito…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="cart cart--vacio">
        <h1 className="cart__title">Tu carrito</h1>
        <div className="panel cart__vacio">
          <p className="cart__vacio-icono" aria-hidden="true">🛒</p>
          <p className="cart__vacio-texto">Todavía no has agregado ningún libro.</p>
          <Link to="/" className="btn cart__vacio-btn">Explorar el catálogo</Link>
        </div>
      </section>
    );
  }

  const ahorro = items.reduce((total, { book, cantidad }) => {
    const descuento = book.precioOferta !== undefined ? book.precio - book.precioOferta : 0;
    return total + descuento * cantidad;
  }, 0);

  const envio = 50.00;
  const totalConEnvio = totalPrecio + envio;

  return (
    <section className="cart">
      <header className="cart__header">
        <div>
          <p className="cart__eyebrow">Cesta de Libros Seleccionados</p>
          <h1 className="cart__title">Tu Carrito</h1>
          <p className="cart__subtitulo">
            {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} en tu cesta
          </p>
        </div>
        <button type="button" className="btn btn--outline cart__limpiar" onClick={clearCart}>
          Vaciar carrito
        </button>
      </header>

      <div className="cart__layout">
        <ul className="cart__items">
          {items.map(({ book, cantidad }) => {
            const unitario = precioUnitario(book);
            const maximo = Math.max(1, book.stock);
            return (
              <li className="cart-item" key={book.id}>
                <div className="cart-item__cover">
                  {book.portadaUrl
                    ? <img src={book.portadaUrl} alt={`Portada de ${book.titulo}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: '0.6rem', color: '#6b5069' }}>{book.titulo}</span>}
                </div>

                <div className="cart-item__info">
                  <h2 className="cart-item__titulo">{book.titulo}</h2>
                  <p className="cart-item__autor">{book.autor}</p>
                  <p className="cart-item__meta">
                    {book.formato} · {book.categoria}
                  </p>
                  <p className="cart-item__unitario">
                    {money.format(unitario)} <span>c/u</span>
                  </p>
                  <p className="cart-item__stock">
                    {book.stock > 0 ? `${book.stock} disponibles` : 'Agotado'}
                  </p>
                </div>

                <div className="cart-item__acciones">
                  <div className="qty" role="group" aria-label={`Cantidad de ${book.titulo}`}>
                    <button
                      type="button"
                      onClick={() => setCantidad(book.id, cantidad - 1)}
                      aria-label="Quitar una unidad"
                      disabled={cantidad <= 1}
                    >
                      −
                    </button>
                    <span aria-live="polite">{cantidad}</span>
                    <button
                      type="button"
                      onClick={() => setCantidad(book.id, cantidad + 1)}
                      aria-label="Agregar una unidad"
                      disabled={cantidad >= maximo}
                    >
                      +
                    </button>
                  </div>

                  <p className="cart-item__subtotal">{money.format(unitario * cantidad)}</p>

                  <button
                    type="button"
                    className="cart-item__quitar"
                    onClick={() => removeFromCart(book.id)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="panel cart__resumen" aria-label="Resumen de compra" style={{ position: 'sticky', top: '1rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--tinta)', borderBottom: '1px solid #c9a9c8', paddingBottom: '0.5rem' }}>Resumen del Pedido</h2>
          <dl className="cart__lineas">
            <div>
              <dt>Subtotal de libros</dt>
              <dd>{money.format(totalPrecio)}</dd>
            </div>
            <div>
              <dt>Envío a Domicilio</dt>
              <dd>{money.format(envio)}</dd>
            </div>
            {ahorro > 0 && (
              <div className="cart__ahorro">
                <dt>Descuentos aplicados</dt>
                <dd style={{ color: '#2f6b4f' }}>- {money.format(ahorro)}</dd>
              </div>
            )}
          </dl>

          <div className="cart__total" style={{ marginTop: '1rem' }}>
            <span>Total a Pagar</span>
            <strong>{money.format(totalConEnvio)}</strong>
          </div>

          <Link
            to="/checkout"
            className="btn cart__pagar"
            style={{ width: '100%', marginTop: '1rem', textAlign: 'center', textDecoration: 'none', display: 'block' }}
          >
            Proceder al Pago / Checkout
          </Link>
          {!autenticado && (
            <p className="cart__invitado">
              Para comprar necesitas una cuenta. Puedes seguir juntando libros aquí; al pagar te
              pediremos <Link to="/login" state={{ from: '/checkout' }}>iniciar sesión</Link> o{' '}
              <Link to="/registro" state={{ from: '/checkout' }}>registrarte</Link>.
            </p>
          )}
          <Link to="/" className="cart__seguir" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', textDecoration: 'none', color: 'var(--turquesa-osc)', fontSize: '0.85rem' }}>
            Seguir comprando
          </Link>

          <p className="cart__nota">
            {autenticado
              ? 'Tu carrito queda guardado en tu cuenta: puedes continuar la compra desde cualquier dispositivo.'
              : 'Tu carrito se guarda en este dispositivo mientras exploras. Al pagar te pediremos crear una cuenta.'}
          </p>
        </aside>
      </div>
    </section>
  );
}
