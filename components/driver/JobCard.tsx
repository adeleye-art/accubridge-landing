'use client'

import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { MapPin, Clock, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setActiveDelivery } from '@/store/driverSlice'
import { useAcceptJobMutation, useDeclineJobMutation } from '@/store/api/driverApi'
import toast from 'react-hot-toast'
import type { AvailableJob } from '@/types'
import type { AppDispatch } from '@/store'

interface JobCardProps {
  job: AvailableJob
  size?: 'sm' | 'lg'
}

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 min ago'
  return `${mins} min ago`
}

const TYPE_CONFIG = {
  food:     { emoji: '🍛', label: 'Food',     cls: 'bg-amber-100 text-amber-800' },
  grocery:  { emoji: '🛒', label: 'Grocery',  cls: 'bg-green-100 text-green-800' },
  delivery: { emoji: '📦', label: 'Delivery', cls: 'bg-blue-100 text-blue-800'  },
}

export function JobCard({ job, size = 'sm' }: JobCardProps) {
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [accept, { isLoading: accepting }] = useAcceptJobMutation()
  const [decline, { isLoading: declining }] = useDeclineJobMutation()

  const cfg = TYPE_CONFIG[job.type] ?? TYPE_CONFIG.delivery

  async function handleAccept() {
    try {
      const result = await accept(job.id).unwrap()
      dispatch(setActiveDelivery(result.id))
      toast.success('Job accepted!')
      router.push('/afrocart/driver/active')
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 409) {
        toast.error('Complete your current delivery first')
      } else {
        toast.error('Failed to accept job')
      }
    }
  }

  async function handleDecline() {
    try {
      await decline({ id: job.id }).unwrap()
      toast.success('Job declined')
    } catch {
      toast.error('Failed to decline job')
    }
  }

  if (size === 'sm') {
    return (
      <div className="bg-white rounded-xl border border-[#E4E0D5] p-4 mb-3">
        {/* Row 1 */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.cls)}>
            {cfg.emoji} {cfg.label}
          </span>
          <span className="text-xs text-[#9C968E] ml-auto">{timeAgo(job.posted_at)}</span>
          <span className="text-lg font-bold text-[#B8962E] ml-3">{gbp(job.earnings)}</span>
        </div>

        {/* Row 2 — route */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D52] flex-shrink-0" />
            <span className="text-sm font-medium text-[#1A1814] truncate">{job.pickup_name}</span>
          </div>
          <div className="ml-1 border-l-2 border-dashed border-[#E4E0D5] h-2" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C0392B] flex-shrink-0" />
            <span className="text-sm text-[#5C5750] truncate">{job.dropoff_address}</span>
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#9C968E] flex items-center gap-1">
            <MapPin size={11} /> {job.distance_miles} mi
          </span>
          <span className="text-xs text-[#9C968E] flex items-center gap-1">
            <Clock size={11} /> ~{job.estimated_minutes} min
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleDecline}
              disabled={declining || accepting}
              className="px-3 py-1.5 text-xs text-[#9C968E] border border-[#E4E0D5] rounded-lg hover:bg-[#F7F5F0] transition-colors disabled:opacity-40"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting || declining}
              className="px-5 py-1.5 text-sm font-medium bg-[#2E7D52] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40"
            >
              {accepting ? 'Accepting...' : 'Accept'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Large card
  return (
    <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', cfg.cls)}>
              {cfg.emoji} {cfg.label}
            </span>
            <span className="text-xs text-[#9C968E]">{timeAgo(job.posted_at)}</span>
          </div>
          <p className="text-xs text-[#9C968E] font-mono">{job.order_number}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#B8962E]">{gbp(job.earnings)}</p>
          <p className="text-xs text-[#9C968E]">~{job.estimated_minutes} min · {job.distance_miles} miles</p>
        </div>
      </div>

      {/* Route visual */}
      <div className="bg-[#F7F5F0] rounded-xl p-4 mb-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <span className="w-3 h-3 rounded-full bg-[#2E7D52] flex-shrink-0" />
            <div className="flex-1 w-0.5 bg-dashed border-l-2 border-dashed border-[#E4E0D5] h-6" />
            <span className="w-3 h-3 rounded-full bg-[#C0392B] flex-shrink-0" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-[#9C968E]">Pickup</p>
              <p className="text-sm font-semibold text-[#1A1814]">{job.pickup_name}</p>
              <p className="text-xs text-[#5C5750]">{job.pickup_address}</p>
            </div>
            <div>
              <p className="text-xs text-[#9C968E]">Deliver to {job.customer_first_name}</p>
              <p className="text-xs text-[#5C5750]">{job.dropoff_address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Item info */}
      {job.item_summary && (
        <p className="text-sm text-[#5C5750] mb-4">
          <span className="font-medium text-[#1A1814]">Items:</span> {job.item_summary}
        </p>
      )}

      {/* Actions */}
      <button
        onClick={handleAccept}
        disabled={accepting || declining}
        className="w-full py-3 bg-[#2E7D52] text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 mb-2"
      >
        {accepting ? 'Accepting...' : 'Accept Job'}
      </button>
      <button
        onClick={handleDecline}
        disabled={declining || accepting}
        className="w-full text-sm text-[#9C968E] hover:text-[#5C5750] transition-colors"
      >
        Decline
      </button>
    </div>
  )
}
