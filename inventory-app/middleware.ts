import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APP_PIN = process.env.APP_PIN;
const COOKIE_NAME = 'inventory_auth';

export function middleware(req: NextRequest) {
  if (!APP_PIN) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/_next') || pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  const hasCookie = req.cookies.get(COOKIE_NAME)?.value === '1';
  if (hasCookie) return NextResponse.next();

  const basic = req.headers.get('authorization');
  if (basic && basic.startsWith('Basic ')) {
    const decoded = Buffer.from(basic.replace('Basic ', ''), 'base64').toString();
    const [_, pin] = decoded.split(':');
    if (pin === APP_PIN) {
      const res = NextResponse.next();
      res.cookies.set(COOKIE_NAME, '1', { path: '/', httpOnly: true });
      return res;
    }
  }

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
