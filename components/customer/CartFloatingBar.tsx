'use client'

import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { selectCartItems, selectCartCount, selectCartSubtotal } from '@/store/cartSlice'

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

export function CartFloatingBar() {
  const router = useRouter()
  const items    = useSelector(selectCartItems)
  const count    = useSelector(selectCartCount)
  const subtotal = useSelector(selectCartSubtotal)

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4">
      <button
        onClick={() => router.push('/afrocart/customer/cart')}
        className="w-full max-w-2xl mx-auto flex items-center justify-between bg-[#B8962E] text-white px-6 py-4 rounded-t-2xl shadow-xl hover:bg-[#A07828] transition-colors"
      >
        <span className="font-semibold">{count} {count === 1 ? 'item' : 'items'} in your cart</span>
        <span className="font-semibold">View Cart → {gbp(subtotal)}</span>
      </button>
    </div>
  )
}
