'use client'

import { X, MapPin, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CompletedDelivery } from '@/types'

interface DeliveryDetailModalProps {
  delivery: CompletedDelivery
  onClose: () => void
}

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

const PAYOUT_CONFIG: Record<CompletedDelivery['payout_status'], { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'bg-amber-100 text-amber-700'  },
  processing: { label: 'Processing', cls: 'bg-blue-100  text-blue-700'   },
  paid:       { label: 'Paid',       cls: 'bg-green-100 text-green-700'  },
}

const TYPE_EMOJI: Record<string, string> = {
  food: '🍛', grocery: '🛒', delivery: '📦',
}

export function DeliveryDetailModal({ delivery, onClose }: DeliveryDetailModalProps) {
  const payout = PAYOUT_CONFIG[delivery.payout_status]
  const emoji  = TYPE_EMOJI[delivery.type] ?? '📦'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[#E4E0D5] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <div>
              <h3 className="font-semibold text-[#1A1814]">{delivery.pickup_name}</h3>
              <p className="text-xs text-[#9C968E] font-mono">{delivery.order_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#9C968E] hover:text-[#5C5750] rounded-full hover:bg-[#F7F5F0]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Earnings summary */}
          <div className="bg-[#F7F5F0] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9C968E] mb-1">Earnings</p>
              <p className="text-2xl font-bold text-[#B8962E]">{gbp(delivery.earnings)}</p>
            </div>
            <span className={cn('text-sm px-3 py-1 rounded-full font-medium', payout.cls)}>
              {payout.label}
            </span>
          </div>

          {/* Route */}
          <div>
            <p className="text-xs font-medium text-[#9C968E] uppercase tracking-wide mb-3">Route</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <span className="w-3 h-3 rounded-full bg-[#2E7D52] block" />
                </div>
                <div>
                  <p className="text-xs text-[#9C968E]">Pickup</p>
                  <p className="text-sm font-semibold text-[#1A1814]">{delivery.pickup_name}</p>
                  <p className="text-xs text-[#5C5750]">{delivery.pickup_address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <span className="w-3 h-3 rounded-full bg-[#C0392B] block" />
                </div>
                <div>
                  <p className="text-xs text-[#9C968E]">Delivered to {delivery.customer_first_name}</p>
                  <p className="text-xs text-[#5C5750]">{delivery.dropoff_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F7F5F0] rounded-xl p-3 text-center">
              <MapPin size={14} className="text-[#9C968E] mx-auto mb-1" />
              <p className="text-sm font-semibold text-[#1A1814]">{delivery.distance_miles} mi</p>
              <p className="text-xs text-[#9C968E]">Distance</p>
            </div>
            <div className="bg-[#F7F5F0] rounded-xl p-3 text-center">
              <Clock size={14} className="text-[#9C968E] mx-auto mb-1" />
              <p className="text-sm font-semibold text-[#1A1814]">{delivery.duration_minutes} min</p>
              <p className="text-xs text-[#9C968E]">Duration</p>
            </div>
            <div className="bg-[#F7F5F0] rounded-xl p-3 text-center">
              <Star size={14} className="text-[#9C968E] mx-auto mb-1" />
              <p className="text-sm font-semibold text-[#1A1814]">
                {delivery.rating ? `${delivery.rating}/5` : '—'}
              </p>
              <p className="text-xs text-[#9C968E]">Rating</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-medium text-[#9C968E] uppercase tracking-wide mb-3">Timeline</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5C5750]">Accepted</span>
                <span className="text-[#1A1814] font-medium">{formatDateTime(delivery.accepted_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5750]">Completed</span>
                <span className="text-[#1A1814] font-medium">{formatDateTime(delivery.completed_at)}</span>
              </div>
            </div>
          </div>

          {/* Customer note */}
          {delivery.customer_note && (
            <div className="bg-[#F7F5F0] rounded-xl p-4">
              <p className="text-xs font-medium text-[#9C968E] mb-1">Customer Note</p>
              <p className="text-sm text-[#1A1814]">{delivery.customer_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
