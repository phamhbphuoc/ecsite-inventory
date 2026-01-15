import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { slugify } from '@/lib/utils';

const productSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.object({
    original: z.number().min(0).optional(),
    selling: z.number().min(0),
  }),
  images: z.array(z.string().url()).default([]),
  category: z.string().default('Uncategorized'),
  stock: z.number().min(0).default(0),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  notes: z.string().optional(),
});

const updateSchema = productSchema.partial();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const product = await Product.findById(params.id);
  if (!product) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.errors, { status: 400 });
  }
  const data = parsed.data;
  if (data.title && !data.slug) {
    data.slug = slugify(data.title);
  }
  if (data.slug) {
    data.slug = slugify(data.slug);
  }
  const updated = await Product.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const deleted = await Product.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
}
