'use client'

import { cn } from '@/lib/utils'
import type { ActiveDelivery } from '@/types'

type ActiveStatus = ActiveDelivery['status'] | 'delivered'

interface DeliveryProgressStepperProps {
  currentStatus: ActiveStatus
}

const STEPS: { key: ActiveStatus; label: string }[] = [
  { key: 'accepted',          label: 'Accepted'      },
  { key: 'en_route_pickup',   label: 'En Route'      },
  { key: 'picked_up',         label: 'Picked Up'     },
  { key: 'en_route_dropoff',  label: 'Delivering'    },
  { key: 'delivered',         label: 'Delivered'     },
]

const ORDER: ActiveStatus[] = [
  'accepted', 'en_route_pickup', 'picked_up', 'en_route_dropoff', 'delivered'
]

export function DeliveryProgressStepper({ currentStatus }: DeliveryProgressStepperProps) {
  const currentIdx = ORDER.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-0 mt-6">
      {STEPS.map((step, i) => {
        const done    = i < currentIdx
        const active  = i === currentIdx
        const pending = i > currentIdx
        const isLast  = i === STEPS.length - 1

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                done    ? 'bg-[#2E7D52] text-white' :
                active  ? 'bg-[#B8962E] text-white ring-4 ring-[#B8962E]/20' :
                          'bg-[#E4E0D5] text-[#9C968E]'
              )}>
                {done ? '✓' : i + 1}
              </div>
              <span className={cn(
                'text-xs text-center whitespace-nowrap',
                done   ? 'text-[#2E7D52]' :
                active ? 'text-[#B8962E] font-medium' :
                         'text-[#9C968E]'
              )}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn(
                'flex-1 h-0.5 mb-4 mx-1',
                i < currentIdx ? 'bg-[#2E7D52]' : 'bg-[#E4E0D5]'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
