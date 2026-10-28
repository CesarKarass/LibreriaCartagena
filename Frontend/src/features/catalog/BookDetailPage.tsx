import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { StarDisplay } from '../../components/books/StarRating';
import { ReviewItem } from '../../components/books/ReviewForm';
import { crearResena, getBookById, getResenas } from '../../services/bookService';
import { ApiError } from '../../services/api';
import type { Book, Resena } from '../../types/book';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { usuario, autenticado, token } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promedio, setPromedio] = useState(0);
  const [totalResenas, setTotalResenas] = useState(0);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [agregado, setAgregado] = useState(false);
  const [valoracion, setValoracion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorResena, setErrorResena] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    setLoading(true);
    // Ficha del libro + reseñas reales persistidas en la base de datos.
    Promise.all([getBookById(id), getResenas(id)])
      .then(([data, opiniones]) => {
        if (cancelado) return;
        setBook(data);
        setResenas(opiniones.resenas);
        setTotalResenas(opiniones.total);
        setPromedio(opiniones.promedio);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el libro. Inténtalo de nuevo.');
        setLoading(false);
      });
    return () => { cancelado = true; };
  }, [id]);

  const refrescarResenas = async () => {
    if (!id) return;
    const opiniones = await getResenas(id);
    setResenas(opiniones.resenas);
    setTotalResenas(opiniones.total);
    setPromedio(opiniones.promedio);
  };

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book, 1);
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1500);
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valoracion || !id || !token || enviando) return;
    setEnviando(true);
    setErrorResena(null);
    try {
      await crearResena(id, valoracion, comentario.trim() || 'Sin comentario adicional.', token);
      await refrescarResenas();
      setEnviado(true);
      setValoracion(0);
      setComentario('');
    } catch (err) {
      setErrorResena(
        err instanceof ApiError ? err.message : 'No se pudo enviar la reseña. Inténtalo de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#6b5069' }}>
        Cargando libro…
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#9b1c1c' }}>
        <p>{error ?? 'Libro no encontrado'}</p>
        <Link to="/" style={{ color: 'var(--turquesa)', textDecoration: 'none' }}>
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  const precioOferta = book.precioOferta ?? book.precio;
  const tieneDescuento = book.precioOferta !== undefined;

  return (
    <div className="book-detail">
      {/* Ficha del libro */}
      <div className="book-detail__ficha">
        <div className="book-detail__portada">
          {book.portadaUrl
            ? <img src={book.portadaUrl} alt={`Portada de ${book.titulo}`} />
            : <span>Portada: {book.titulo}</span>}
        </div>

        <div className="book-detail__info">
          <span className="book-detail__eyebrow">Ficha del Libro</span>
          <h1 className="book-detail__titulo">{book.titulo}</h1>
          <p className="book-detail__autor">Autor: <strong>{book.autor}</strong></p>

          <div className="book-detail__ficha-grid">
            <span><strong>ISBN:</strong> {book.isbn === 'Sin ISBN' ? '—' : book.isbn}</span>
            <span><strong>Editorial:</strong> {book.editorial}</span>
            <span><strong>Categoría:</strong> {book.categoria}</span>
            <span><strong>Formato:</strong> {book.formato}</span>
          </div>

          <p className="book-detail__stock">
            Stock disponible: <strong>{book.stock}</strong> unidades en la madriguera
          </p>

          {totalResenas > 0 && (
            <div className="book-detail__rating">
              <StarDisplay value={promedio} size={20} />
              <span className="book-detail__rating-texto">
                {promedio.toFixed(1)} de 5 · {totalResenas} reseña{totalResenas !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="book-detail__precio-fila">
            {tieneDescuento ? (
              <>
                <s className="book-detail__precio-tachado">{money.format(book.precio)}</s>
                <span className="book-detail__precio">{money.format(precioOferta)}</span>
              </>
            ) : (
              <span className="book-detail__precio">{money.format(book.precio)}</span>
            )}
          </div>

          <div className="book-detail__acciones">
            <button
              type="button"
              className={`btn${agregado ? ' btn--agregado' : ''}`}
              onClick={handleAddToCart}
              disabled={book.stock <= 0}
            >
              {book.stock <= 0 ? 'Agotado' : agregado ? '¡Agregado al carrito!' : 'Agregar al Carrito'}
            </button>
          </div>
          <p className="book-detail__nota">
            {book.stock <= 0
              ? 'Este libro no está disponible por el momento.'
              : 'El libro se agregará a tu cesta de compras.'}
          </p>
        </div>
      </div>

      {/* Comentarios y Reseñas */}
      <section className="reviews">
        <h2 className="reviews__titulo">Comentarios y Reseñas de Lectores</h2>

        {totalResenas > 0 ? (
          <div className="reviews__lista">
            {resenas.map((r) => (
              <ReviewItem
                key={r.id}
                author={r.autor}
                rating={r.calificacion ?? 0}
                comment={r.texto}
                date={r.fecha ?? undefined}
                verified
              />
            ))}
          </div>
        ) : (
          <p className="reviews__vacio">Sé el primero en dejar tu reseña de este libro.</p>
        )}

        <div className="reviews__form-panel">
          <h3>Escribe tu reseña (Valoración: Comprador verificado)</h3>
          {autenticado && usuario ? (
            enviado ? (
              <div className="reviews__exito">
                <p>¡Gracias por tu reseña!</p>
                <button type="button" className="btn btn--outline" onClick={() => setEnviado(false)}>
                  Escribir otra reseña
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="reviews__form">
                <label className="reviews__label">Calificación (Estrellas)</label>
                <StarDisplay value={valoracion} size={24} className="reviews__stars-edit" />
                <div className="reviews__stars-row" role="radiogroup" aria-label="Tu calificación">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setValoracion(n)}
                      disabled={enviando}
                      aria-label={`${n} estrellas`}
                      className={valoracion >= n ? 'reviews__star reviews__star--on' : 'reviews__star'}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <label className="reviews__label" htmlFor="comentario-libro">Tu comentario sobre el libro</label>
                <textarea
                  id="comentario-libro"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comparte tu experiencia de lectura…"
                  rows={4}
                  disabled={enviando}
                />

                <button type="submit" className="btn" disabled={!valoracion || enviando}>
                  {enviando ? 'Enviando…' : 'Enviar Reseña'}
                </button>

                {errorResena && (
                  <p className="checkout__error" role="alert">{errorResena}</p>
                )}
              </form>
            )
          ) : (
            <p className="reviews__login">
              Inicia sesión para dejar tu reseña.{' '}
              <Link to="/login">Iniciar sesión</Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
