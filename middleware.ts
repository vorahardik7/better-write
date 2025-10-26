import { NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export default async function middleware(req: any) {
  const { nextUrl } = req;

  // Check for session cookie existence (fast, no database calls)
  const sessionCookie = getSessionCookie(req);
  const isLoggedIn = !!sessionCookie;

  if (nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/editor')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  if (nextUrl.pathname === '/' && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}