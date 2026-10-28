import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { apiGet, apiPut } from '../services/api';
import { getBookById } from '../services/bookService';
import type { Book } from '../types/book';
import { useAuth } from './AuthContext';

export interface CartItem {
  book: Book;
  cantidad: number;
}

interface CartValue {
  items: CartItem[];
  totalItems: number;
  totalPrecio: number;
  /** true mientras el carrito del servidor se está cargando. */
  sincronizando: boolean;
  addToCart: (book: Book, cantidad?: number) => void;
  removeFromCart: (id: string) => void;
  setCantidad: (id: string, cantidad: number) => void;
  clearCart: () => void;
}

const CLAVE_CARRITO = 'cartagena.carrito.v1';

const CartContext = createContext<CartValue | null>(null);

/** Precio que realmente paga el cliente (oferta si existe). */
export function precioUnitario(book: Book): number {
  return book.precioOferta ?? book.precio;
}

function esItemValido(valor: unknown): valor is CartItem {
  if (typeof valor !== 'object' || valor === null) return false;
  const item = valor as Partial<CartItem>;
  return (
    typeof item.cantidad === 'number' &&
    Number.isFinite(item.cantidad) &&
    item.cantidad > 0 &&
    typeof item.book === 'object' &&
    item.book !== null &&
    typeof (item.book as Book).id === 'string' &&
    typeof (item.book as Book).titulo === 'string' &&
    typeof (item.book as Book).precio === 'number'
  );
}

function leerCarrito(): CartItem[] {
  try {
    const texto = localStorage.getItem(CLAVE_CARRITO);
    if (!texto) return [];
    const datos: unknown = JSON.parse(texto);
    if (!Array.isArray(datos)) return [];
    return datos
      .filter(esItemValido)
      .map((item) => ({
        ...item,
        cantidad: Math.max(1, Math.min(item.cantidad, Math.max(1, item.book.stock))),
      }));
  } catch {
    return [];
  }
}

function guardarCarrito(items: CartItem[]): void {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  } catch {
    // Si localStorage está lleno o bloqueado, el carrito sigue en memoria.
  }
}

interface LineaServidor {
  id_libro: string;
  cantidad: number;
}

