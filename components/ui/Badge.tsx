import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

type BadgeStatus =
  | OrderStatus
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'online'
  | 'offline'
  | 'paid'
  | 'earned'
  | 'deducted'
  | 'restaurant'
  | 'store'

interface BadgeProps {
  status: BadgeStatus
  className?: string
}

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-[#E8D5A3] text-[#5C5750]',
  cancelled: 'bg-red-100 text-red-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended: 'bg-gray-800 text-white',
  online: 'bg-green-100 text-green-800',
  offline: 'bg-gray-100 text-gray-600',
  paid: 'bg-green-100 text-green-800',
  earned: 'bg-green-100 text-green-800',
  deducted: 'bg-red-100 text-red-800',
  restaurant: 'bg-amber-100 text-amber-800',
  store: 'bg-blue-100 text-blue-800',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
  online: 'Online',
  offline: 'Offline',
  paid: 'Paid',
  earned: 'Earned',
  deducted: 'Deducted',
  restaurant: 'Restaurant',
  store: 'Store',
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_CLASSES[status] ?? 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
