'use client'

import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

interface Step {
  status: OrderStatus
  label: string
  emoji: string
}

const STEPS: Step[] = [
  { status: 'pending',   label: 'Order Placed', emoji: '📋' },
  { status: 'accepted',  label: 'Accepted',     emoji: '✅' },
  { status: 'preparing', label: 'Preparing',    emoji: '🍳' },
  { status: 'picked_up', label: 'Picked Up',    emoji: '🛵' },
  { status: 'delivered', label: 'Delivered',    emoji: '🎉' },
]

const STATUS_ORDER: OrderStatus[] = ['pending', 'accepted', 'preparing', 'picked_up', 'delivered', 'completed']

interface OrderStatusStepperProps {
  currentStatus: OrderStatus
  timeline?: { status: OrderStatus; timestamp: string }[]
}

function getTimestamp(timeline: { status: OrderStatus; timestamp: string }[], status: OrderStatus) {
  return timeline.find((t) => t.status === status)?.timestamp
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function OrderStatusStepper({ currentStatus, timeline = [] }: OrderStatusStepperProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus === 'completed' ? 'delivered' : currentStatus)

  return (
    <div className="flex items-start">
      {STEPS.map((step, idx) => {
        const stepIndex  = STATUS_ORDER.indexOf(step.status)
        const completed  = stepIndex < currentIndex || (currentStatus === 'completed' || currentStatus === 'delivered')
        const isCurrent  = stepIndex === currentIndex && currentStatus !== 'completed'
        const timestamp  = getTimestamp(timeline, step.status)

        return (
          <div key={step.status} className="flex-1 flex flex-col items-center">
            {/* Line + circle row */}
            <div className="flex items-center w-full">
              {/* Left connector */}
              <div className={cn(
                'flex-1 h-0.5',
                idx === 0 ? 'invisible' : completed || isCurrent ? 'bg-[#B8962E]' : 'bg-[#E4E0D5]'
              )} />

              {/* Circle */}
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 relative',
                completed
                  ? 'bg-[#B8962E] text-white'
                  : isCurrent
                  ? 'bg-[#B8962E]/20 border-2 border-[#B8962E]'
                  : 'bg-[#E4E0D5] text-[#9C968E]'
              )}>
                {step.emoji}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full border-2 border-[#B8962E] animate-ping opacity-40" />
                )}
              </div>

              {/* Right connector */}
              <div className={cn(
                'flex-1 h-0.5',
                idx === STEPS.length - 1 ? 'invisible' : completed ? 'bg-[#B8962E]' : 'bg-[#E4E0D5]'
              )} />
            </div>

            {/* Label + timestamp */}
            <div className="mt-2 text-center">
              <p className={cn(
                'text-xs font-medium',
                completed || isCurrent ? 'text-[#1A1814]' : 'text-[#9C968E]'
              )}>
                {step.label}
              </p>
              {timestamp && (
                <p className="text-xs text-[#9C968E] mt-0.5">{formatTime(timestamp)}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
