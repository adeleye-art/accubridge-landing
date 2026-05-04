'use client'

import { Bell } from 'lucide-react'
import { useSelector } from 'react-redux'
import { cn } from '@/lib/utils'
import { selectDriverIsOnline, selectHasActiveDelivery } from '@/store/driverSlice'

interface DriverTopbarProps {
  title: string
}

export function DriverTopbar({ title }: DriverTopbarProps) {
  const isOnline         = useSelector(selectDriverIsOnline)
  const hasActiveDelivery = useSelector(selectHasActiveDelivery)

  return (
    <header className="h-16 bg-white border-b border-[#E4E0D5] flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-xl font-bold text-[#1A1814]">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Status pill */}
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
          isOnline
            ? 'bg-[#2E7D52]/10 text-[#2E7D52]'
            : 'bg-[#F7F5F0] text-[#9C968E]'
        )}>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            isOnline ? 'bg-[#2E7D52] animate-pulse' : 'bg-[#9C968E]'
          )} />
          {isOnline ? 'Online' : 'Offline'}
        </div>

        {/* Active delivery indicator */}
        {hasActiveDelivery && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#B8962E]/10 text-[#B8962E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8962E] animate-pulse" />
            Active delivery
          </div>
        )}

        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center text-[#5C5750] hover:text-[#1A1814] hover:bg-[#F7F5F0] rounded-full transition-colors">
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}
