'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/hooks/useRole'

export default function AccuBridgeEntryPage() {
  const router = useRouter()
  const { verifybrigeRole } = useRole()

  useEffect(() => {
    if (verifybrigeRole === 'admin') router.replace('/accubridge/admin/dashboard')
    else if (verifybrigeRole === 'staff') router.replace('/accubridge/staff/dashboard')
    else router.replace('/accubridge/client/dashboard')
  }, [verifybrigeRole, router])

  return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0A2463 0%, #0D0D0D 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#3B6EE8] flex items-center justify-center">
          <span className="text-white font-bold text-xl">V</span>
        </div>
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-white/60">Launching VerifyBridge…</p>
      </div>
    </div>
  )
}
