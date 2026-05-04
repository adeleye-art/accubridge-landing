'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart, MapPin, CheckCircle2, X, AlertTriangle } from 'lucide-react'
import { CartItemRow } from '@/components/customer/CartItemRow'
import { selectCart, selectCartItems, selectCartSubtotal, clearCart } from '@/store/cartSlice'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { AppDispatch } from '@/store'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DELIVERY_FEE = 199
const MOCK_CREDITS_BALANCE = 1000 // £10.00

const MOCK_PROMO: Record<string, { discount: number; label: string }> = {
  'AFRO-FIRST': { discount: 200, label: 'AFRO-FIRST applied — £2.00 off' },
  'SAVE5':      { discount: 500, label: 'SAVE5 applied — £5.00 off' },
}

const MOCK_ADDRESS = { id: 'a1', label: 'Home', full_address: '42 Peckham High Street, London SE15 5EB', postcode: 'SE15 5EB', is_default: true }

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

export default function CartPage() {
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const cart     = useSelector(selectCart)
  const items    = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartSubtotal)

  const [promoInput,    setPromoInput]    = useState('')
  const [promoApplied,  setPromoApplied]  = useState<{ code: string; discount: number; label: string } | null>(null)
  const [promoError,    setPromoError]    = useState('')
  const [useCredits,    setUseCredits]    = useState(false)
  const [clearConfirm,  setClearConfirm]  = useState(false)

  const discount      = promoApplied?.discount ?? 0
  const creditsApplied = useCredits ? Math.min(MOCK_CREDITS_BALANCE, Math.max(0, subtotal + MOCK_DELIVERY_FEE - discount)) : 0
  const total         = Math.max(0, subtotal + MOCK_DELIVERY_FEE - discount - creditsApplied)

  function handleApplyPromo() {
    const code = promoInput.trim().toUpperCase()
    const promo = MOCK_PROMO[code]
    if (!promo) {
      setPromoError('Invalid promo code. Try AFRO-FIRST.')
      setPromoApplied(null)
      return
    }
    setPromoApplied({ code, ...promo })
    setPromoError('')
    setPromoInput('')
  }

  function handleClearCart() {
    dispatch(clearCart())
    setClearConfirm(false)
    toast.success('Cart cleared')
  }

  // ── Empty state ──
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 text-center">
        <ShoppingCart size={64} className="text-[#B8962E]/30 mb-5" />
        <h2 className="text-xl font-semibold text-[#1A1814] mb-2">Your cart is empty</h2>
        <p className="text-sm text-[#9C968E] mb-8 max-w-xs">Add items from a restaurant or store to get started</p>
        <div className="flex gap-3">
          <Link href="/afrocart/customer/eats"   className="px-6 py-2.5 bg-[#B8962E] text-white rounded-xl font-semibold text-sm hover:bg-[#A07828] transition-colors">Browse Eats</Link>
          <Link href="/afrocart/customer/market" className="px-6 py-2.5 border-2 border-[#B8962E] text-[#B8962E] rounded-xl font-semibold text-sm hover:bg-[#E8D5A3]/30 transition-colors">Browse Market</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-[#1A1814] mb-6">Your Cart</h1>

      <div className="flex gap-8 items-start">
        {/* LEFT — items */}
        <div className="flex-1 min-w-0">
          {/* Vendor header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#B8962E]/20 flex items-center justify-center font-bold text-[#B8962E]">
              {(cart.vendor_name ?? 'V').charAt(0)}
            </div>
            <p className="text-lg font-semibold text-[#1A1814]">{cart.vendor_name}</p>
            <button
              onClick={() => { dispatch(clearCart()); router.push('/afrocart/customer/eats') }}
              className="ml-auto text-xs text-[#9C968E] hover:text-[#5C5750] hover:underline"
            >
              Change restaurant
            </button>
          </div>

          {/* Items */}
          {items.map((item) => <CartItemRow key={item.id} item={item} />)}

          {/* Clear cart */}
          <div className="pt-2">
            {!clearConfirm ? (
              <button onClick={() => setClearConfirm(true)} className="text-sm text-[#C0392B] hover:underline">
                Clear cart
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-sm text-[#5C5750]">Are you sure?</p>
                <button onClick={handleClearCart} className="text-sm text-[#C0392B] font-semibold hover:underline">Yes, clear</button>
                <button onClick={() => setClearConfirm(false)} className="text-sm text-[#9C968E] hover:underline">Cancel</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — summary */}
        <div className="w-[340px] flex-shrink-0 sticky top-24">
          <div className="bg-[#EFECE5] rounded-2xl border border-[#E4E0D5] p-6 space-y-5">
            <h2 className="font-semibold text-[#1A1814] text-base">Order Summary</h2>

            {/* Promo code */}
            <div>
              {promoApplied ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <CheckCircle2 size={15} className="text-[#2E7D52] flex-shrink-0" />
                  <p className="text-xs text-[#2E7D52] flex-1">{promoApplied.label}</p>
                  <button onClick={() => setPromoApplied(null)} className="text-[#9C968E] hover:text-[#5C5750]"><X size={13} /></button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      className="flex-1 px-3 py-2 border border-[#E4E0D5] rounded-lg text-sm focus:outline-none focus:border-[#B8962E] bg-white text-[#1A1814] placeholder:text-[#9C968E]"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoInput.trim()}
                      className="px-3 py-2 border border-[#B8962E] text-[#B8962E] rounded-lg text-sm font-medium hover:bg-[#E8D5A3]/30 disabled:opacity-40 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-[#C0392B]">{promoError}</p>}
                </div>
              )}
            </div>

            {/* Credits toggle */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A1814]">Use AfroCart Credits</p>
                <p className="text-xs text-[#9C968E]">{gbp(MOCK_CREDITS_BALANCE)} available</p>
              </div>
              <button
                onClick={() => setUseCredits((v) => !v)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                  useCredits ? 'bg-[#B8962E]' : 'bg-[#E4E0D5]'
                )}
              >
                <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', useCredits ? 'translate-x-5' : 'translate-x-0.5')} />
              </button>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#5C5750]">
                <span>Subtotal</span><span>{gbp(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5C5750]">
                <span>Delivery Fee</span><span>{gbp(MOCK_DELIVERY_FEE)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-[#2E7D52]">
                  <span>Promo Code</span><span>−{gbp(discount)}</span>
                </div>
              )}
              {creditsApplied > 0 && (
                <div className="flex justify-between text-[#2E7D52]">
                  <span>Credits Applied</span><span>−{gbp(creditsApplied)}</span>
                </div>
              )}
              <div className="border-t border-[#E4E0D5] pt-2 flex justify-between font-bold text-[#1A1814] text-base">
                <span>Total</span><span>{gbp(total)}</span>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-xl p-3 border border-[#E4E0D5]">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#B8962E] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1A1814]">{MOCK_ADDRESS.label}</p>
                  <p className="text-xs text-[#5C5750] mt-0.5">{MOCK_ADDRESS.full_address}</p>
                </div>
                <button className="text-xs text-[#B8962E] hover:underline flex-shrink-0">Change</button>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push('/afrocart/customer/checkout')}
              className="w-full h-12 bg-[#B8962E] text-white rounded-xl font-semibold hover:bg-[#A07828] transition-colors"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
