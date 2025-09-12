import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip all API routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Public routes - anyone can access
  const publicRoutes = ['/', '/landing', '/login']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  if (!token) {
    // Not authenticated - redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated - allow access
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
