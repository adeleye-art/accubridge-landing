'use client'

import { useDispatch, useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import { QuantityStepper } from './QuantityStepper'
import { addItem, updateQuantity, selectCartItems } from '@/store/cartSlice'
import type { AppDispatch } from '@/store'
import type { MenuItem } from '@/types'

interface MenuItemRowProps {
  item: MenuItem
  vendorId: string
  vendorName: string
  onVendorMismatch?: (newVendorName: string, newItem: MenuItem) => void
}

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

export function MenuItemRow({ item, vendorId, vendorName, onVendorMismatch }: MenuItemRowProps) {
  const dispatch = useDispatch<AppDispatch>()
  const cartItems = useSelector(selectCartItems)
  const cartItem = cartItems.find((ci) => ci.menu_item_id === item.id)
  const qty = cartItem?.quantity ?? 0

  function handleAdd() {
    try {
      dispatch(addItem({
        id:          `ci_${item.id}`,
        menu_item_id: item.id,
        vendor_id:   vendorId,
        vendor_name: vendorName,
        name:        item.name,
        description: item.description,
        price:       item.price,
        quantity:    1,
        image_url:   item.image_url,
        category:    item.category,
      }))
    } catch (e: unknown) {
      const msg = (e as Error).message ?? ''
      if (msg.startsWith('VENDOR_MISMATCH:')) {
        const existingVendor = msg.replace('VENDOR_MISMATCH:', '')
        onVendorMismatch?.(existingVendor, item)
      }
    }
  }

  function handleQtyChange(newQty: number) {
    dispatch(updateQuantity({ menu_item_id: item.id, quantity: newQty }))
  }

  return (
    <div className="bg-[#EFECE5] rounded-xl border border-[#E4E0D5] p-4 mb-3 flex items-center gap-4">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg bg-[#E4E0D5] flex-shrink-0 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1A1814] text-sm">{item.name}</p>
        <p className="text-sm text-[#9C968E] line-clamp-2 mt-1">{item.description}</p>
        {!item.availability && (
          <span className="inline-block text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 mt-1">
            Unavailable
          </span>
        )}
      </div>

      {/* Price + Action */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <p className="font-bold text-[#1A1814] text-lg">{gbp(item.price)}</p>
        {item.availability && (
          qty === 0 ? (
            <button
              onClick={handleAdd}
              className="w-9 h-9 bg-[#B8962E] text-white rounded-lg flex items-center justify-center hover:bg-[#A07828] transition-colors"
            >
              <Plus size={18} />
            </button>
          ) : (
            <QuantityStepper value={qty} onChange={handleQtyChange} size="sm" />
          )
        )}
      </div>
    </div>
  )
}
