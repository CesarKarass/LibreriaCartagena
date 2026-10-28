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
  descripcion?: string | null;
  stock_minimo?: number;
  stock_maximo?: number;
  stock_bajo?: boolean;
  stock_alto?: boolean;
}

/** Reseña persistida en la tabla `comentario`. */
export interface Resena {
  id: number;
  calificacion: number | null;
  texto: string;
  fecha: string | null;
  autor: string;
}

/** Fila del panel de administración (GET /api/admin/inventario). */
export interface LibroInventario {
  id_libro: string;
  titulo: string;
  autor: string;
  precio: string;
  descuento_porcentaje: string;
  precio_oferta: string;
  stock: number;
  stock_minimo: number;
  stock_maximo: number;
  categoria: string | null;
  editorial: string | null;
  isbn: string | null;
  genero: string | null;
  formato: string | null;
  imagen_portada: string | null;
  descripcion: string | null;
  alerta: 'bajo' | 'alto' | 'ok';
}

export interface ResumenInventario {
  titulos: number;
  unidades: number;
  bajo_stock: number;
  sobre_stock: number;
  valor_inventario: string;
}

export interface BookFilters {
  q: string;
  categoria: string;
  genero: string;
  formato: string;
}
