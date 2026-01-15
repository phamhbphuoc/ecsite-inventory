"use client";

import { useRouter } from 'next/navigation';
import React from 'react';

type Props = {
  id: string;
  alreadyDeleted?: boolean;
};

export default function DeleteProductButton({ id, alreadyDeleted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onDelete = async () => {
    if (loading || alreadyDeleted) return;
    const ok = window.confirm('Hide this product? It will disappear from the dashboard but stay in the database.');
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to delete');
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading || alreadyDeleted}
      className={`rounded border px-4 py-2 text-sm font-medium transition ${
        loading || alreadyDeleted
          ? 'border-gray-300 bg-gray-100 text-gray-400'
          : 'border-red-500 bg-white text-red-600 hover:bg-red-50'
      }`}
    >
      {loading ? 'Deleting…' : alreadyDeleted ? 'Deleted' : 'Delete product'}
    </button>
  );
}
