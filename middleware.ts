import { NextResponse, type NextRequest } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  verifyAdminSession,
  verifyCustomerSession,
} from '@/lib/crafttrack/session'

// Protects two CraftTrack surfaces:
//   /crafttrack/dashboard/*   — requires a valid customer session
//   /admin/crafttrack/*       — requires a valid admin session (login page excepted)
// Everything else on the site is untouched — this middleware is a no-op for
// every other route, matched via the config below rather than checked here.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/crafttrack/dashboard')) {
    const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
    const session = token ? await verifyCustomerSession(token) : null
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/crafttrack/access'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin/crafttrack') && pathname !== '/admin/crafttrack/login') {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    const session = token ? await verifyAdminSession(token) : null
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/crafttrack/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/crafttrack/dashboard/:path*', '/admin/crafttrack/:path*'],
}
