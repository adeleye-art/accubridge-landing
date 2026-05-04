'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { ChevronDown, ChevronUp, Lock, Plus, Loader2 } from 'lucide-react'
import { CheckoutAddressCard } from '@/components/customer/CheckoutAddressCard'
import { PaymentMethodCard } from '@/components/customer/PaymentMethodCard'
import { selectCart, selectCartItems, selectCartSubtotal, clearCart } from '@/store/cartSlice'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Address } from '@/types'
import type { AppDispatch } from '@/store'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ADDRESSES: Address[] = [
  { id: 'a1', label: 'Home', full_address: '42 Peckham High Street, London SE15 5EB', postcode: 'SE15 5EB', is_default: true },
  { id: 'a2', label: 'Work', full_address: '10 Canada Square, Canary Wharf, London E14 5AB', postcode: 'E14 5AB', is_default: false },
]

const MOCK_DELIVERY_FEE  = 199
const MOCK_CREDITS_BAL   = 1000
const MOCK_DISCOUNT      = 0

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

type PaymentMethod = 'card' | 'credits' | 'cash'

export default function CheckoutPage() {
  const router    = useRouter()
  const dispatch  = useDispatch<AppDispatch>()
  const cart      = useSelector(selectCart)
  const items     = useSelector(selectCartItems)
  const subtotal  = useSelector(selectCartSubtotal)

  const [selectedAddress, setSelectedAddress] = useState(MOCK_ADDRESSES[0]?.id ?? '')
  const [instructions,    setInstructions]    = useState('')
  const [paymentMethod,   setPaymentMethod]   = useState<PaymentMethod>('card')
  const [showAddAddress,  setShowAddAddress]  = useState(false)
  const [newAddress,      setNewAddress]      = useState({ label: 'Home', full_address: '', postcode: '', is_default: false })
  const [showAllItems,    setShowAllItems]    = useState(false)
  const [placing,         setPlacing]         = useState(false)
  const [addresses,       setAddresses]       = useState(MOCK_ADDRESSES)

  // Guard: redirect if cart empty
  useEffect(() => {
    if (items.length === 0) router.replace('/afrocart/customer/home')
  }, [items.length, router])

  const creditsApplied  = paymentMethod === 'credits' ? Math.min(MOCK_CREDITS_BAL, subtotal + MOCK_DELIVERY_FEE) : 0
  const total           = Math.max(0, subtotal + MOCK_DELIVERY_FEE - MOCK_DISCOUNT - creditsApplied)
  const displayItems    = showAllItems ? items : items.slice(0, 3)
  const creditsShortfall = paymentMethod === 'credits' && MOCK_CREDITS_BAL < total ? total - MOCK_CREDITS_BAL : 0

  async function handlePlaceOrder() {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    if (paymentMethod === 'credits' && creditsShortfall > 0) { toast.error('Insufficient credits'); return }
    setPlacing(true)
    await new Promise((r) => setTimeout(r, 1400))
    dispatch(clearCart())
    toast.success('Order placed! 🎉')
    router.push('/afrocart/customer/orders/mock-order-1')
  }

  function handleSaveAddress() {
    if (!newAddress.full_address.trim() || !newAddress.postcode.trim()) return
    const addr: Address = { id: `a${Date.now()}`, ...newAddress }
    setAddresses((prev) => [...prev, addr])
    setSelectedAddress(addr.id)
    setShowAddAddress(false)
    setNewAddress({ label: 'Home', full_address: '', postcode: '', is_default: false })
    toast.success('Address saved')
  }

  if (items.length === 0) return null

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-[#1A1814] mb-6">Checkout</h1>

      <div className="flex gap-8 items-start">
        {/* LEFT */}
        <div className="flex-1 space-y-6">

          {/* Section 1: Delivery Address */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
            <h2 className="font-semibold text-[#1A1814] mb-4">Delivery Address</h2>
            <div className="space-y-3">
              {addresses.map((addr) => (
                <CheckoutAddressCard
                  key={addr.id}
                  address={addr}
                  selected={selectedAddress === addr.id}
                  onSelect={() => setSelectedAddress(addr.id)}
                />
              ))}
            </div>

            {/* Add new address toggle */}
            <button
              onClick={() => setShowAddAddress((v) => !v)}
              className="mt-3 flex items-center gap-1.5 text-sm text-[#B8962E] hover:underline"
            >
              <Plus size={14} /> Add New Address
            </button>

            {showAddAddress && (
              <div className="mt-4 p-4 bg-[#F7F5F0] rounded-xl border border-[#E4E0D5] space-y-3">
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setNewAddress((a) => ({ ...a, label: l }))}
                      className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
                        newAddress.label === l ? 'bg-[#B8962E] text-white border-[#B8962E]' : 'border-[#E4E0D5] text-[#5C5750] hover:border-[#B8962E]'
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Full address"
                  value={newAddress.full_address}
                  onChange={(e) => setNewAddress((a) => ({ ...a, full_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E4E0D5] rounded-lg text-sm focus:outline-none focus:border-[#B8962E] bg-white"
                />
                <input
                  type="text"
                  placeholder="Postcode"
                  value={newAddress.postcode}
                  onChange={(e) => setNewAddress((a) => ({ ...a, postcode: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E4E0D5] rounded-lg text-sm focus:outline-none focus:border-[#B8962E] bg-white"
                />
                <label className="flex items-center gap-2 text-sm text-[#5C5750] cursor-pointer">
                  <input type="checkbox" checked={newAddress.is_default} onChange={(e) => setNewAddress((a) => ({ ...a, is_default: e.target.checked }))} className="accent-[#B8962E]" />
                  Set as default address
                </label>
                <button onClick={handleSaveAddress} className="px-4 py-2 bg-[#B8962E] text-white rounded-lg text-sm font-semibold hover:bg-[#A07828] transition-colors">Save Address</button>
              </div>
            )}
          </div>

          {/* Section 2: Delivery Instructions */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
            <h2 className="font-semibold text-[#1A1814] mb-4">Delivery Instructions</h2>
            <textarea
              placeholder="Any notes for the driver? (e.g. Ring doorbell, leave at door)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, 200))}
              rows={3}
              className="w-full px-3 py-2 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] resize-none bg-[#F7F5F0] text-[#1A1814] placeholder:text-[#9C968E]"
            />
            <p className="text-xs text-[#9C968E] mt-1 text-right">{instructions.length}/200</p>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
            <h2 className="font-semibold text-[#1A1814] mb-4">Payment Method</h2>
            <div className="space-y-3">
              <PaymentMethodCard id="card" emoji="💳" label="Pay by card" selected={paymentMethod === 'card'} onSelect={() => setPaymentMethod('card')}>
                <div className="space-y-3 pt-2">
                  <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} className="w-full px-3 py-2 border border-[#E4E0D5] rounded-lg text-sm focus:outline-none focus:border-[#B8962E] font-mono bg-[#F7F5F0]" />
                  <div className="flex gap-3">
                    <input type="text" placeholder="MM/YY" maxLength={5} className="flex-1 px-3 py-2 border border-[#E4E0D5] rounded-lg text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0]" />
                    <input type="text" placeholder="CVV" maxLength={4} className="w-24 px-3 py-2 border border-[#E4E0D5] rounded-lg text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0]" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#5C5750] cursor-pointer">
                    <input type="checkbox" className="accent-[#B8962E]" /> Save this card
                  </label>
                </div>
              </PaymentMethodCard>

              <PaymentMethodCard
                id="credits"
                emoji="🪙"
                label="Use Credits"
                subtitle={`Balance: ${gbp(MOCK_CREDITS_BAL)}`}
                selected={paymentMethod === 'credits'}
                onSelect={() => setPaymentMethod('credits')}
                disabled={(MOCK_CREDITS_BAL as number) === 0}
                disabledReason={creditsShortfall > 0 ? `Insufficient credits — ${gbp(creditsShortfall)} remaining` : undefined}
              />

              <PaymentMethodCard id="cash" emoji="💵" label="Pay in cash" subtitle="Pay the driver on arrival" selected={paymentMethod === 'cash'} onSelect={() => setPaymentMethod('cash')} />
            </div>
          </div>
        </div>

        {/* RIGHT — sticky summary */}
        <div className="w-[340px] flex-shrink-0 sticky top-24">
          <div className="bg-[#EFECE5] rounded-2xl border border-[#E4E0D5] p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-[#1A1814]">{cart.vendor_name}</p>
              <p className="text-xs text-[#9C968E]">{items.length} item{items.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Items list */}
            <div className="space-y-2 mb-4">
              {displayItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#5C5750] truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
                  <span className="text-[#1A1814] font-medium flex-shrink-0">{gbp(item.price * item.quantity)}</span>
                </div>
              ))}
              {items.length > 3 && (
                <button onClick={() => setShowAllItems((v) => !v)} className="flex items-center gap-1 text-xs text-[#B8962E] hover:underline">
                  {showAllItems ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {items.length} items</>}
                </button>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-sm border-t border-[#E4E0D5] pt-4 mb-5">
              <div className="flex justify-between text-[#5C5750]"><span>Subtotal</span><span>{gbp(subtotal)}</span></div>
              <div className="flex justify-between text-[#5C5750]"><span>Delivery</span><span>{gbp(MOCK_DELIVERY_FEE)}</span></div>
              {creditsApplied > 0 && (
                <div className="flex justify-between text-[#2E7D52]"><span>Credits Applied</span><span>−{gbp(creditsApplied)}</span></div>
              )}
              <div className="flex justify-between font-bold text-[#1A1814] text-base border-t border-[#E4E0D5] pt-2">
                <span>Total</span><span>{gbp(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || (paymentMethod === 'credits' && creditsShortfall > 0)}
              className="w-full h-12 bg-[#B8962E] text-white rounded-xl font-semibold text-base hover:bg-[#A07828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {placing ? <><Loader2 size={18} className="animate-spin" /> Placing order...</> : 'Place Order'}
            </button>
            <p className="text-center text-xs text-[#9C968E] mt-3 flex items-center justify-center gap-1">
              <Lock size={11} /> Secure checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
