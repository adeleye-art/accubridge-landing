'use client'

import { PermissionProvider } from '@/lib/accubridge/auth/permission-context'
import { useEffect, useState } from 'react'
import type { UserRole } from '@/types/accubridge/auth'

/** Decode the swidex_token JWT (no crypto verify — client-side read only) */
function decodeSwidexJWT(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const padded = parts[1] + '='.repeat((4 - (parts[1].length % 4)) % 4)
    return JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function deriveAccuRole(): UserRole {
  if (typeof document === 'undefined') return 'client'

  const cookies = document.cookie.split(';').reduce((acc, c) => {
    const [k, ...rest] = c.trim().split('=')
    acc[k] = rest.join('=')
    return acc
  }, {} as Record<string, string>)

  // Primary: read from swidex_token JWT
  const token = cookies['swidex_token']
  if (token) {
    const payload = decodeSwidexJWT(token)
    const r = payload?.apps?.verifybrige?.role
    if (r === 'admin' || r === 'staff' || r === 'client') return r as UserRole
  }

  return 'client'
}

function PermissionWrapper({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('client')

  useEffect(() => {
    setRole(deriveAccuRole())
  }, [])

  return (
    <PermissionProvider user={{ role }}>
      {children}
    </PermissionProvider>
  )
}

// No separate <Provider> — the root ReduxProvider in app/layout.tsx already
// covers all routes including /accubridge/*. A second Provider with a
// different store would shadow it and break useAuth / useSelector(swidexAuth).
export function AccuBridgeProvider({ children }: { children: React.ReactNode }) {
  return (
    <PermissionWrapper>
      {children}
    </PermissionWrapper>
  )
}
