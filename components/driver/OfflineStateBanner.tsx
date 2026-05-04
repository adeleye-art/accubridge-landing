'use client'

import { Navigation } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setOnlineStatus } from '@/store/driverSlice'
import { useToggleOnlineStatusMutation } from '@/store/api/driverApi'
import toast from 'react-hot-toast'
import type { AppDispatch } from '@/store'

interface OfflineStateBannerProps {
  onGoOnline?: () => void
}

export function OfflineStateBanner({ onGoOnline }: OfflineStateBannerProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [toggle, { isLoading }] = useToggleOnlineStatusMutation()

  async function handleGoOnline() {
    try {
      await toggle({ status: 'online' })
      dispatch(setOnlineStatus(true))
      toast.success("You're now online — available for deliveries")
      onGoOnline?.()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="bg-[#1E1B16] rounded-2xl p-8 text-center mb-6">
      <Navigation size={48} className="text-[#C9A84C]/40 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-[#C9A84C] mb-2">You're currently offline</h2>
      <p className="text-sm text-[#9C968E] mb-6">Go online to start receiving delivery jobs</p>
      <button
        onClick={handleGoOnline}
        disabled={isLoading}
        className="px-8 py-3 bg-[#2E7D52] text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Going online...' : 'Go Online'}
      </button>
    </div>
  )
}
