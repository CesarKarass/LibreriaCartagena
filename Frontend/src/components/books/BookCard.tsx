import { useCart } from '../../context/CartContext';
import type { Book } from '../../types/book';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function BookCard({ book }: { book: Book }) {
  const { addToCart } = useCart();
  const enOferta = book.precioOferta !== undefined;

  return (
    <article className="card">
      {enOferta && <span className="card__tag">Oferta</span>}
      <div className="card__cover">
        {book.portadaUrl
          ? <img src={book.portadaUrl} alt={`Portada de ${book.titulo}`} />
          : <span>Portada: {book.titulo}</span>}
      </div>
      <h3 className="card__title">{book.titulo}</h3>
      <p className="card__author">{book.autor}</p>
      <p className="card__meta">ISBN: {book.isbn} | Editorial: {book.editorial}</p>
      <p className="card__price">
        {enOferta && <s>{money.format(book.precio)}</s>}
        <strong>{money.format(book.precioOferta ?? book.precio)}</strong>
      </p>
      <button className="btn" onClick={() => addToCart(book)} disabled={book.stock <= 0}>
        {book.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
      </button>
    </article>
  );
}
