import Link from 'next/link';
import { Button } from './ui/Button';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          Inventory Manager
        </Link>
        <Link href="/products/new">
          <Button size={undefined}>Add Product</Button>
        </Link>
      </div>
    </header>
  );
}
