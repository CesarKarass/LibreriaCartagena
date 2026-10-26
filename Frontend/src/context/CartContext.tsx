import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Book } from '../types/book';

interface CartItem { book: Book; cantidad: number }

interface CartValue {
  items: CartItem[];
  totalItems: number;
  addToCart: (book: Book) => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartValue>(
    () => ({
      items,
      totalItems: items.reduce((n, i) => n + i.cantidad, 0),
      addToCart: (book) =>
        setItems((prev) => {
          const found = prev.find((i) => i.book.id === book.id);
          return found
            ? prev.map((i) => (i.book.id === book.id ? { ...i, cantidad: i.cantidad + 1 } : i))
            : [...prev, { book, cantidad: 1 }];
        }),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
