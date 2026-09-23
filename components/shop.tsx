"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog";

export function useProducts(category: string) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?category=${category}`, { cache: "no-store" })
      .then((r) => r.json() as Promise<Product[]>)
      .then(setData)
      .finally(() => setLoading(false));
  }, [category]);
  return { data, loading };
}

export function StockBadge({ p }: { p: Product }) {
  if (p.stock <= 0)
    return (
      <span className="inline-block px-3 py-1 rounded-full bg-neutral-200 text-neutral-600 text-sm font-bold">
        ناموجود
      </span>
    );
  return (
    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
      {p.stock.toLocaleString("fa-IR")} جفت موجود
    </span>
  );
}
