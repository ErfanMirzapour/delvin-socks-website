"use client";
// Headless storefront logic shared by every design (/v1–/v5).
// Designs only render; all data loading, cart math and order submission
// live here so a redesign can never change how the shop behaves.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "./catalog";
import { useCart, joinCart } from "./cart";

export const CATEGORIES = [
  { value: "all", label: "همه" },
  { value: "men", label: "مردانه" },
  { value: "women", label: "زنانه" },
  { value: "kids", label: "بچگانه" },
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number]["value"];

/** Persian digits for any number. */
export function fa(n: number | string): string {
  return typeof n === "number" ? n.toLocaleString("fa-IR") : String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/**
 * The product's uploaded photo, or "" when it has none. The bundled
 * /socks/*.svg seed placeholders belong to the old design, so they count as
 * "no photo" and each design draws its own placeholder instead.
 */
export function productPhoto(p: Product): string {
  if (!p.image || p.image.startsWith("/socks/")) return "";
  return p.image;
}

export function inStock(p: Product): boolean {
  return p.stock > 0;
}

async function fetchProducts(category: string): Promise<Product[]> {
  const r = await fetch(`/api/products?category=${category}`, { cache: "no-store" });
  if (!r.ok) return [];
  return (await r.json()) as Product[];
}

export function useProducts(category: string = "all") {
  // Remember which category the data belongs to, so "loading" is derived
  // instead of set inside the effect.
  const [state, setState] = useState<{ category: string | null; data: Product[] }>({ category: null, data: [] });
  useEffect(() => {
    let alive = true;
    fetchProducts(category)
      .catch(() => [] as Product[])
      .then((data) => alive && setState({ category, data }));
    return () => {
      alive = false;
    };
  }, [category]);
  const loading = state.category !== category;
  return { data: state.data, loading };
}

export function useProduct(id: string | number) {
  const { data, loading } = useProducts("all");
  const product = data.find((p) => String(p.id) === String(id)) ?? null;
  return { product, loading, notFound: !loading && !product, related: data.filter((p) => p.id !== product?.id && p.category === product?.category).slice(0, 4) };
}

/** add() plus a short-lived "just added" flag for button feedback. */
export function useAddToCart(ms = 1400) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  function addOne(id: number, qty = 1) {
    add(id, qty);
    setJustAdded(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(null), ms);
  }
  return { add: addOne, justAdded };
}

/** Cart lines joined with live product data, plus totals and actions. */
export function useCartView() {
  const cart = useCart();
  const { data, loading } = useProducts("all");
  const rows = joinCart(cart.lines, data);
  const total = rows.reduce((s, r) => s + r.product.price * r.qty, 0);
  return {
    rows,
    total,
    count: cart.count,
    loading,
    empty: !loading && rows.length === 0,
    inc: (p: Product, qty: number) => cart.setQty(p.id, Math.min(p.stock || 99, qty + 1)),
    dec: (p: Product, qty: number) => cart.setQty(p.id, qty - 1),
    remove: cart.remove,
    clear: cart.clear,
  };
}

export type CheckoutForm = {
  fullname: string;
  phone: string;
  address: string;
  postal_code: string;
  note: string;
};

/** Checkout form state and order submission. Redirects to `successPath?id=…`. */
export function useCheckout(successPath: string) {
  const cart = useCart();
  const view = useCartView();
  const router = useRouter();
  const [form, setForm] = useState<CheckoutForm>({ fullname: "", phone: "", address: "", postal_code: "", note: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function field<K extends keyof CheckoutForm>(k: K) {
    return {
      value: form[k],
      onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value })),
    };
  }

  async function submit(e?: { preventDefault: () => void }) {
    e?.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: cart.lines }),
      });
      const j = (await res.json()) as { id: number; error?: string };
      if (!res.ok) throw new Error(j.error || "خطا");
      cart.clear();
      router.push(`${successPath}?id=${j.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ثبت سفارش");
    } finally {
      setBusy(false);
    }
  }

  return { ...view, form, field, submit, error, busy, canSubmit: !busy && view.rows.length > 0 };
}
