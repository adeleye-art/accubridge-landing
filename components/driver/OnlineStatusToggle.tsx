'use client'

import { useDispatch, useSelector } from 'react-redux'
import { cn } from '@/lib/utils'
import { setOnlineStatus, selectDriverIsOnline } from '@/store/driverSlice'
import { useToggleOnlineStatusMutation } from '@/store/api/driverApi'
import toast from 'react-hot-toast'
import type { AppDispatch } from '@/store'

interface OnlineStatusToggleProps {
  hasActiveDelivery?: boolean
  size?: 'sm' | 'lg'
}

export function OnlineStatusToggle({ hasActiveDelivery = false, size = 'lg' }: OnlineStatusToggleProps) {
  const dispatch     = useDispatch<AppDispatch>()
  const isOnline     = useSelector(selectDriverIsOnline)
  const [toggle, { isLoading }] = useToggleOnlineStatusMutation()

  async function handleToggle() {
    if (isOnline && hasActiveDelivery) {
      toast.error('Complete your active delivery before going offline')
      return
    }
    const next = !isOnline
    try {
      await toggle({ status: next ? 'online' : 'offline' })
      dispatch(setOnlineStatus(next))
      toast.success(next ? "You're now online — available for deliveries" : "You're now offline")
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (size === 'sm') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
          isOnline
            ? 'bg-green-100 text-[#2E7D52] hover:bg-green-200'
            : 'bg-[#E4E0D5] text-[#5C5750] hover:bg-[#D4D0C5]'
        )}
      >
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', isOnline ? 'bg-[#2E7D52] animate-pulse' : 'bg-[#9C968E]')} />
        {isOnline ? 'Online' : 'Offline'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex items-center gap-2 flex-1">
        <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', isOnline ? 'bg-[#2E7D52] animate-pulse' : 'bg-[#5C5750]')} />
        <span className={cn('text-sm font-semibold', isOnline ? 'text-[#C9A84C]' : 'text-[#9C968E]')}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          'relative w-14 h-7 rounded-full transition-colors disabled:opacity-50 flex-shrink-0',
          isOnline ? 'bg-[#2E7D52]' : 'bg-[#5C5750]'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
          isOnline ? 'translate-x-7' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  )
}
