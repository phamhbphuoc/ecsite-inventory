"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CLOUDINARY_UPLOAD_PRESET, canUpload, getUploadUrl } from '@/lib/cloudinary';

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
  deletedAt?: string | Date | null;
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
    watch,
    setValue,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'draft',
      category: 'Uncategorized',
      stock: 0,
      ...toFormValues(product),
    },
  });

  const baseCategoryOptions = ['Uncategorized'];
  const [categoryOptions, setCategoryOptions] = React.useState<string[]>(baseCategoryOptions);
  const [showCategoryList, setShowCategoryList] = React.useState(false);
  const [categoryInput, setCategoryInput] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [images, setImages] = React.useState<string[]>(() => {
    const initial = getValues('imagesInput');
    if (!initial) return [];
    return initial
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  });
  const router = useRouter();

  React.useEffect(() => {
    if (product) {
      reset({
        status: 'draft',
        category: 'Uncategorized',
        stock: 0,
        ...toFormValues(product),
      });
      if (product.images?.length) {
        setImages(product.images);
      }
    }
  }, [product, reset]);

  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/products?limit=200', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        const categories = Array.from(
          new Set(
            (json.data as ProductData[])
              .map((p) => p.category || 'Uncategorized')
              .concat(product?.category ? [product.category] : [])
              .concat(baseCategoryOptions)
          )
        ).filter(Boolean);
        setCategoryOptions(categories.length ? categories : baseCategoryOptions);
      } catch (e) {
        console.error('Failed to load category options', e);
        setCategoryOptions((prev) => (prev.length ? prev : baseCategoryOptions));
      }
    };
    loadCategories();
  }, [product?.category]);

  React.useEffect(() => {
    if (product?.category) {
      setCategoryInput(product.category);
    }
  }, [product?.category]);

  const imagesInput = watch('imagesInput');
  React.useEffect(() => {
    // Keep form field in sync with managed images array
    setValue('imagesInput', images.join(', '), { shouldValidate: true, shouldDirty: true });
  }, [images, setValue]);

  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!canUpload() || !CLOUDINARY_UPLOAD_PRESET) {
      setUploadError('Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_* env vars.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    const existing = [...images];

    try {
      const uploads: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(getUploadUrl(), { method: 'POST', body: formData });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Upload failed: ${res.status} ${text.slice(0, 120)}`);
        }
        const json = await res.json();
        if (json.secure_url) uploads.push(json.secure_url as string);
      }
      const next = Array.from(new Set([...existing, ...uploads]));
      setImages(next);
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addImageByUrl = () => {
    const url = window.prompt('Paste image URL');
    if (!url) return;
    const next = Array.from(new Set([...images, url.trim()]));
    setImages(next);
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const moveImage = (url: string, direction: 'up' | 'down') => {
    setImages((prev) => {
      const idx = prev.indexOf(url);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  };

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((idx) => {
      if (idx === null) return idx;
      return idx === 0 ? images.length - 1 : idx - 1;
    });
  };
  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((idx) => {
      if (idx === null) return idx;
      return idx === images.length - 1 ? 0 : idx + 1;
    });
  };

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
      if (isEdit) {
        router.push('/');
        router.refresh();
      } else {
        reset();
        router.refresh();
      }
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
        <label htmlFor="priceSelling" className="block">Selling Price (VND)</label>
        <input
          {...register('priceSelling', { valueAsNumber: true })}
          id="priceSelling"
          type="number"
          inputMode="numeric"
          className="h-12 w-full border"
          placeholder="e.g., 150000"
        />
        {errors.priceSelling && <p className="text-red-500">{errors.priceSelling.message}</p>}
      </div>

      <div>
        <label htmlFor="priceOriginal" className="block">Original Price (JPY, optional)</label>
        <input
          {...register('priceOriginal', { valueAsNumber: true })}
          id="priceOriginal"
          type="number"
          inputMode="numeric"
          className="h-12 w-full border"
          placeholder="e.g., 1200"
        />
        {errors.priceOriginal && <p className="text-red-500">{errors.priceOriginal.message}</p>}
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block font-medium">Images</label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Upload files'}
            </button>
            <button
              type="button"
              onClick={addImageByUrl}
              className="rounded border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Add via URL
            </button>
          </div>
        </div>
        <input type="hidden" {...register('imagesInput')} value={images.join(', ')} readOnly />
        {errors.imagesInput && <p className="text-red-500">{errors.imagesInput.message as string}</p>}
        {uploadError && <p className="text-red-500">{uploadError}</p>}
        {images.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url, idx) => (
              <div key={url} className="relative overflow-hidden rounded border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Preview"
                  className="h-32 w-full cursor-pointer object-cover"
                  onClick={() => openLightbox(idx)}
                />
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/80 px-2 py-1 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(url, 'up')}
                      disabled={idx === 0}
                      className="rounded border px-2 py-0.5 disabled:opacity-40"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(url, 'down')}
                      disabled={idx === images.length - 1}
                      className="rounded border px-2 py-0.5 disabled:opacity-40"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="rounded border px-2 py-0.5 text-red-600"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <label htmlFor="category" className="block">Category</label>
        <input
          id="category"
          className="h-12 w-full border px-3"
          placeholder="Type or choose"
          autoComplete="off"
          value={categoryInput}
          onChange={(e) => {
            setCategoryInput(e.target.value);
            setValue('category', e.target.value);
            setShowCategoryList(true);
          }}
          onFocus={() => setShowCategoryList(true)}
          onBlur={() => setTimeout(() => setShowCategoryList(false), 100)}
        />
        {showCategoryList && categoryOptions.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white shadow">
            {categoryOptions
              .filter((c) => c.toLowerCase().includes(categoryInput.toLowerCase()))
              .map((c) => (
                <button
                  type="button"
                  key={c}
                  className="flex w-full items-center px-3 py-2 text-left hover:bg-gray-100"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setCategoryInput(c);
                    setValue('category', c);
                    setShowCategoryList(false);
                  }}
                >
                  {c}
                </button>
              ))}
            {categoryOptions.filter((c) => c.toLowerCase().includes(categoryInput.toLowerCase())).length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
            )}
          </div>
        )}
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

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeLightbox}
          role="presentation"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 text-2xl text-white"
            aria-label="Close image"
          >
            ×
          </button>
          <button
            type="button"
            onClick={showPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-white"
            aria-label="Next image"
          >
            ›
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightboxIndex]}
            alt="Full image"
            className="max-h-[90vh] max-w-[90vw] rounded shadow-2xl"
          />
        </div>
      )}
    </form>
  );
};

export default ProductForm;