import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { z } from 'zod';
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
  deletedAt: z.date().nullable().optional(),
  order: z.number().int().nonnegative().optional(),
});

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  const query: Record<string, unknown> = { deletedAt: null };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    Product.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return NextResponse.json({
    data,
    meta: { total, page, limit },
  });
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();

  const parsedBody = productSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(parsedBody.error.errors, { status: 400 });
  }

  const payload = parsedBody.data;
  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);

  // Ensure new products append to end of their category
  const category = payload.category || 'Uncategorized';
  if (payload.order === undefined) {
    const last = await Product.find({ category, deletedAt: null }).sort({ order: -1 }).limit(1);
    const nextOrder = last.length ? (last[0].order ?? 0) + 1 : 0;
    payload.order = nextOrder;
  }

  const newProduct = new Product({ ...payload, slug, category });
  await newProduct.save();
  return NextResponse.json(newProduct, { status: 201 });
}