"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Product } from "./catalog";

export interface CartLine {
  id: number;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  add: (id: number, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "socks_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  const api = useMemo<CartCtx>(
    () => ({
      lines,
      add: (id, qty = 1) =>
        setLines((prev) => {
          const f = prev.find((l) => l.id === id);
          if (f)
            return prev.map((l) =>
              l.id === id ? { ...l, qty: Math.min(99, l.qty + qty) } : l
            );
          return [...prev, { id, qty }];
        }),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.id !== id)
            : prev.map((l) => (l.id === id ? { ...l, qty } : l))
        ),
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      clear: () => setLines([]),
      count: lines.reduce((s, l) => s + l.qty, 0),
    }),
    [lines]
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("CartProvider missing");
  return v;
}

export function joinCart(
  lines: CartLine[],
  products: Product[]
): Array<{ product: Product; qty: number }> {
  const map = new Map(products.map((p) => [p.id, p]));
  return lines
    .map((l) => ({ product: map.get(l.id), qty: l.qty }))
    .filter((x): x is { product: Product; qty: number } => Boolean(x.product));
}
