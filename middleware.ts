import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Role } from '@/types'

const ROLE_REDIRECTS: Record<Role, string> = {
  admin: '/admin/dashboard',
  vendor: '/vendor/dashboard',
  driver: '/driver/dashboard',
  customer: '/customer/home',
}

const ROLE_PREFIXES: Record<Role, string> = {
  admin: '/admin',
  vendor: '/vendor',
  driver: '/driver',
  customer: '/customer',
}

const AUTH_PATHS = ['/login', '/register', '/verify-otp']

function decodeJwtPayload(
  token: string
): { id?: string; role?: Role; email?: string; approval_status?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const decoded = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('afrocart_token')?.value

  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (token) {
      const payload = decodeJwtPayload(token)
      if (payload?.role) {
        return NextResponse.redirect(
          new URL(ROLE_REDIRECTS[payload.role] ?? '/login', request.url)
        )
      }
    }
    return NextResponse.next()
  }

  if (pathname === '/') {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    const payload = decodeJwtPayload(token)
    if (payload?.role) {
      return NextResponse.redirect(
        new URL(ROLE_REDIRECTS[payload.role] ?? '/login', request.url)
      )
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = decodeJwtPayload(token)
  if (!payload?.role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userRole = payload.role
  const allowedPrefix = ROLE_PREFIXES[userRole]

  const isRoleMismatch = (Object.entries(ROLE_PREFIXES) as [Role, string][]).some(
    ([role, prefix]) => pathname.startsWith(prefix) && role !== userRole
  )

  if (isRoleMismatch) {
    return NextResponse.redirect(new URL(ROLE_REDIRECTS[userRole], request.url))
  }

  // Driver approval gate
  if (userRole === 'driver') {
    const approvalStatus =
      payload.approval_status ?? request.cookies.get('driver_approval_status')?.value

    const isPendingOrRejected =
      !approvalStatus || approvalStatus === 'pending' || approvalStatus === 'rejected'

    if (isPendingOrRejected && pathname !== '/driver/pending') {
      return NextResponse.redirect(new URL('/driver/pending', request.url))
    }

    if (approvalStatus === 'approved' && pathname === '/driver/pending') {
      return NextResponse.redirect(new URL('/driver/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
