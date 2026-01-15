import { cookies } from 'next/headers';
import ProductForm, { ProductData } from '@/components/forms/ProductForm';
import DeleteProductButton from '@/components/products/DeleteProductButton';

interface ProductPageProps {
  params: { id: string };
}

export const metadata = {
  title: 'Edit Product',
};

async function fetchProduct(id: string) {
  const cookieHeader = cookies().toString();
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const res = await fetch(`${base}/api/products/${id}`, {
    cache: 'no-store',
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!res.ok) return null;
  return (await res.json()) as ProductData;
}

export default async function EditProductPage({ params }: ProductPageProps) {
  const product = await fetchProduct(params.id);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Product</h1>
          <p className="text-sm text-gray-600">Product ID: {params.id}</p>
        </div>
        <DeleteProductButton id={params.id} alreadyDeleted={Boolean((product as any)?.deletedAt)} />
      </div>
      <ProductForm product={product ?? undefined} />
    </main>
  );
}
