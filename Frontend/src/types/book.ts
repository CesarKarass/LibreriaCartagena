export interface Book {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  editorial: string;
  precio: number;
  /** Precio con descuento; si existe, `precio` se muestra tachado */
  precioOferta?: number;
  categoria: string;
  genero: string;
  formato: string;
  portadaUrl?: string;
  stock: number;
}

/** Forma exacta en que responde GET /api/libros (snake_case) */
export interface LibroApi {
  id_libro: string;
  titulo: string;
  autor: string;
  precio: number | string;
  stock: number;
  isbn: string | null;
  editorial: string | null;
  categoria: string | null;
  genero: string | null;
  formato: string | null;
  imagen_portada: string | null;
  descuento_porcentaje: number | string;
  precio_oferta: string;
}

export interface BookFilters {
  q: string;
  categoria: string;
  genero: string;
  formato: string;
}
