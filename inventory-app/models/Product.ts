import mongoose, { Schema, Document } from 'mongoose';

interface IProduct extends Document {
  title: string;
  slug: string;
  description?: string;
  price: {
    original?: number;
    selling: number;
  };
  images: string[];
  category: string;
  stock: number;
  status: 'draft' | 'active' | 'archived';
  notes?: string;
  createdAt: Date;
}

const slugify = (value: string) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const ProductSchema: Schema<IProduct> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    price: {
      original: { type: Number, min: 0 },
      selling: { type: Number, required: true, min: 0 },
    },
    images: { type: [String], default: [] },
    category: { type: String, default: 'Uncategorized', trim: true },
    stock: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    notes: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

ProductSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;