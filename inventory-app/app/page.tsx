import { cookies, headers } from 'next/headers';
import DashboardContent, { type Product } from '@/components/dashboard/DashboardContent';
import { redirect } from 'next/navigation';

async function fetchProducts() {
  const cookieHeader = cookies().toString();
  const host = headers().get('host');
  const proto = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const base = host ? `${proto}://${host}` : '';

  const res = await fetch(`${base}/api/products?limit=20`, {
    cache: 'no-store',
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!res.ok) {
    // Avoid JSON parse on HTML error bodies (e.g., middleware redirect)
    const text = await res.text();
    if (res.status === 401) {
      const loginUrl = new URL('/login', base);
      loginUrl.searchParams.set('redirect', '/');
      redirect(loginUrl.pathname + loginUrl.search);
    }
    throw new Error(`Failed to load products: ${res.status} ${res.statusText} - ${text.slice(0, 120)}`);
  }

  const json = await res.json();
  return json.data as Product[];
}

export default async function HomePage() {
  const products = await fetchProducts();
  return <DashboardContent products={products} />;
}