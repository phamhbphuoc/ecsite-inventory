import { NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

const schema = z.object({
  category: z.string().default('Uncategorized'),
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(parsed.error.errors, { status: 400 });
  }

  const { category, ids } = parsed.data;

  const operations = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id, category, deletedAt: null },
      update: { $set: { order: index } },
    },
  }));

  try {
    await Product.bulkWrite(operations);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Reorder failed', err);
    return NextResponse.json({ message: 'Reorder failed' }, { status: 500 });
  }
}
