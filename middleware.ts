import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/landing', '/login', '/signup'];

// Routes that are only accessible to unauthenticated users
const authRoutes = ['/login', '/signup'];

// API routes that don't require authentication
const publicApiRoutes = ['/api/auth', '/api/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Check if the user is authenticated
  const isAuthenticated = !!token;
  
  // Check if the user has completed onboarding
  const isOnboarded = token?.onboarded === true;
  
  // Allow public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // If the user is authenticated and trying to access auth routes (login/signup),
  // redirect them to the appropriate page
  if (isAuthenticated && authRoutes.includes(pathname)) {
    if (isOnboarded) {
      return NextResponse.redirect(new URL('/', request.url));
    } else {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }
  
  // If the user is not authenticated and trying to access a protected route,
  // redirect them to the login page
  if (!isAuthenticated && !publicRoutes.includes(pathname) && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If the user is authenticated but not onboarded and not accessing the onboarding page,
  // redirect them to the onboarding page
  if (isAuthenticated && !isOnboarded && pathname !== '/onboarding' && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
  
  // If the user is authenticated and onboarded but trying to access the onboarding page,
  // redirect them to the home page
  if (isAuthenticated && isOnboarded && pathname === '/onboarding') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.svg).*)',
  ],
};