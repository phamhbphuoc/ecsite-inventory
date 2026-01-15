import { formatCurrency } from '@/lib/utils';

type ProductCardProps = {
  title: string;
  images?: string[];
  price: { selling: number; original?: number };
  stock?: number;
  status?: 'draft' | 'active' | 'archived';
  category?: string;
};

export default function ProductCard({ title, images = [], price, stock = 0, status = 'draft', category = 'General' }: ProductCardProps) {
  const [firstImage, ...rest] = images;
  const sellingNum = Number(price?.selling);
  const selling = Number.isFinite(sellingNum) ? sellingNum : 0;
  const originalNum = Number(price?.original);
  const original = Number.isFinite(originalNum) ? originalNum : null;

  return (
    <article className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm">
      <div className="relative h-20 w-20 overflow-hidden rounded-md bg-gray-100">
        {firstImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={firstImage} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No image</div>
        )}
        {rest.length > 0 && (
          <span className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">+{rest.length}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-gray-500">{category}</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-rose-600">{formatCurrency(selling, 'VND')}</p>
          {original !== null && (
            <p className="text-xs text-gray-600">({formatCurrency(original, 'JPY')})</p>
          )}
        </div>
        <p className="text-xs text-gray-600">Stock: {stock}</p>
      </div>

    </article>
  );
}
