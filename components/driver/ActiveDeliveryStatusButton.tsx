'use client'

import { Loader2 } from 'lucide-react'
import type { ActiveDelivery } from '@/types'

interface ActiveDeliveryStatusButtonProps {
  status: ActiveDelivery['status']
  onAction: (next: 'en_route_pickup' | 'picked_up' | 'en_route_dropoff' | 'delivered') => void
  isLoading?: boolean
}

const STATUS_CONFIG: Record<
  ActiveDelivery['status'],
  { label: string; next: 'en_route_pickup' | 'picked_up' | 'en_route_dropoff' | 'delivered'; bg: string }
> = {
  accepted:         { label: '🚗 Heading to Pickup',            next: 'en_route_pickup',  bg: 'bg-[#2C5F8A]' },
  en_route_pickup:  { label: '✅ I\'ve Arrived — Mark Picked Up', next: 'picked_up',        bg: 'bg-[#B8962E]' },
  picked_up:        { label: '🚗 Heading to Customer',          next: 'en_route_dropoff', bg: 'bg-[#2C5F8A]' },
  en_route_dropoff: { label: '✅ Mark as Delivered',             next: 'delivered',        bg: 'bg-[#2E7D52]' },
}

export function ActiveDeliveryStatusButton({ status, onAction, isLoading }: ActiveDeliveryStatusButtonProps) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return null

  return (
    <button
      onClick={() => onAction(cfg.next)}
      disabled={isLoading}
      className={`w-full h-14 ${cfg.bg} text-white rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3`}
    >
      {isLoading ? <><Loader2 size={20} className="animate-spin" /> Updating...</> : cfg.label}
    </button>
  )
}
