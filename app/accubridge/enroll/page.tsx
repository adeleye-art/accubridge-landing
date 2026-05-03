'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'
import { updateUser } from '@/store/swidexAuthSlice'
import type { AppDispatch } from '@/store'
import { BarChart3, Loader2 } from 'lucide-react'

export default function VerifyBridgeEnrollPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const [status, setStatus] = useState<'enrolling' | 'done' | 'error'>('enrolling')

  useEffect(() => {
    if (!user) return

    // If already has VB access, just redirect
    if (user.apps?.verifybrige) {
      const role = user.apps.verifybrige.role
      const dest =
        role === 'admin' ? '/accubridge/admin/dashboard'
        : role === 'staff' ? '/accubridge/staff/dashboard'
        : '/accubridge/client/dashboard'
      router.replace(dest)
      return
    }

    // Auto-enroll as client
    async function enroll() {
      try {
        const res = await fetch('/api/auth/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user!.email, app: 'verifybrige', role: 'client' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)

        dispatch(updateUser({ user: data.user, token: data.token }))
        setStatus('done')
        router.replace('/accubridge/client/dashboard')
      } catch {
        setStatus('error')
      }
    }

    enroll()
  }, [user, router, dispatch])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0A2463 0%, #0D0D0D 100%)' }}>
      <div className="w-14 h-14 rounded-2xl bg-[#3B6EE8] flex items-center justify-center mb-5">
        <BarChart3 size={26} className="text-white" />
      </div>

      {status === 'error' ? (
        <>
          <p className="text-white font-semibold mb-2">Something went wrong</p>
          <button onClick={() => router.push('/portal')}
            className="text-sm text-white/50 hover:text-white mt-2">
            Return to portal
          </button>
        </>
      ) : (
        <>
          <Loader2 size={22} className="text-white/50 animate-spin mb-3" />
          <p className="text-white/70 text-sm">Setting up your VerifyBridge account…</p>
        </>
      )}
    </div>
  )
}
