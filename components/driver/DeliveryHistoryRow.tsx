'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompletedDelivery } from '@/types'

interface DeliveryHistoryRowProps {
  delivery: CompletedDelivery
  onClick: (delivery: CompletedDelivery) => void
}

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

const TYPE_CONFIG = {
  food:     { emoji: '🍛', label: 'Food'     },
  grocery:  { emoji: '🛒', label: 'Grocery'  },
  delivery: { emoji: '📦', label: 'Delivery' },
}

const PAYOUT_CONFIG: Record<CompletedDelivery['payout_status'], { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'bg-amber-100 text-amber-800'  },
  processing: { label: 'Processing', cls: 'bg-blue-100  text-blue-800'   },
  paid:       { label: 'Paid',       cls: 'bg-green-100 text-green-800'  },
}

export function DeliveryHistoryRow({ delivery, onClick }: DeliveryHistoryRowProps) {
  const type   = TYPE_CONFIG[delivery.type]   ?? TYPE_CONFIG.delivery
  const payout = PAYOUT_CONFIG[delivery.payout_status]

  return (
    <button
      onClick={() => onClick(delivery)}
      className="w-full flex items-center gap-4 px-4 py-3.5 bg-white border border-[#E4E0D5] rounded-xl hover:border-[#B8962E]/40 hover:shadow-sm transition-all text-left mb-2"
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-[#F7F5F0] flex items-center justify-center text-xl flex-shrink-0">
        {type.emoji}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-[#1A1814] truncate">{delivery.pickup_name}</span>
          <span className="text-xs text-[#9C968E] font-mono flex-shrink-0">{delivery.order_number}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#9C968E]">
          <span>{formatDate(delivery.completed_at)}</span>
          <span>·</span>
          <span>{delivery.distance_miles} mi</span>
          {delivery.rating && (
            <>
              <span>·</span>
              <span>{'⭐'.repeat(delivery.rating)}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-sm font-bold text-[#B8962E]">{gbp(delivery.earnings)}</span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', payout.cls)}>
          {payout.label}
        </span>
      </div>

      <ChevronRight size={16} className="text-[#9C968E] flex-shrink-0" />
    </button>
  )
}
