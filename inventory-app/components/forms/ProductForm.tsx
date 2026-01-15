"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export type ProductData = {
  _id?: string;
  title: string;
  slug?: string;
  description?: string;
  price: { selling: number; original?: number };
  images?: string[];
  category?: string;
  stock?: number;
  status?: 'draft' | 'active' | 'archived';
  notes?: string;
};

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  priceSelling: z.coerce.number().min(0, 'Selling price must be a positive number'),
  priceOriginal: z.coerce.number().min(0).optional(),
  imagesInput: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  category: z.string().default('Uncategorized'),
  stock: z.coerce.number().min(0).default(0),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ProductFormProps = {
  product?: ProductData;
};

const toFormValues = (product?: ProductData): Partial<FormValues> => {
  if (!product) return {};
  return {
    title: product.title,
    slug: product.slug,
    description: product.description,
    priceSelling: product.price?.selling,
    priceOriginal: product.price?.original,
    imagesInput: product.images?.join(', '),
    category: product.category,
    stock: product.stock,
    status: product.status,
    notes: product.notes,
  };
};

const ProductForm = ({ product }: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'draft',
      category: 'Uncategorized',
      stock: 0,
      ...toFormValues(product),
    },
  });

  React.useEffect(() => {
    if (product) {
      reset({
        status: 'draft',
        category: 'Uncategorized',
        stock: 0,
        ...toFormValues(product),
      });
    }
  }, [product, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      price: {
        selling: values.priceSelling,
        original: values.priceOriginal,
      },
      images: values.imagesInput || [],
      category: values.category,
      stock: values.stock,
      status: values.status,
      notes: values.notes,
    };

    const isEdit = Boolean(product?._id);
    const url = isEdit ? `/api/products/${product?._id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      if (!isEdit) reset();
    } else {
      const errText = await res.text();
      console.error('Failed to save product', errText);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block">Title</label>
        <input {...register('title')} id="title" className="h-12 w-full border" />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="slug" className="block">Slug (optional)</label>
        <input {...register('slug')} id="slug" className="h-12 w-full border" />
        <p className="text-xs text-gray-500">Leave blank to auto-generate.</p>
      </div>

      <div>
        <label htmlFor="description" className="block">Description</label>
        <textarea {...register('description')} id="description" className="h-24 w-full border" />
      </div>

      <div>
        <label htmlFor="priceSelling" className="block">Selling Price</label>
        <input {...register('priceSelling', { valueAsNumber: true })} id="priceSelling" type="number" className="h-12 w-full border" />
        {errors.priceSelling && <p className="text-red-500">{errors.priceSelling.message}</p>}
      </div>

      <div>
        <label htmlFor="priceOriginal" className="block">Original Price (optional)</label>
        <input {...register('priceOriginal', { valueAsNumber: true })} id="priceOriginal" type="number" className="h-12 w-full border" />
        {errors.priceOriginal && <p className="text-red-500">{errors.priceOriginal.message}</p>}
      </div>

      <div>
        <label htmlFor="imagesInput" className="block">Images (comma-separated URLs)</label>
        <input {...register('imagesInput')} id="imagesInput" className="h-12 w-full border" />
        {errors.imagesInput && <p className="text-red-500">{errors.imagesInput.message as string}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block">Category</label>
        <input {...register('category')} id="category" className="h-12 w-full border" />
      </div>

      <div>
        <label htmlFor="stock" className="block">Stock</label>
        <input {...register('stock', { valueAsNumber: true })} id="stock" type="number" className="h-12 w-full border" />
        {errors.stock && <p className="text-red-500">{errors.stock.message}</p>}
      </div>

      <div>
        <label htmlFor="status" className="block">Status</label>
        <select {...register('status')} id="status" className="h-12 w-full border">
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block">Notes</label>
        <textarea {...register('notes')} id="notes" className="h-20 w-full border" />
      </div>

      <button type="submit" className="h-12 w-full bg-blue-500 text-white" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : product ? 'Update' : 'Submit'}
      </button>
    </form>
  );
};

export default ProductForm;