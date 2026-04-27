'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { ROLE_REDIRECTS } from '@/lib/constants'
import { Spinner } from '@/components/ui/Spinner'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { role } = useRole()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && role) {
        router.replace(ROLE_REDIRECTS[role])
      } else {
        router.replace('/login')
      }
    }
  }, [isAuthenticated, isLoading, role, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center">
          <span className="text-sidebar font-bold text-xl">A</span>
        </div>
        <Spinner size="md" />
      </div>
    </div>
  )
}