/** Descarga el carrito del usuario en el servidor y lo completa con la ficha de cada libro. */
async function cargarCarritoServidor(token: string): Promise<CartItem[]> {
  const res = await apiGet<{ items?: LineaServidor[] }>('/carrito', undefined, token);
  const lineas = res.items ?? [];
  const completos = await Promise.all(
    lineas.map(async (linea) => {
      try {
        const book = await getBookById(linea.id_libro);
        const cantidad = Math.max(0, Math.min(linea.cantidad, Math.max(1, book.stock)));
        return cantidad > 0 ? { book, cantidad } : null;
      } catch {
        return null; // El libro ya no existe: se omite.
      }
    }),
  );
  return completos.filter((item): item is CartItem => item !== null);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { autenticado, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>(leerCarrito);
  const [sincronizando, setSincronizando] = useState(false);

  const tokenRef = useRef(token);
  const autRef = useRef(autenticado);
  tokenRef.current = token;
  autRef.current = autenticado;

  // Refleja cambios de sesión sin disparar efectos en la carga inicial.
  const sesionPrevia = useRef<boolean | null>(null);

  /** Empuja una cantidad al carrito del servidor (si hay sesión). */
  const enviarCantidad = useCallback(async (idLibro: string, cantidad: number) => {
    if (!autRef.current || !tokenRef.current) return;
    try {
      await apiPut(`/carrito/${encodeURIComponent(idLibro)}`, { cantidad }, tokenRef.current);
    } catch {
      // Si falla, el servidor se reconciliará en el próximo inicio de sesión.
    }
  }, []);

  // El carrito de invitado vive en este dispositivo (nunca con sesión activa).
  useEffect(() => {
    if (!autenticado) guardarCarrito(items);
  }, [items, autenticado]);

  // Transiciones de sesión: al entrar fusionamos el carrito de invitado con el del
  // servidor; al salir dejamos el carrito guardado en el servidor.
  useEffect(() => {
    const previa = sesionPrevia.current;
    sesionPrevia.current = autenticado;

    if (previa === true && !autenticado) {
      // Cerrar sesión: el carrito queda guardado en el servidor (no como invitado),
      // para que no se dupliquen las cantidades al volver a entrar.
      setItems([]);
      guardarCarrito([]);
      return;
    }

    if (!autenticado || !token) return; // Sin sesión no hay nada que sincronizar.
    if (previa === true) return; // Ya había sesión (sólo cambió el token).

    // previa === null  → recarga de página con sesión: traemos el carrito del servidor.
    // previa === false → inicio de sesión: fusionamos el carrito de invitado.
    setSincronizando(true);
    (async () => {
      try {
        const servidor = await cargarCarritoServidor(token);
        const invitado = leerCarrito();
        const porId = new Map(servidor.map((i) => [i.book.id, i] as const));
        for (const invitadoItem of invitado) {
          const previo = porId.get(invitadoItem.book.id);
          if (previo) {
            porId.set(invitadoItem.book.id, {
              ...previo,
              cantidad: Math.min(
                previo.cantidad + invitadoItem.cantidad,
                Math.max(1, invitadoItem.book.stock),
              ),
            });
          } else {
            porId.set(invitadoItem.book.id, invitadoItem);
          }
        }
        const fusion = [...porId.values()];
        setItems(fusion);
        guardarCarrito([]); // El carrito de invitado ya quedó en el servidor.
        await Promise.all(fusion.map((i) => enviarCantidad(i.book.id, i.cantidad)));
      } catch {
        setItems(leerCarrito());
      } finally {
        setSincronizando(false);
      }
    })();
  }, [autenticado, token, enviarCantidad]);

  const addToCart = useCallback(
    (book: Book, cantidad = 1) => {
      if (book.stock <= 0 || cantidad <= 0) return;
      const encontrado = items.find((i) => i.book.id === book.id);
      const nueva = encontrado
        ? Math.min(encontrado.cantidad + cantidad, book.stock)
        : Math.min(cantidad, book.stock);
      const siguiente = encontrado
        ? items.map((i) =>
            i.book.id === book.id
              ? { ...i, cantidad: nueva, book: { ...i.book, stock: book.stock } }
              : i,
          )
        : [...items, { book, cantidad: nueva }];
      setItems(siguiente);
      void enviarCantidad(book.id, nueva);
    },
    [items, enviarCantidad],
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.book.id !== id));
      void enviarCantidad(id, 0);
    },
    [enviarCantidad],
  );

  const setCantidad = useCallback(
    (id: string, cantidad: number) => {
      setItems((prev) =>
        prev.flatMap((item) => {
          if (item.book.id !== id) return [item];
          if (cantidad <= 0) return [];
          return [{ ...item, cantidad: Math.min(cantidad, Math.max(1, item.book.stock)) }];
        }),
      );
      void enviarCantidad(id, Math.max(0, cantidad));
    },
    [enviarCantidad],
  );

  const clearCart = useCallback(() => {
    const actuales = items;
    setItems([]);
    for (const item of actuales) void enviarCantidad(item.book.id, 0);
  }, [items, enviarCantidad]);

  const value = useMemo<CartValue>(() => {
    const totalItems = items.reduce((n, i) => n + i.cantidad, 0);
    const totalPrecio = items.reduce(
      (total, i) => total + precioUnitario(i.book) * i.cantidad,
      0,
    );
    return {
      items,
      totalItems,
      totalPrecio,
      sincronizando,
      addToCart,
      removeFromCart,
      setCantidad,
      clearCart,
    };
  }, [items, sincronizando, addToCart, removeFromCart, setCantidad, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
