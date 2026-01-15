import { NextResponse } from 'next/server';

const APP_PIN = process.env.APP_PIN;
const COOKIE_NAME = 'inventory_auth';

export async function POST(request: Request) {
  if (!APP_PIN) return NextResponse.json({ message: 'PIN not configured' }, { status: 500 });

  const { pin } = await request.json();
  if (pin !== APP_PIN) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const res = NextResponse.json({ message: 'ok' });
  res.cookies.set(COOKIE_NAME, '1', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
