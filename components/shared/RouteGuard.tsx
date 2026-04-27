'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import type { Role } from '@/types'
import { ROLE_REDIRECTS } from '@/lib/constants'
import { Spinner } from '@/components/ui/Spinner'

interface RouteGuardProps {
  allowedRole: Role
  children: React.ReactNode
}

export function RouteGuard({ allowedRole, children }: RouteGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { role } = useRole()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (!isLoading && role && role !== allowedRole) {
      router.push(ROLE_REDIRECTS[role])
    }
  }, [isAuthenticated, isLoading, role, allowedRole, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
