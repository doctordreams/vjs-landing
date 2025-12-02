import { NextRequest, NextResponse } from 'next/server'
import { getSessionData } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin') {
      return NextResponse.next()
    }

    // Check session for all other admin routes
    const sessionData = getSessionData(request)

    if (!sessionData) {
      // Redirect to login page if not authenticated
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Allow access if authenticated
    return NextResponse.next()
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    // Allow access to auth endpoints
    if (pathname.startsWith('/api/admin/auth')) {
      return NextResponse.next()
    }

    // Check session for other admin API routes
    const sessionData = getSessionData(request)

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Allow access if authenticated
    return NextResponse.next()
  }

  // Allow all other requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}



