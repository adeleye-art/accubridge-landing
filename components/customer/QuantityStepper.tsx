'use client'

import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
}

export function QuantityStepper({ value, onChange, min = 0, max, size = 'md' }: QuantityStepperProps) {
  const btnCls = size === 'sm'
    ? 'w-7 h-7 text-sm'
    : 'w-9 h-9 text-base'

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          'rounded-lg bg-[#EFECE5] border border-[#E4E0D5] flex items-center justify-center font-bold text-[#1A1814]',
          'hover:bg-[#E4E0D5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
          btnCls
        )}
      >
        −
      </button>
      <span className={cn(
        'font-semibold text-[#B8962E] min-w-[1.5rem] text-center',
        size === 'sm' ? 'text-sm' : 'text-base'
      )}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        disabled={max !== undefined && value >= max}
        className={cn(
          'rounded-lg bg-[#B8962E] flex items-center justify-center font-bold text-white',
          'hover:bg-[#A07828] disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
          btnCls
        )}
      >
        +
      </button>
    </div>
  )
}
