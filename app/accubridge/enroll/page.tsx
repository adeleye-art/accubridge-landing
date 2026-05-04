'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'
import { updateUser } from '@/store/swidexAuthSlice'
import type { AppDispatch } from '@/store'
import { BarChart3, Loader2 } from 'lucide-react'

const VB_DASHBOARDS = {
  admin:  '/accubridge/admin/dashboard',
  staff:  '/accubridge/staff/dashboard',
  client: '/accubridge/client/dashboard',
} as const

export default function VerifyBridgeEnrollPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const [status, setStatus] = useState<'enrolling' | 'done' | 'error'>('enrolling')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !user) return

    // Already enrolled — go straight to their dashboard
    if (user.apps?.verifybrige) {
      const role = user.apps.verifybrige.role
      const dest = VB_DASHBOARDS[role] ?? VB_DASHBOARDS.client
      window.location.href = dest
      return
    }

    // Auto-enroll new users as client
    async function enroll() {
      try {
        const res = await fetch('/api/auth/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user!.email, app: 'verifybrige', role: 'client' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        // Update Redux + cookie before navigating so middleware sees the new role
        dispatch(updateUser({ user: data.user, token: data.token }))
        setStatus('done')
        // Send new users to the onboarding flow, not straight to the dashboard
        window.location.href = '/accubridge/onboarding'
      } catch {
        setStatus('error')
      }
    }

    enroll()
  }, [mounted, user, dispatch])

  if (!mounted) return null

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0A2463 0%, #0D0D0D 100%)' }}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#3B6EE8] flex items-center justify-center mb-5">
        <BarChart3 size={26} className="text-white" />
      </div>

      {status === 'error' ? (
        <>
          <p className="text-white font-semibold mb-2">Something went wrong</p>
          <p className="text-white/50 text-sm mb-4">We couldn&apos;t set up your account.</p>
          <button
            onClick={() => { window.location.href = '/portal' }}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Return to portal
          </button>
        </>
      ) : (
        <>
          <Loader2 size={22} className="text-white/50 animate-spin mb-3" />
          <p className="text-white/70 text-sm">Creating your account…</p>
        </>
      )}
    </div>
  )
}
