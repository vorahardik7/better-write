import { NextResponse } from 'next/server'
import { auth } from './auth'

export default async function middleware(req: any) {
  const { nextUrl } = req;
  
  let isLoggedIn = false;
  
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    isLoggedIn = !!session;
  } catch (error) {
    console.error('Middleware auth error:', error);
    // If auth fails, treat as not logged in
    isLoggedIn = false;
  }

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

  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
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