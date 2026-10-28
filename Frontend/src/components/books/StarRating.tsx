import { useState } from 'react';

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

export function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 20,
  className = '',
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const displayValue = readonly || !onChange ? value : hover || value;

  const stars = [1, 2, 3, 4, 5];

  const handleStarClick = (n: number) => {
    if (!readonly && onChange) onChange(n);
  };

  return (
    <div
      className={`star-rating ${className}`}
      role="radiogroup"
      aria-label="Calificación"
      style={{ display: 'inline-flex', gap: '0.25rem' }}
    >
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => handleStarClick(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          disabled={readonly}
          aria-label={n + ' estrellas'}
          aria-checked={displayValue >= n}
          style={{
            background: 'none',
            border: 'none',
            cursor: readonly ? 'default' : 'pointer',
            padding: 0,
            fontSize: size,
            lineHeight: 1,
            color:
              displayValue >= n
                ? 'var(--oro)'
                : '#c9a9c8',
            transition: 'color 0.15s ease',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ value = 0, size = 18, className = '' }: { value?: number; size?: number; className?: string }) {
  const full = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`star-display ${className}`} style={{ display: 'inline-flex', gap: '0.15rem', alignItems: 'center' }}>
      {stars.map((n) => {
        if (n <= full) {
          return (
            <span key={n} style={{ fontSize: size, color: 'var(--oro)', lineHeight: 1 }}>
              ★
            </span>
          );
        }
        if (n === full + 1 && hasHalf) {
          return (
            <span key={n} style={{ fontSize: size, color: 'var(--oro)', lineHeight: 1 }}>
              ☆
            </span>
          );
        }
        return (
          <span key={n} style={{ fontSize: size, color: '#c9a9c8', lineHeight: 1 }}>
            ☆
          </span>
        );
      })}
      <span style={{ marginLeft: '0.3rem', fontSize: `${size * 0.85}px`, color: '#6b5069' }}>
        ({value.toFixed(1)})
      </span>
    </div>
  );
}
