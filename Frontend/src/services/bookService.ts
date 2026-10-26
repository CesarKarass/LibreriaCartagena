import { mockBooks } from '../mocks/books';
import type { Book, BookFilters, LibroApi } from '../types/book';
import { apiGet } from './api';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function filterLocal(books: Book[], f: BookFilters): Book[] {
  const q = normalize(f.q.trim());
  return books.filter(
    (b) =>
      (!q || [b.titulo, b.autor, b.isbn].some((t) => normalize(t).includes(q))) &&
      (!f.categoria || b.categoria === f.categoria) &&
      (!f.genero || b.genero === f.genero) &&
      (!f.formato || b.formato === f.formato),
  );
}

/** Convierte la respuesta del backend (snake_case) al modelo del frontend. */
function fromApi(l: LibroApi): Book {
  const precio = Number(l.precio);
  const enOferta = Number(l.descuento_porcentaje) > 0;
  return {
    id: l.id_libro,
    titulo: l.titulo,
    autor: l.autor,
    isbn: l.isbn ?? 'Sin ISBN',
    editorial: l.editorial ?? 'Sin editorial',
    precio,
    precioOferta: enOferta ? Number(l.precio_oferta) : undefined,
    categoria: l.categoria ?? '',
    genero: l.genero ?? '',
    formato: l.formato ?? '',
    portadaUrl: l.imagen_portada || undefined,
    stock: l.stock,
  };
}

async function fetchLibros(params?: Record<string, string>): Promise<Book[]> {
  const res = await apiGet<{ data: LibroApi[] }>('/libros', params);
  return res.data.map(fromApi);
}

export async function getBooks(filters: BookFilters): Promise<Book[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 250));
    return filterLocal(mockBooks, filters);
  }
  return fetchLibros({
    q: filters.q,
    categoria: filters.categoria,
    genero: filters.genero,
    formato: filters.formato,
  });
}

/** Opciones de los filtros, calculadas a partir del catálogo completo. */
export async function getFilterOptions() {
  const all = USE_MOCKS ? mockBooks : await fetchLibros();
  const uniq = (key: 'categoria' | 'genero' | 'formato') =>
    [...new Set(all.map((b) => b[key]).filter(Boolean))].sort();
  return { categorias: uniq('categoria'), generos: uniq('genero'), formatos: uniq('formato') };
}
