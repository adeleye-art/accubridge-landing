'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Phone, MessageSquare, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { DriverTopbar } from '@/components/driver/DriverTopbar'
import { DeliveryProgressStepper } from '@/components/driver/DeliveryProgressStepper'
import { ActiveDeliveryStatusButton } from '@/components/driver/ActiveDeliveryStatusButton'
import { IssueReportModal } from '@/components/driver/IssueReportModal'
import {
  selectHasActiveDelivery,
  setActiveDelivery,
} from '@/store/driverSlice'
import type { AppDispatch } from '@/store'
import type { ActiveDelivery } from '@/types'
import Link from 'next/link'

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

const MOCK_DELIVERY: ActiveDelivery = {
  id: 'ad_001',
  order_number: 'AC-0091',
  type: 'food',
  pickup_name: 'Jollof House',
  pickup_address: '14 Market St, London SE1 9AB',
  pickup_phone: '+44 20 7000 0001',
  dropoff_address: '72 Brixton Rd, London SW9 6BH',
  dropoff_phone: '+44 7700 900123',
  customer_first_name: 'Amara',
  item_summary: '2× Jollof Rice, 1× Fried Plantain',
  customer_note: 'Please ring the bell — intercom is broken.',
  earnings: 720,
  accepted_at: new Date(Date.now() - 8 * 60000).toISOString(),
  status: 'en_route_pickup',
  distance_miles: 1.8,
  estimated_minutes: 22,
}

export default function DriverActivePage() {
  const dispatch          = useDispatch<AppDispatch>()
  const hasActiveDelivery = useSelector(selectHasActiveDelivery)
  const [delivery, setDelivery] = useState<ActiveDelivery>(MOCK_DELIVERY)
  const [updating, setUpdating] = useState(false)
  const [showIssue, setShowIssue] = useState(false)

  async function handleStatusUpdate(
    next: 'en_route_pickup' | 'picked_up' | 'en_route_dropoff' | 'delivered'
  ) {
    setUpdating(true)
    await new Promise((r) => setTimeout(r, 800))
    if (next === 'delivered') {
      toast.success(`Delivery complete! You earned ${gbp(delivery.earnings)} 🎉`)
      dispatch(setActiveDelivery(null))
      setUpdating(false)
      return
    }
    setDelivery((prev) => ({ ...prev, status: next }))
    setUpdating(false)
    toast.success('Status updated')
  }

  if (!hasActiveDelivery) {
    return (
      <>
        <DriverTopbar title="Active Delivery" />
        <main className="flex-1 p-6">
          <div className="max-w-lg mx-auto text-center py-20">
            <p className="text-5xl mb-4">🚗</p>
            <h2 className="text-xl font-bold text-[#1A1814] mb-2">No Active Delivery</h2>
            <p className="text-[#9C968E] mb-6">
              Accept a job from the jobs board to start delivering.
            </p>
            <Link
              href="/afrocart/driver/jobs"
              className="inline-flex items-center px-6 py-3 bg-[#2E7D52] text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DriverTopbar title="Active Delivery" />
      <main className="flex-1 p-6">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Progress stepper */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-[#9C968E] font-mono">{delivery.order_number}</p>
                <h2 className="font-bold text-[#1A1814]">{delivery.pickup_name}</h2>
              </div>
              <span className="text-xl font-bold text-[#B8962E]">{gbp(delivery.earnings)}</span>
            </div>
            <DeliveryProgressStepper currentStatus={delivery.status} />
          </div>

          {/* Route card */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5 space-y-4">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-[#2E7D52] mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-[#9C968E]">Pickup from</p>
                <p className="font-semibold text-[#1A1814]">{delivery.pickup_name}</p>
                <p className="text-sm text-[#5C5750]">{delivery.pickup_address}</p>
              </div>
              <a
                href={`tel:${delivery.pickup_phone}`}
                className="w-9 h-9 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#5C5750] hover:bg-[#E4E0D5] transition-colors"
              >
                <Phone size={16} />
              </a>
            </div>

            <div className="ml-1.5 border-l-2 border-dashed border-[#E4E0D5] h-4" />

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-[#C0392B] mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-[#9C968E]">Deliver to {delivery.customer_first_name}</p>
                <p className="text-sm text-[#5C5750]">{delivery.dropoff_address}</p>
              </div>
              <a
                href={`tel:${delivery.dropoff_phone}`}
                className="w-9 h-9 rounded-full bg-[#F7F5F0] flex items-center justify-center text-[#5C5750] hover:bg-[#E4E0D5] transition-colors"
              >
                <Phone size={16} />
              </a>
            </div>
          </div>

          {/* Order details */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5">
            <p className="text-xs font-medium text-[#9C968E] uppercase tracking-wide mb-2">Order Details</p>
            <p className="text-sm text-[#1A1814]">{delivery.item_summary}</p>
            {delivery.customer_note && (
              <div className="mt-3 bg-[#F7F5F0] rounded-xl p-3">
                <p className="text-xs font-medium text-[#9C968E] mb-1">Customer Note</p>
                <p className="text-sm text-[#5C5750]">{delivery.customer_note}</p>
              </div>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-[#9C968E]">
              <span>📍 {delivery.distance_miles} mi</span>
              <span>⏱ ~{delivery.estimated_minutes} min</span>
            </div>
          </div>

          {/* Action button */}
          <ActiveDeliveryStatusButton
            status={delivery.status}
            onAction={handleStatusUpdate}
            isLoading={updating}
          />

          {/* Secondary actions */}
          <div className="flex gap-3">
            <button
              onClick={() => toast('Chat feature coming soon')}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#E4E0D5] rounded-xl text-sm text-[#5C5750] hover:bg-[#F7F5F0] transition-colors"
            >
              <MessageSquare size={16} />
              Message Customer
            </button>
            <button
              onClick={() => setShowIssue(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#E4E0D5] rounded-xl text-sm text-[#C0392B] hover:bg-red-50 transition-colors"
            >
              <AlertTriangle size={16} />
              Report Issue
            </button>
          </div>

        </div>
      </main>

      {showIssue && <IssueReportModal onClose={() => setShowIssue(false)} />}
    </>
  )
}
