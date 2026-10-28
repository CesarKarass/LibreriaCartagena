import { useState, type FormEvent } from 'react';
import { StarDisplay, StarRating } from './StarRating';

interface ReviewFormProps {
  bookId?: string;
  onSubmit?: (review: { rating: number; comment: string }) => void;
  initialRating?: number;
  className?: string;
}

export function ReviewForm({
  onSubmit,
  initialRating = 0,
  className = '',
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    if (onSubmit) {
      onSubmit({ rating, comment });
    }
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className={`review-success ${className}`} style={{ padding: '1rem', background: '#f0f7ee', border: '1px solid #2f6b4f', borderRadius: '6px', color: '#2f6b4f' }}>
        <p style={{ margin: 0, fontWeight: 700 }}>¡Gracias por tu reseña!</p>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Tu calificación ha sido registrada.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`review-form ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--tinta)' }}>Calificación</label>
        <StarRating value={rating} onChange={setRating} size={22} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--tinta)' }}>
          Tu comentario sobre el libro
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comparte tu experiencia de lectura…"
          rows={4}
          style={{
            width: '100%',
            padding: '0.7rem',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            border: '1px solid #c9a9c8',
            borderRadius: '6px',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!rating || submitting}
        style={{
          width: 'fit-content',
          padding: '0.6rem 1.4rem',
          background: !rating ? '#9a8a99' : 'var(--turquesa)',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          font: '700 0.9rem var(--serif)',
          cursor: !rating || submitting ? 'not-allowed' : 'pointer',
          opacity: !rating || submitting ? 0.6 : 1,
        }}
      >
        {submitting ? 'Enviando…' : 'Enviar Reseña'}
      </button>
    </form>
  );
}

interface ReviewItemProps {
  author: string;
  rating: number;
  comment: string;
  date?: string;
  verified?: boolean;
}

export function ReviewItem({ author, rating, comment, date, verified = false }: ReviewItemProps) {
  return (
    <div style={{ padding: '0.9rem', borderBottom: '1px solid #e8dcc4', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--tinta)', fontSize: '0.9rem' }}>{author}</span>
        {verified && (
          <span style={{ fontSize: '0.7rem', color: 'var(--turquesa-osc)', background: '#e7f3f7', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
            Comprador verificado
          </span>
        )}
        <span style={{ fontSize: '0.75rem', color: '#7a5a78' }}>{date ?? ''}</span>
      </div>
      <StarDisplay value={rating} size={16} />
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: '#4a4a4a', lineHeight: 1.4 }}>{comment}</p>
    </div>
  );
}
