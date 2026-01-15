import Link from 'next/link';
import { cookies } from 'next/headers';
import ProductCard from '@/components/products/ProductCard';

type Product = {
  _id: string;
  title: string;
  images?: string[];
  price: { selling: number };
  stock?: number;
  status?: 'draft' | 'active' | 'archived';
  category?: string;
};

async function fetchProducts() {
  const cookieHeader = cookies().toString();
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const res = await fetch(`${base}/api/products?limit=20`, {
    cache: 'no-store',
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!res.ok) {
    // Avoid JSON parse on HTML error bodies (e.g., middleware redirect)
    const text = await res.text();
    throw new Error(`Failed to load products: ${res.status} ${res.statusText} - ${text.slice(0, 120)}`);
  }

  const json = await res.json();
  return json.data as Product[];
}

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-gray-600">Manage products quickly on mobile.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product._id} href={`/products/${product._id}`} className="transition hover:-translate-y-0.5 hover:shadow">
            <ProductCard
              title={product.title}
              image={product.images?.[0]}
              price={product.price.selling}
              stock={product.stock}
              status={product.status}
              category={product.category}
            />
          </Link>
        ))}
      </section>

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