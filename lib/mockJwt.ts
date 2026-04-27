import type { Role } from '@/types'

export function createMockToken(payload: { id: string; role: Role; email: string }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const body = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 7 }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${header}.${body}.mock_signature`
}

export function getRoleFromEmail(email: string): Role {
  const lower = email.toLowerCase()
  if (lower.startsWith('admin')) return 'admin'
  if (lower.startsWith('vendor')) return 'vendor'
  if (lower.startsWith('driver')) return 'driver'
  return 'customer'
}
