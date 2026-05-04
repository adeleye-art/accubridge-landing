'use client'

import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CustomerOrder, OrderStatus } from '@/types'

interface OrderCardProps {
  order: CustomerOrder
  onReorder?: (order: CustomerOrder) => void
}

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

const STATUS_CLS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800',
  accepted:  'bg-blue-100 text-blue-800',
  preparing: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_LABEL: Record<string, string> = {
  pending:   'Order Placed',
  accepted:  'Accepted',
  preparing: 'Preparing',
  picked_up: 'On the way',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'dd MMM yyyy, HH:mm') } catch { return iso }
}

function itemsSummary(items: CustomerOrder['items']) {
  const names = items.map((i) => i.name)
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`
}

export function OrderCard({ order, onReorder }: OrderCardProps) {
  const isActive = ['pending', 'accepted', 'preparing', 'picked_up'].includes(order.status)
  const canReview = order.status === 'delivered' || order.status === 'completed'

  return (
    <div className="bg-[#EFECE5] rounded-xl border border-[#E4E0D5] p-5">
      {/* Row 1 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          {order.vendor_logo_url ? (
            <img src={order.vendor_logo_url} alt={order.vendor_name} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#B8962E]/20 flex items-center justify-center text-sm font-bold text-[#B8962E]">
              {order.vendor_name.charAt(0)}
            </div>
          )}
          <p className="font-semibold text-[#1A1814] text-sm">{order.vendor_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', STATUS_CLS[order.status] ?? 'bg-gray-100 text-gray-800')}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
          <p className="text-xs text-[#9C968E]">{formatDate(order.placed_at)}</p>
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#5C5750]">{itemsSummary(order.items)}</p>
        <p className="font-semibold text-[#1A1814]">{gbp(order.total_amount)}</p>
      </div>

      {/* Row 3 — actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-[#E4E0D5]">
        <Link
          href={`/afrocart/customer/orders/${order.id}`}
          className="text-sm text-[#B8962E] font-medium hover:underline"
        >
          {isActive ? 'Track Order →' : 'View Order →'}
        </Link>
        {onReorder && (
          <button
            onClick={() => onReorder(order)}
            className="text-sm px-3 py-1 border border-[#B8962E] text-[#B8962E] rounded-lg hover:bg-[#E8D5A3]/30 transition-colors"
          >
            Reorder
          </button>
        )}
        {canReview && (
          <Link
            href={`/afrocart/customer/orders/${order.id}#review`}
            className="text-sm text-[#B8962E] hover:underline ml-auto"
          >
            Leave Review
          </Link>
        )}
      </div>
    </div>
  )
}
