import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value;

  const { pathname } = request.nextUrl;

  // 1. Jika user sudah login (punya token) tapi mencoba akses halaman login,
  // maka kembalikan secara paksa (redirect) ke dashboard sesuai role-nya.
  if (token && pathname.startsWith('/login')) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'pedagang') return NextResponse.redirect(new URL('/pedagang', request.url));
    if (role === 'ortu') return NextResponse.redirect(new URL('/ortu', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Jika user BELUM login (tidak punya token) mencoba akses dashboard,
  // maka tendang (redirect) ke halaman login.
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/pedagang') || pathname.startsWith('/ortu'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Proteksi Role (Mencegah Admin masuk ke halaman Ortu, dsb)
  if (token) {
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/pedagang') && role !== 'pedagang') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    if (pathname.startsWith('/ortu') && role !== 'ortu') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

// Tentukan route mana saja yang akan diawasi oleh middleware ini
export const config = {
  matcher: ['/login', '/admin/:path*', '/pedagang/:path*', '/ortu/:path*'],
};
