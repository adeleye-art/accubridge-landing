import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SwidexTokenPayload, AfroCartRole } from '@/types/swidex'

// ─── AfroCart role → dashboard URL ───────────────────────────────────────────

const AFROCART_DASHBOARDS: Record<AfroCartRole, string> = {
  admin:    '/afrocart/admin/dashboard',
  vendor:   '/afrocart/vendor/dashboard',
  driver:   '/afrocart/driver/dashboard',
  customer: '/afrocart/customer/home',
}

const AFROCART_PREFIXES: Record<AfroCartRole, string> = {
  admin:    '/afrocart/admin',
  vendor:   '/afrocart/vendor',
  driver:   '/afrocart/driver',
  customer: '/afrocart/customer',
}

// ─── Route categories ─────────────────────────────────────────────────────────

const PUBLIC_PATHS = ['/login', '/register', '/afrocart/register', '/afrocart/verify-otp']
const PORTAL_PATHS = ['/portal']
const AFROCART_PREFIX = '/afrocart'
const VERIFYBRIGE_PREFIX = '/accubridge'

// ─── JWT decode ───────────────────────────────────────────────────────────────

function decodeSwidexToken(token: string): SwidexTokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const padded = parts[1] + '='.repeat((4 - (parts[1].length % 4)) % 4)
    const decoded = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('swidex_token')?.value

  // 1. Public paths — no auth needed; bounce logged-in users to portal
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (token && decodeSwidexToken(token)) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
    return NextResponse.next()
  }

  // 2. Root → portal
  if (pathname === '/') {
    return token
      ? NextResponse.redirect(new URL('/portal', request.url))
      : NextResponse.redirect(new URL('/login', request.url))
  }

  // For all protected routes, require a valid swidex_token
  const payload = token ? decodeSwidexToken(token) : null

  if (!payload) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Portal — any authenticated user can access
  if (PORTAL_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 4. AfroCart routes — require afrocart app access
  if (pathname.startsWith(AFROCART_PREFIX)) {
    const afroAccess = payload.apps?.afrocart

    // No AfroCart role → send to onboarding
    if (!afroAccess) {
      if (pathname === '/afrocart/onboard') return NextResponse.next()
      return NextResponse.redirect(new URL('/afrocart/onboard', request.url))
    }

    const role = afroAccess.role

    // Vendor approval gate
    if (role === 'vendor') {
      const status = afroAccess.approval_status
      const VENDOR_PRE_APPROVAL_PATHS = ['/afrocart/vendor/pending', '/afrocart/vendor/register']
      const isPending = !status || status === 'pending' || status === 'rejected'
      if (isPending && !VENDOR_PRE_APPROVAL_PATHS.includes(pathname)) {
        return NextResponse.redirect(new URL('/afrocart/vendor/pending', request.url))
      }
      if (status === 'approved' && VENDOR_PRE_APPROVAL_PATHS.includes(pathname)) {
        return NextResponse.redirect(new URL('/afrocart/vendor/dashboard', request.url))
      }
    }

    // Driver approval gate
    if (role === 'driver') {
      const status = afroAccess.approval_status
      const isPending = !status || status === 'pending' || status === 'rejected'
      if (isPending && pathname !== '/afrocart/driver/pending') {
        return NextResponse.redirect(new URL('/afrocart/driver/pending', request.url))
      }
      if (status === 'approved' && pathname === '/afrocart/driver/pending') {
        return NextResponse.redirect(new URL('/afrocart/driver/dashboard', request.url))
      }
    }

    // Role mismatch guard (e.g. vendor trying to access /afrocart/admin/...)
    const isRoleMismatch = (Object.entries(AFROCART_PREFIXES) as [AfroCartRole, string][]).some(
      ([r, prefix]) => pathname.startsWith(prefix) && r !== role
    )
    if (isRoleMismatch) {
      return NextResponse.redirect(new URL(AFROCART_DASHBOARDS[role], request.url))
    }

    return NextResponse.next()
  }

  // 5. VerifyBridge routes — require verifybrige app access
  if (pathname.startsWith(VERIFYBRIGE_PREFIX)) {
    const vbAccess = payload.apps?.verifybrige

    // No VB role → auto-enroll as client (handled client-side on the entry page)
    if (!vbAccess) {
      if (pathname === '/accubridge/enroll') return NextResponse.next()
      return NextResponse.redirect(new URL('/accubridge/enroll', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)'],
}
