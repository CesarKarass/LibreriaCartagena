import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import FiltersPanel from '../../components/books/FiltersPanel';
import { useBooks, useFilterOptions } from '../../hooks/useBooks';
import type { BookFilters } from '../../types/book';

export default function HomePage() {
  const [params, setParams] = useSearchParams();

  const filters: BookFilters = useMemo(() => ({
    q: params.get('q') ?? '',
    categoria: params.get('categoria') ?? '',
    genero: params.get('genero') ?? '',
    formato: params.get('formato') ?? '',
  }), [params]);

  const { books, loading, error } = useBooks(filters);
  const options = useFilterOptions();

  const setFilter = (key: 'categoria' | 'genero' | 'formato', value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  return (
    <div className="catalog">
      <FiltersPanel filters={filters} options={options} onChange={setFilter} />
      <section aria-live="polite">
        {loading && <p className="state">Cargando libros…</p>}
        {error && <p className="state state--error">{error}</p>}
        {!loading && !error && books.length === 0 && (
          <p className="state">No encontramos libros con esos criterios. Prueba con otro título, autor o ISBN, o quita algún filtro.</p>
        )}
        {!loading && !error && books.length > 0 && (
          <div className="grid">
            {books.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </section>
    </div>
  );
}
