type ProductCardProps = {
  title: string;
  image?: string;
  price: number;
  stock?: number;
  status?: 'draft' | 'active';
  category?: string;
};

export default function ProductCard({ title, image, price, stock = 0, status = 'draft', category = 'General' }: ProductCardProps) {
  return (
    <article className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm">
      <div className="h-20 w-20 overflow-hidden rounded-md bg-gray-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No image</div>
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
        <p className="text-lg font-bold text-rose-600">¥{price.toLocaleString()}</p>
        <p className="text-xs text-gray-600">Stock: {stock}</p>
      </div>
    </article>
  );
}
