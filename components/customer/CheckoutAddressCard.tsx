'use client'

import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Address } from '@/types'

interface CheckoutAddressCardProps {
  address: Address
  selected: boolean
  onSelect: () => void
}

export function CheckoutAddressCard({ address, selected, onSelect }: CheckoutAddressCardProps) {
  return (
    <label className={cn(
      'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors',
      selected
        ? 'border-[#B8962E] bg-[#E8D5A3]/20'
        : 'border-[#E4E0D5] bg-white hover:border-[#C9A84C]'
    )}>
      <input
        type="radio"
        name="delivery_address"
        checked={selected}
        onChange={onSelect}
        className="mt-0.5 accent-[#B8962E]"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            selected ? 'bg-[#B8962E] text-white' : 'bg-[#EFECE5] text-[#5C5750]'
          )}>
            {address.label}
          </span>
          {address.is_default && (
            <span className="text-xs text-[#9C968E]">Default</span>
          )}
        </div>
        <p className="text-sm text-[#1A1814] mt-1 flex items-start gap-1.5">
          <MapPin size={13} className="text-[#9C968E] mt-0.5 flex-shrink-0" />
          {address.full_address}
        </p>
        <p className="text-xs text-[#9C968E] ml-[21px]">{address.postcode}</p>
      </div>
    </label>
  )
}
