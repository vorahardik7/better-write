import { NextResponse } from 'next/server'
import { auth } from './auth'

export default async function middleware(req: any) {
  const { nextUrl } = req;
  const session = await auth.api.getSession({ headers: req.headers });

  const isLoggedIn = !!session;

  // Protect dashboard and editor routes
  if (nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/editor')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  // Redirect authenticated users away from home page to dashboard
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}