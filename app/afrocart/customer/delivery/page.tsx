'use client'

import { useState } from 'react'
import { MapPin, Package, Loader2, ChevronDown, Clock, Bike, ArrowRight } from 'lucide-react'
import { DeliveryRequestCard } from '@/components/customer/DeliveryRequestCard'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { DeliveryItemType, DeliveryRequest, DeliveryQuote } from '@/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_MY_DELIVERIES: DeliveryRequest[] = [
  {
    id: 'd1',
    pickup_location:  '10 Canada Square, Canary Wharf, London E14 5AB',
    dropoff_location: '42 Peckham High Street, London SE15 5EB',
    item_type:        'document',
    item_description: 'Signed contract — handle with care',
    price:            899,
    status:           'delivered',
    driver_name:      'Kwame O.',
    created_at:       new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
  {
    id: 'd2',
    pickup_location:  '78 Rye Lane, London SE15',
    dropoff_location: '22 Atlantic Rd, London SW9',
    item_type:        'parcel_small',
    item_description: 'Birthday gift — fragile',
    price:            699,
    status:           'accepted',
    driver_name:      'Amara S.',
    created_at:       new Date(Date.now() - 35 * 60000).toISOString(),
  },
]

const ITEM_TYPE_OPTIONS: { value: DeliveryItemType; label: string; emoji: string; description: string }[] = [
  { value: 'document',     label: 'Document',      emoji: '📄', description: 'Letters, contracts, paperwork' },
  { value: 'parcel_small', label: 'Small Parcel',  emoji: '📦', description: 'Up to 5kg — fits in a backpack' },
  { value: 'parcel_large', label: 'Large Parcel',  emoji: '🗃️', description: 'Up to 20kg — requires car' },
  { value: 'food',         label: 'Food',          emoji: '🍱', description: 'Hot meals, baked goods' },
  { value: 'groceries',    label: 'Groceries',     emoji: '🛒', description: 'Supermarket & market items' },
  { value: 'other',        label: 'Other',         emoji: '📫', description: 'Anything else' },
]

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

