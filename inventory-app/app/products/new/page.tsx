import ProductForm from '@/components/forms/ProductForm';

export const metadata = {
  title: 'Add Product',
};

export default function NewProductPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">Add Product</h1>
        <p className="text-sm text-gray-600">Create a new item for your inventory.</p>
      </div>
      <ProductForm />
    </main>
  );
}
