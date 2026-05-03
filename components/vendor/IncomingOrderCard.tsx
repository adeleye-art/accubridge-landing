'use client'

import { formatDistanceToNow } from 'date-fns'
import type { VendorOrder } from '@/types'

interface IncomingOrderCardProps {
  order: VendorOrder
  onAccept: (order: VendorOrder) => void
  onReject: (order: VendorOrder) => void
}

export function IncomingOrderCard({ order, onAccept, onReject }: IncomingOrderCardProps) {
  const itemsSummary = order.items
    .slice(0, 3)
    .map((i) => `${i.quantity}× ${i.name}`)
    .join(', ')
    + (order.items.length > 3 ? ` +${order.items.length - 3} more` : '')

  const timeAgo = formatDistanceToNow(new Date(order.placed_at), { addSuffix: false })

  return (
    <div className="bg-white rounded-lg border border-[#E4E0D5] p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-mono text-[#B8962E] font-medium">{order.order_number}</span>
        <span className="text-xs text-[#9C968E]">{timeAgo} ago</span>
      </div>

      <p className="text-sm font-medium text-[#1A1814] mb-0.5">
        {order.customer_name.split(' ')[0]}&apos;s order
      </p>
      <p className="text-sm text-[#5C5750] truncate mb-3">{itemsSummary}</p>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1A1814]">
          £{(order.total_amount / 100).toFixed(2)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(order)}
            className="bg-[#2E7D52] text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-[#256644] transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => onReject(order)}
            className="bg-[#C0392B] text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-[#A93226] transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}