type Step = 'form' | 'quote' | 'confirmed'

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState<'request' | 'my-deliveries'>('request')

  // Form state
  const [pickup,      setPickup]      = useState('')
  const [dropoff,     setDropoff]     = useState('')
  const [itemType,    setItemType]    = useState<DeliveryItemType>('document')
  const [description, setDescription] = useState('')
  const [notes,       setNotes]       = useState('')

  // Step state
  const [step,        setStep]        = useState<Step>('form')
  const [quote,       setQuote]       = useState<DeliveryQuote | null>(null)
  const [loading,     setLoading]     = useState(false)

  async function handleGetQuote() {
    if (!pickup.trim() || !dropoff.trim()) {
      toast.error('Please enter pickup and drop-off locations')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setQuote({
      estimated_price: 799,
      estimated_time:  25,
      vehicle_type:    itemType === 'parcel_large' ? 'Car' : 'Bike',
    })
    setLoading(false)
    setStep('quote')
  }

  async function handleConfirm() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setStep('confirmed')
    toast.success('Delivery request sent! 🚲')
  }

  function handleNewRequest() {
    setPickup('')
    setDropoff('')
    setItemType('document')
    setDescription('')
    setNotes('')
    setQuote(null)
    setStep('form')
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-[#1A1814] mb-1">Delivery</h1>
      <p className="text-sm text-[#9C968E] mb-6">Send anything across London — fast and reliable</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#E4E0D5] rounded-xl p-1 mb-8 w-fit">
        {([['request', 'New Delivery'], ['my-deliveries', 'My Deliveries']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === key ? 'bg-[#B8962E] text-white' : 'text-[#5C5750] hover:text-[#1A1814] hover:bg-[#F7F5F0]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'my-deliveries' ? (
        /* ─── My Deliveries ─────────────────────────────────────────────── */
        <div className="space-y-4 max-w-[700px]">
          {MOCK_MY_DELIVERIES.length === 0 ? (
            <div className="text-center py-20">
              <Bike size={48} className="text-[#E4E0D5] mx-auto mb-4" />
              <p className="font-semibold text-[#5C5750]">No deliveries yet</p>
              <p className="text-sm text-[#9C968E] mt-1">Your delivery history will appear here</p>
            </div>
          ) : (
            MOCK_MY_DELIVERIES.map((d) => <DeliveryRequestCard key={d.id} request={d} />)
          )}
        </div>
      ) : (
        /* ─── Request form ───────────────────────────────────────────────── */
        <div className="flex gap-8 items-start">
          <div className="flex-1 max-w-[620px]">

            {step === 'confirmed' ? (
              /* Confirmed state */
              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Bike size={28} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#1A1814] mb-2">Delivery Confirmed!</h2>
                <p className="text-sm text-[#9C968E] mb-1">We're finding a driver for your delivery.</p>
                <p className="text-sm text-[#9C968E] mb-8">You'll be notified when a driver accepts.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setActiveTab('my-deliveries')}
                    className="px-6 py-2.5 border border-[#E4E0D5] text-[#5C5750] rounded-xl text-sm font-medium hover:bg-[#F7F5F0] transition-colors"
                  >
                    Track Delivery
                  </button>
                  <button
                    onClick={handleNewRequest}
                    className="px-6 py-2.5 bg-[#B8962E] text-white rounded-xl text-sm font-semibold hover:bg-[#A07828] transition-colors"
                  >
                    New Delivery
                  </button>
                </div>
              </div>
            ) : step === 'quote' && quote ? (
              /* Quote step */
              <div className="space-y-5">
                {/* Quote card */}
                <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                  <h2 className="font-semibold text-[#1A1814] mb-4">Your Quote</h2>

                  {/* Route summary */}
                  <div className="bg-[#F7F5F0] rounded-xl p-4 mb-5 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#B8962E] mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#9C968E]">Pickup</p>
                        <p className="text-sm text-[#1A1814]">{pickup}</p>
                      </div>
                    </div>
                    <div className="border-l-2 border-dashed border-[#E4E0D5] ml-1 h-3" />
                    <div className="flex items-start gap-2">
                      <MapPin size={10} className="text-[#B8962E] mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#9C968E]">Drop-off</p>
                        <p className="text-sm text-[#1A1814]">{dropoff}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quote details */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center bg-[#F7F5F0] rounded-xl p-3">
                      <p className="text-xs text-[#9C968E] mb-1">Price</p>
                      <p className="text-lg font-bold text-[#1A1814]">{gbp(quote.estimated_price)}</p>
                    </div>
                    <div className="text-center bg-[#F7F5F0] rounded-xl p-3">
                      <p className="text-xs text-[#9C968E] mb-1">Est. Time</p>
                      <p className="text-lg font-bold text-[#1A1814]">{quote.estimated_time} min</p>
                    </div>
                    <div className="text-center bg-[#F7F5F0] rounded-xl p-3">
                      <p className="text-xs text-[#9C968E] mb-1">Vehicle</p>
                      <p className="text-lg font-bold text-[#1A1814]">{quote.vehicle_type}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('form')}
                      className="flex-1 py-3 border border-[#E4E0D5] text-[#5C5750] rounded-xl text-sm font-medium hover:bg-[#F7F5F0] transition-colors"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="flex-1 py-3 bg-[#B8962E] text-white rounded-xl text-sm font-semibold hover:bg-[#A07828] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 size={15} className="animate-spin" /> Confirming...</> : <>Confirm & Book <ArrowRight size={15} /></>}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Form step */
              <div className="space-y-5">
                {/* Locations */}
                <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6 space-y-4">
                  <h2 className="font-semibold text-[#1A1814]">Locations</h2>
                  <div>
                    <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Pickup Address</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8962E]" />
                      <input
                        type="text"
                        placeholder="Where should the driver collect from?"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0] text-[#1A1814] placeholder:text-[#9C968E]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#E4E0D5]" />
                    <ArrowRight size={14} className="text-[#9C968E]" />
                    <div className="flex-1 h-px bg-[#E4E0D5]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Drop-off Address</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C968E]" />
                      <input
                        type="text"
                        placeholder="Where should it be delivered?"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0] text-[#1A1814] placeholder:text-[#9C968E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Item type */}
                <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                  <h2 className="font-semibold text-[#1A1814] mb-3">What are you sending?</h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ITEM_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setItemType(opt.value)}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-colors',
                          itemType === opt.value
                            ? 'border-[#B8962E] bg-[#E8D5A3]/30'
                            : 'border-[#E4E0D5] hover:border-[#B8962E]/50 hover:bg-[#F7F5F0]'
                        )}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <p className="text-sm font-medium text-[#1A1814] mt-1">{opt.label}</p>
                        <p className="text-xs text-[#9C968E] mt-0.5 leading-tight">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional details */}
                <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6 space-y-4">
                  <h2 className="font-semibold text-[#1A1814]">Additional Details</h2>
                  <div>
                    <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Item Description <span className="normal-case font-normal">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Signed contract, birthday cake, phone charger..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0] text-[#1A1814] placeholder:text-[#9C968E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Notes for Driver <span className="normal-case font-normal">(optional)</span></label>
                    <textarea
                      placeholder="e.g. Call on arrival, fragile items, leave with reception..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 200))}
                      rows={2}
                      className="w-full px-3 py-2 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] resize-none bg-[#F7F5F0] text-[#1A1814] placeholder:text-[#9C968E]"
                    />
                    <p className="text-xs text-[#9C968E] mt-1 text-right">{notes.length}/200</p>
                  </div>
                </div>

                {/* Get quote button */}
                <button
                  onClick={handleGetQuote}
                  disabled={loading}
                  className="w-full h-12 bg-[#B8962E] text-white rounded-xl font-semibold hover:bg-[#A07828] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Getting quote...</> : 'Get Instant Quote'}
                </button>
              </div>
            )}
          </div>

          {/* Right — info panel */}
          <div className="w-[320px] flex-shrink-0 sticky top-24 space-y-4">
            <div className="bg-[#1E1B16] rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4">How it works</h3>
              <div className="space-y-4">
                {[
                  { icon: MapPin, step: '1', text: 'Enter pickup & drop-off addresses' },
                  { icon: Package, step: '2', text: 'Tell us what you\'re sending' },
                  { icon: Clock,  step: '3', text: 'Get an instant price quote' },
                  { icon: Bike,   step: '4', text: 'A local driver picks up and delivers' },
                ].map(({ icon: Icon, step: s, text }) => (
                  <div key={s} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#B8962E] flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {s}
                    </div>
                    <p className="text-sm text-[#C9A84C]/80 mt-0.5">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5 space-y-3">
              <p className="font-semibold text-[#1A1814] text-sm">Pricing guide</p>
              {[
                ['Documents', 'From £4.99'],
                ['Small Parcels', 'From £6.99'],
                ['Large Parcels', 'From £12.99'],
                ['Food & Groceries', 'From £5.99'],
              ].map(([type, price]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-[#5C5750]">{type}</span>
                  <span className="font-medium text-[#1A1814]">{price}</span>
                </div>
              ))}
              <p className="text-xs text-[#9C968E] pt-1 border-t border-[#E4E0D5]">Final price depends on distance and item size.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
