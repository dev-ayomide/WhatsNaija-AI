/**
 * Next.js Middleware — route-level auth guard.
 *
 * Supabase stores sessions in localStorage (not cookies) when using
 * the default browser client. Full SSR auth checking requires
 * @supabase/ssr with createServerClient. The client-side guard in
 * app/dashboard/layout.tsx handles redirects via useEffect.
 *
 * This middleware handles:
 * - Redirecting logged-in users away from /login and /register
 *   (once @supabase/ssr is added, this can be expanded)
 * - Ensuring the matcher excludes static assets
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/login', '/register'];
const PROTECTED_PREFIXES = ['/dashboard', '/onboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through all API routes and static files immediately
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Redirect root to dashboard (dashboard/layout.tsx handles auth check)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - Any file with an extension (e.g. .png, .svg, .js)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
  ],
};
