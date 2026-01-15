"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ProductCard from '@/components/products/ProductCard';

export type Product = {
  _id: string;
  title: string;
  images?: string[];
  price: { selling: number; original?: number };
  stock?: number;
  status?: 'draft' | 'active' | 'archived';
  category?: string;
};

type Grouped = Record<string, Product[]>;

function groupProducts(products: Product[]): Grouped {
  return products.reduce<Grouped>((acc, item) => {
    const key = item.category || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export default function DashboardContent({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category || 'Uncategorized'))),
    [products]
  );

  const filtered = useMemo(() => {
    if (selected.size === 0) return products;
    return products.filter((p) => selected.has(p.category || 'Uncategorized'));
  }, [products, selected]);

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
              {items.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="transition hover:-translate-y-0.5 hover:shadow"
                >
                  <ProductCard
                    title={product.title}
                    images={product.images}
                    price={product.price}
                    stock={product.stock}
                    status={product.status}
                    category={product.category}
                  />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Link
        href="/products/new"
        className="fixed bottom-6 right-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
        aria-label="Add product"
      >
        +
      </Link>
    </main>
  );
}
