'use client'

import { MapPin, Navigation } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import type { DeliveryRequest, DeliveryItemType } from '@/types'

interface DeliveryRequestCardProps {
  request: DeliveryRequest
}

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

const ITEM_TYPE_LABEL: Record<DeliveryItemType, string> = {
  document:     'Document',
  parcel_small: 'Small Parcel',
  parcel_large: 'Large Parcel',
  food:         'Food',
  groceries:    'Groceries',
  other:        'Other',
}

const STATUS_CLS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-800',
  accepted:  'bg-blue-100 text-blue-800',
  picked_up: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'dd MMM yyyy') } catch { return iso }
}

export function DeliveryRequestCard({ request }: DeliveryRequestCardProps) {
  const statusLabel = request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')

  return (
    <div className="bg-[#EFECE5] rounded-xl p-4 mb-3 border border-[#E4E0D5]">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1.5 flex-1">
          <p className="text-sm flex items-start gap-2">
            <MapPin size={14} className="text-[#B8962E] mt-0.5 flex-shrink-0" />
            <span className="text-[#1A1814]">{request.pickup_location}</span>
          </p>
          <p className="text-sm flex items-start gap-2">
            <Navigation size={14} className="text-[#2E7D52] mt-0.5 flex-shrink-0" />
            <span className="text-[#1A1814]">{request.dropoff_location}</span>
          </p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ml-3', STATUS_CLS[request.status] ?? 'bg-gray-100 text-gray-800')}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#9C968E]">
        <span className="bg-[#E4E0D5] px-2 py-0.5 rounded-full">{ITEM_TYPE_LABEL[request.item_type]}</span>
        <span className="font-semibold text-[#1A1814]">{gbp(request.price)}</span>
        <span>{formatDate(request.created_at)}</span>
        {request.driver_name && (
          <span className="text-[#5C5750]">Driver: {request.driver_name}</span>
        )}
      </div>
    </div>
  )
}
