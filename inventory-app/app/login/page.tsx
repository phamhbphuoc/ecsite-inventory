'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(redirect);
    } else {
      setError('Invalid PIN');
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">Staff Login</h1>
          <p className="text-sm text-gray-600">Enter the staff PIN to continue.</p>
        </div>
        <Input
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Verifying…' : 'Enter'}
        </Button>
      </form>
    </main>
  );
}
