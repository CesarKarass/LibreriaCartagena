import { Link } from 'react-router-dom';
import { precioUnitario, useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function CartPage() {
  const { items, totalItems, totalPrecio, setCantidad, removeFromCart, clearCart } = useCart();
  const { autenticado } = useAuth();

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

  return (
    <section className="cart">
      <header className="cart__header">
        <div>
          <p className="cart__eyebrow">Compra</p>
          <h1 className="cart__title">Tu carrito</h1>
          <p className="cart__subtitulo">
            {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} listos para llevar
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
                    ? <img src={book.portadaUrl} alt={`Portada de ${book.titulo}`} loading="lazy" />
                    : <span>{book.titulo}</span>}
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

        <aside className="panel cart__resumen" aria-label="Resumen de compra">
          <h2>Resumen</h2>
          <dl className="cart__lineas">
            <div>
              <dt>Artículos</dt>
              <dd>{totalItems}</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{money.format(totalPrecio)}</dd>
            </div>
            {ahorro > 0 && (
              <div className="cart__ahorro">
                <dt>Ahorras</dt>
                <dd>−{money.format(ahorro)}</dd>
              </div>
            )}
            <div>
              <dt>Envío</dt>
              <dd>Se calcula al finalizar</dd>
            </div>
          </dl>

          <p className="cart__total">
            <span>Total</span>
            <strong>{money.format(totalPrecio)}</strong>
          </p>

          <Link
            to={autenticado ? '/cuenta' : '/login'}
            state={autenticado ? undefined : { from: '/carrito' }}
            className="btn cart__pagar"
          >
            {autenticado ? 'Ir a mi cuenta' : 'Inicia sesión para pagar'}
          </Link>
          <Link to="/" className="cart__seguir">Seguir comprando</Link>

          <p className="cart__nota">
            Tu carrito se guarda en este dispositivo. El pago en línea estará disponible muy pronto.
          </p>
        </aside>
      </div>
    </section>
  );
}
