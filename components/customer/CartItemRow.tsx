'use client'

import { useDispatch } from 'react-redux'
import { X } from 'lucide-react'
import { QuantityStepper } from './QuantityStepper'
import { removeItem, updateQuantity } from '@/store/cartSlice'
import type { AppDispatch } from '@/store'
import type { CartItem } from '@/types'

interface CartItemRowProps {
  item: CartItem
}

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

export function CartItemRow({ item }: CartItemRowProps) {
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div className="bg-[#EFECE5] rounded-xl p-4 mb-3 flex items-center gap-4">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-[#E4E0D5] flex-shrink-0 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1A1814] text-sm">{item.name}</p>
        <p className="text-xs text-[#9C968E] line-clamp-1 mt-0.5">{item.description}</p>
        <p className="text-xs text-[#5C5750] mt-1">{gbp(item.price)} each</p>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <QuantityStepper
          value={item.quantity}
          onChange={(qty) => dispatch(updateQuantity({ menu_item_id: item.menu_item_id, quantity: qty }))}
          size="sm"
        />
        <p className="font-semibold text-[#1A1814] text-sm">{gbp(item.price * item.quantity)}</p>
        <button
          onClick={() => dispatch(removeItem(item.menu_item_id))}
          className="text-xs text-[#C0392B] hover:underline flex items-center gap-0.5"
        >
          <X size={11} /> Remove
        </button>
      </div>
    </div>
  )
}
