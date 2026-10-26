import { useEffect, useState } from 'react';
import { getBooks, getFilterOptions } from '../services/bookService';
import type { Book, BookFilters } from '../types/book';

export function useBooks(filters: BookFilters) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBooks(filters)
      .then((data) => { if (!cancelled) { setBooks(data); setError(null); } })
      .catch(() => { if (!cancelled) setError('No se pudo cargar el catálogo. Revisa que el backend esté en marcha.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.categoria, filters.genero, filters.formato]);

  return { books, loading, error };
}

export function useFilterOptions() {
  const [options, setOptions] = useState({ categorias: [] as string[], generos: [] as string[], formatos: [] as string[] });
  useEffect(() => { getFilterOptions().then(setOptions).catch(() => undefined); }, []);
  return options;
}
