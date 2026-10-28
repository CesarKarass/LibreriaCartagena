import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Book } from '../types/book';

export interface CartItem {
  book: Book;
  cantidad: number;
}

interface CartValue {
  items: CartItem[];
  totalItems: number;
  totalPrecio: number;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(leerCarrito);

  useEffect(() => {
    guardarCarrito(items);
  }, [items]);

  const addToCart = useCallback((book: Book, cantidad = 1) => {
    if (book.stock <= 0 || cantidad <= 0) return;
    setItems((prev) => {
      const encontrado = prev.find((i) => i.book.id === book.id);
      if (encontrado) {
        const nueva = Math.min(encontrado.cantidad + cantidad, book.stock);
        return prev.map((i) =>
          i.book.id === book.id
            ? { ...i, cantidad: nueva, book: { ...i.book, stock: book.stock } }
            : i,
        );
      }
      return [...prev, { book, cantidad: Math.min(cantidad, book.stock) }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.book.id !== id));
  }, []);

  const setCantidad = useCallback((id: string, cantidad: number) => {
    setItems((prev) =>
      prev.flatMap((item) => {
        if (item.book.id !== id) return [item];
        if (cantidad <= 0) return [];
        return [{ ...item, cantidad: Math.min(cantidad, Math.max(1, item.book.stock)) }];
      }),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

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
      addToCart,
      removeFromCart,
      setCantidad,
      clearCart,
    };
  }, [items, addToCart, removeFromCart, setCantidad, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
