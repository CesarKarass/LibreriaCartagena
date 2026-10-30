import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiGet } from '../../../services/api';
import type { LibroInventario, ResumenInventario } from '../../../types/book';

/**
 * Catálogo del inventario para los selectores de libro.
 * Se comparte entre las pestañas de compras y de mermas/devoluciones.
 */
export function useLibrosInventario(token: string | null) {
  const [libros, setLibros] = useState<LibroInventario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      const res = await apiGet<{ data: LibroInventario[]; resumen: ResumenInventario }>(
        '/admin/inventario',
        undefined,
        token,
      );
      setLibros(res.data ?? []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudo cargar el catálogo de libros.',
      );
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return { libros, cargando, error, recargar: cargar };
}
