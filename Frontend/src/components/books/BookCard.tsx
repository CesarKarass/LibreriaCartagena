import { useEffect, useRef, useState } from 'react';
import { useCart } from '../../context/CartContext';
import type { Book } from '../../types/book';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function BookCard({ book }: { book: Book }) {
  const { addToCart } = useCart();
  const enOferta = book.precioOferta !== undefined;
  const [imagenFallida, setImagenFallida] = useState(false);
  const [agregado, setAgregado] = useState(false);
  const temporizador = useRef<number | null>(null);

  useEffect(() => {
    setImagenFallida(false);
  }, [book.portadaUrl]);

  useEffect(
    () => () => {
      if (temporizador.current) window.clearTimeout(temporizador.current);
    },
    [],
  );

  const agregar = () => {
    addToCart(book);
    setAgregado(true);
    if (temporizador.current) window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setAgregado(false), 1400);
  };

  return (
    <article className="card">
      {enOferta && <span className="card__tag">Oferta</span>}
      <div className="card__cover">
        {book.portadaUrl && !imagenFallida
          ? (
            <img
              src={book.portadaUrl}
              alt={`Portada de ${book.titulo}`}
              loading="lazy"
              decoding="async"
              onError={() => setImagenFallida(true)}
            />
          )
          : <span>Portada: {book.titulo}</span>}
      </div>
      <h3 className="card__title">{book.titulo}</h3>
      <p className="card__author">{book.autor}</p>
      <p className="card__meta">
        {book.isbn && book.isbn !== 'Sin ISBN' ? `ISBN: ${book.isbn} · ` : ''}
        {book.editorial}
      </p>
      <p className="card__price">
        {enOferta && <s>{money.format(book.precio)}</s>}
        <strong>{money.format(book.precioOferta ?? book.precio)}</strong>
      </p>
      <button
        type="button"
        className={`btn${agregado ? ' btn--agregado' : ''}`}
        onClick={agregar}
        disabled={book.stock <= 0}
      >
        {book.stock <= 0 ? 'Agotado' : agregado ? '¡Agregado al carrito!' : 'Agregar al Carrito'}
      </button>
    </article>
  );
}
