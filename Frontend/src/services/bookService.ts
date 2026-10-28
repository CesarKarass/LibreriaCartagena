import { mockBooks } from '../mocks/books';
import type { Book, BookFilters, LibroApi, Resena } from '../types/book';
import { apiGet, apiPost } from './api';

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

/** Detalle de un libro por id (para la ficha del libro). */
export async function getBookById(id: string): Promise<Book> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 150));
    const found = mockBooks.find((b) => b.id === id);
    if (!found) throw new Error('Libro no encontrado');
    return found;
  }
  const res = await apiGet<{ data: LibroApi }>(`/libros/${encodeURIComponent(id)}`);
  return fromApi(res.data);
}

/** Reseñas reales de un libro, persistidas en la base de datos. */
export async function getResenas(id: string): Promise<{
  resenas: Resena[];
  total: number;
  promedio: number;
}> {
  try {
    const res = await apiGet<{ data: Resena[]; total: number; promedio: number }>(
      `/libros/${encodeURIComponent(id)}/resenas`,
    );
    return { resenas: res.data ?? [], total: res.total ?? 0, promedio: Number(res.promedio ?? 0) };
  } catch {
    // Sin conexión al backend: mostramos la sección vacía en lugar de romper la ficha.
    return { resenas: [], total: 0, promedio: 0 };
  }
}

/** Publica una reseña (sólo compradores verificados). */
export async function crearResena(
  id: string,
  calificacion: number,
  texto: string,
  token: string | null,
): Promise<void> {
  await apiPost(`/libros/${encodeURIComponent(id)}/resenas`, { calificacion, texto }, token);
}

/** Opciones de los filtros, calculadas a partir del catálogo completo. */
export async function getFilterOptions() {
  const all = USE_MOCKS ? mockBooks : await fetchLibros();
  const uniq = (key: 'categoria' | 'genero' | 'formato') =>
    [...new Set(all.map((b) => b[key]).filter(Boolean))].sort();
  return { categorias: uniq('categoria'), generos: uniq('genero'), formatos: uniq('formato') };
}
