'use client'

import { cn } from '@/lib/utils'

interface PaymentMethodCardProps {
  id: string
  label: string
  subtitle?: string
  emoji: string
  selected: boolean
  disabled?: boolean
  disabledReason?: string
  onSelect: () => void
  children?: React.ReactNode
}

export function PaymentMethodCard({
  id,
  label,
  subtitle,
  emoji,
  selected,
  disabled = false,
  disabledReason,
  onSelect,
  children,
}: PaymentMethodCardProps) {
  return (
    <div className={cn(
      'rounded-xl border-2 transition-colors',
      disabled
        ? 'border-[#E4E0D5] bg-[#F7F5F0] opacity-60 cursor-not-allowed'
        : selected
        ? 'border-[#B8962E] bg-[#E8D5A3]/20'
        : 'border-[#E4E0D5] bg-white hover:border-[#C9A84C] cursor-pointer'
    )}>
      <label className={cn('flex items-center gap-3 p-4', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
        <input
          type="radio"
          name="payment_method"
          id={id}
          disabled={disabled}
          checked={selected}
          onChange={onSelect}
          className="accent-[#B8962E]"
        />
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1">
          <p className="font-semibold text-[#1A1814] text-sm">{label}</p>
          {disabledReason ? (
            <p className="text-xs text-[#C0392B] mt-0.5">{disabledReason}</p>
          ) : subtitle ? (
            <p className="text-xs text-[#9C968E] mt-0.5">{subtitle}</p>
          ) : null}
        </div>
      </label>

      {/* Expandable content (e.g. card fields) */}
      {selected && children && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  )
}
