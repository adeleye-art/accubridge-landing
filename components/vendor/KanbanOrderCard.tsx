'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { VendorOrder } from '@/types'

interface KanbanOrderCardProps {
  order: VendorOrder
  column: 'accepted' | 'preparing' | 'ready'
  onMarkReady?: (order: VendorOrder) => void
}

function getElapsedMinutes(isoTime: string): number {
  return Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000)
}

export function KanbanOrderCard({ order, column, onMarkReady }: KanbanOrderCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const elapsed = getElapsedMinutes(order.placed_at)
  const timeBadgeCls =
    elapsed > 25 ? 'bg-red-100 text-red-700' :
    elapsed > 15 ? 'bg-amber-100 text-amber-700' :
    'bg-[#F7F5F0] text-[#9C968E]'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white rounded-lg border border-[#E4E0D5] p-3 mb-2 cursor-grab active:cursor-grabbing select-none',
        isDragging && 'shadow-lg'
      )}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-mono text-[#B8962E]">{order.order_number}</span>
        <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium', timeBadgeCls)}>
          {elapsed}m
        </span>
      </div>
      <p className="text-sm font-medium text-[#1A1814] mb-0.5">
        {order.customer_name.split(' ')[0]}
      </p>
      <p className="text-xs text-[#9C968E] mb-2">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>

      {column === 'preparing' && onMarkReady && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onMarkReady(order)}
          className="w-full border border-[#B8962E] text-[#B8962E] rounded-md py-1 text-xs font-medium hover:bg-[#E8D5A3]/30 transition-colors"
        >
          Mark Ready
        </button>
      )}
    </div>
  )
}
