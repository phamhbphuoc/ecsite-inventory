"use client";

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/products/ProductCard';

export type Product = {
  _id: string;
  title: string;
  images?: string[];
  price: { selling: number; original?: number };
  stock?: number;
  status?: 'draft' | 'active' | 'archived';
  category?: string;
  order?: number;
};

type Grouped = Record<string, Product[]>;

function groupProducts(products: Product[]): Grouped {
  const grouped = products.reduce<Grouped>((acc, item) => {
    const key = item.category || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => {
      const ao = a.order ?? Number.MAX_SAFE_INTEGER;
      const bo = b.order ?? Number.MAX_SAFE_INTEGER;
      if (ao === bo) return 0;
      return ao - bo;
    });
  });

  return grouped;
}

export default function DashboardContent({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Product[]>(products);
  const [reorderMode, setReorderMode] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  // Keep local state in sync with server data when products change
  useEffect(() => setItems(products), [products]);

  const categories = useMemo(
    () => Array.from(new Set(items.map((p) => p.category || 'Uncategorized'))),
    [items]
  );

  const filtered = useMemo(() => {
    if (selected.size === 0) return items;
    return items.filter((p) => selected.has(p.category || 'Uncategorized'));
  }, [items, selected]);

  const grouped = useMemo(() => groupProducts(filtered), [filtered]);

  const toggle = (cat: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const clear = () => setSelected(new Set());

  const reorderCategory = async (category: string, id: string, direction: 'up' | 'down') => {
    const cat = category || 'Uncategorized';
    let newOrderIds: string[] = [];

    setItems((prev) => {
      const inCat = prev.filter((p) => (p.category || 'Uncategorized') === cat);
      const others = prev.filter((p) => (p.category || 'Uncategorized') !== cat);
      const sorted = [...inCat].sort((a, b) => {
        const ao = a.order ?? Number.MAX_SAFE_INTEGER;
        const bo = b.order ?? Number.MAX_SAFE_INTEGER;
        if (ao === bo) return 0;
        return ao - bo;
      });
      const idx = sorted.findIndex((p) => p._id === id);
      if (idx === -1) return prev;
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= sorted.length) return prev;
      [sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]];
      const reassigned = sorted.map((p, i) => ({ ...p, order: i }));
      newOrderIds = reassigned.map((p) => p._id);
      return [...others, ...reassigned];
    });

    if (!newOrderIds.length) return;

    setSaving(id);
    try {
      await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, ids: newOrderIds }),
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-gray-600">Manage products</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filter by category:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggle(cat)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selected.has(cat)
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700'
                }`}
                aria-pressed={selected.has(cat)}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={clear}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 transition hover:bg-gray-100"
            >
              Show all
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{cat}</h2>
              <span className="text-xs text-gray-500">{items.length} items</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product, idx) => {
                const card = (
                  <ProductCard
                    title={product.title}
                    images={product.images}
                    price={product.price}
                    stock={product.stock}
                    status={product.status}
                    category={product.category}
                  />
                );

                if (reorderMode) {
                  return (
                    <div key={product._id} className="relative rounded border p-1">
                      <div className="absolute right-2 top-2 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => reorderCategory(cat, product._id, 'up')}
                          disabled={idx === 0 || saving === product._id}
                          className="rounded border bg-white px-2 py-1 text-xs shadow disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderCategory(cat, product._id, 'down')}
                          disabled={idx === items.length - 1 || saving === product._id}
                          className="rounded border bg-white px-2 py-1 text-xs shadow disabled:opacity-40"
                        >
                          ↓
                        </button>
                      </div>
                      {card}
                    </div>
                  );
                }

                return (
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="transition hover:-translate-y-0.5 hover:shadow"
                  >
                    {card}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setReorderMode((v) => !v)}
        className={`fixed bottom-6 right-6 inline-flex h-14 items-center justify-center rounded-full px-4 text-white shadow-lg transition ${
          reorderMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label="Toggle reorder mode"
      >
        {reorderMode ? 'Done' : 'Reorder'}
      </button>
    </main>
  );
}
