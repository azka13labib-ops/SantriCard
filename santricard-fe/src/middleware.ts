import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value;

  const { pathname } = request.nextUrl;

  if (token && pathname.startsWith('/login')) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'merchant') return NextResponse.redirect(new URL('/merchant', request.url));
    if (role === 'parent') return NextResponse.redirect(new URL('/parent', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/merchant') || pathname.startsWith('/parent'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/merchant') && role !== 'merchant') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/parent') && role !== 'parent') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

// Tentukan route mana saja yang akan diawasi oleh middleware ini
export const config = {
  matcher: ['/login', '/admin/:path*', '/merchant/:path*', '/parent/:path*'],
};
