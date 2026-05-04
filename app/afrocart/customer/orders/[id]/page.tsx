'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Star, MapPin, Package, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { OrderStatusStepper } from '@/components/customer/OrderStatusStepper'
import { StarRating } from '@/components/customer/StarRating'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { CustomerOrder } from '@/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ORDERS: Record<string, CustomerOrder> = {
  'mock-order-1': {
    id: 'mock-order-1',
    order_number: '#AC-00401',
    vendor_id: 'r1',
    vendor_name: "Mama's Kitchen",
    items: [
      { name: 'Jollof Rice with Chicken', quantity: 2, unit_price: 1150, total: 2300 },
      { name: 'Fried Plantain',           quantity: 1, unit_price: 350,  total: 350  },
    ],
    subtotal: 2650, delivery_fee: 199, credits_used: 0, discount: 0, total_amount: 2849,
    delivery_address: '42 Peckham High Street, London SE15 5EB',
    status: 'preparing',
    placed_at: new Date(Date.now() - 12 * 60000).toISOString(),
    timeline: [
      { status: 'pending',   timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
      { status: 'accepted',  timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() -  8 * 60000).toISOString() },
    ],
  },
  'o1': {
    id: 'o1',
    order_number: '#AC-00401',
    vendor_id: 'r1',
    vendor_name: "Mama's Kitchen",
    items: [
      { name: 'Jollof Rice with Chicken', quantity: 2, unit_price: 1150, total: 2300 },
      { name: 'Fried Plantain',           quantity: 1, unit_price: 350,  total: 350  },
    ],
    subtotal: 2650, delivery_fee: 199, credits_used: 0, discount: 0, total_amount: 2849,
    delivery_address: '42 Peckham High Street, London SE15 5EB',
    status: 'preparing',
    placed_at: new Date(Date.now() - 12 * 60000).toISOString(),
    timeline: [
      { status: 'pending',   timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
      { status: 'accepted',  timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() -  8 * 60000).toISOString() },
    ],
  },
  'o2': {
    id: 'o2',
    order_number: '#AC-00398',
    vendor_id: 'r2',
    vendor_name: 'Jerk Palace',
    items: [
      { name: 'Jerk Chicken & Rice',  quantity: 1, unit_price: 1350, total: 1350 },
      { name: 'Festival Dumplings',   quantity: 2, unit_price: 300,  total: 600  },
      { name: 'Ginger Beer',          quantity: 1, unit_price: 200,  total: 200  },
    ],
    subtotal: 2150, delivery_fee: 149, credits_used: 200, discount: 0, total_amount: 2099,
    delivery_address: '42 Peckham High Street, London SE15 5EB',
    status: 'delivered',
    driver_name: 'Kwame O.',
    driver_rating: 4.9,
    placed_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 2 * 24 * 3600000 + 40 * 60000).toISOString(),
    timeline: [
      { status: 'pending',   timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
      { status: 'accepted',  timestamp: new Date(Date.now() - 2 * 24 * 3600000 + 5  * 60000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 2 * 24 * 3600000 + 10 * 60000).toISOString() },
      { status: 'picked_up', timestamp: new Date(Date.now() - 2 * 24 * 3600000 + 30 * 60000).toISOString() },
      { status: 'delivered', timestamp: new Date(Date.now() - 2 * 24 * 3600000 + 40 * 60000).toISOString() },
    ],
  },
}

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Order Placed',
  accepted:  'Accepted by Restaurant',
  preparing: 'Being Prepared',
  picked_up: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_COLOURS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  picked_up: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params.id as string

  const order = MOCK_ORDERS[id]

  const [rating,      setRating]      = useState(0)
  const [comment,     setComment]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)

  if (!order) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
        <Package size={56} className="text-[#E4E0D5] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1A1814] mb-2">Order not found</h2>
        <p className="text-sm text-[#9C968E] mb-6">We couldn't find this order.</p>
        <Link href="/afrocart/customer/orders" className="px-6 py-2.5 bg-[#B8962E] text-white rounded-xl font-semibold text-sm hover:bg-[#A07828] transition-colors">
          Back to Orders
        </Link>
      </div>
    )
  }

  async function handleSubmitReview() {
    if (rating === 0) { toast.error('Please select a rating'); return }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    setSubmitted(true)
    toast.success('Review submitted — thank you!')
  }

  const showDriver = ['picked_up', 'delivered'].includes(order.status)
  const showReview = order.status === 'delivered'
  const isActive   = ['pending', 'accepted', 'preparing', 'picked_up'].includes(order.status)

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white border border-[#E4E0D5] flex items-center justify-center hover:bg-[#F7F5F0] transition-colors">
          <ArrowLeft size={16} className="text-[#5C5750]" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#1A1814]">Order {order.order_number}</h1>
          <p className="text-xs text-[#9C968E]">Placed {formatDate(order.placed_at)} at {formatTime(order.placed_at)}</p>
        </div>
        <span className={cn('ml-auto text-xs font-semibold px-3 py-1 rounded-full', STATUS_COLOURS[order.status] ?? 'bg-gray-100 text-gray-600')}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="flex gap-8 items-start">
        {/* LEFT — 58% */}
        <div className="flex-1 space-y-5">

          {/* Map placeholder */}
          <div className="bg-[#E4E0D5] rounded-2xl h-80 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Decorative map-like grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#B8962E" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            {/* Road lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#B8962E" strokeWidth="2" strokeDasharray="8,6" />
              <line x1="35%" y1="0" x2="35%" y2="100%" stroke="#B8962E" strokeWidth="2" strokeDasharray="8,6" />
              <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#B8962E" strokeWidth="1" strokeDasharray="8,6" />
            </svg>
            <div className="relative z-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#B8962E] flex items-center justify-center mx-auto mb-3 shadow-lg">
                <MapPin size={24} className="text-white" />
              </div>
              <p className="text-sm font-medium text-[#5C5750]">Live tracking</p>
              <p className="text-xs text-[#9C968E] mt-1">
                {isActive ? 'Map updates every 30 seconds' : 'Order has been delivered'}
              </p>
            </div>
            {isActive && (
              <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-1.5 shadow-md flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-[#1A1814]">Live</span>
              </div>
            )}
          </div>

          {/* Status stepper */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
            <h2 className="font-semibold text-[#1A1814] mb-5">Order Status</h2>
            <OrderStatusStepper currentStatus={order.status} timeline={order.timeline} />
            {isActive && (
              <div className="mt-4 flex items-center gap-2 text-sm text-[#5C5750] bg-[#F7F5F0] rounded-xl px-4 py-3">
                <Clock size={15} className="text-[#B8962E] flex-shrink-0" />
                <span>Estimated delivery: <strong className="text-[#1A1814]">20–35 min</strong></span>
              </div>
            )}
          </div>

          {/* Driver card — only when picked_up or delivered */}
          {showDriver && (
            <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
              <h2 className="font-semibold text-[#1A1814] mb-4">Your Driver</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#B8962E]/20 flex items-center justify-center font-bold text-[#B8962E] text-xl flex-shrink-0">
                  {(order.driver_name ?? 'D').charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1A1814]">{order.driver_name ?? 'Your Driver'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} fill="#B8962E" stroke="none" />
                    <span className="text-sm text-[#5C5750]">{order.driver_rating?.toFixed(1) ?? '4.8'}</span>
                    <span className="text-xs text-[#9C968E]">· 2,140 deliveries</span>
                  </div>
                </div>
                {order.status === 'picked_up' && order.driver_phone && (
                  <a
                    href={`tel:${order.driver_phone}`}
                    className="w-10 h-10 rounded-full bg-[#B8962E] flex items-center justify-center text-white hover:bg-[#A07828] transition-colors flex-shrink-0"
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Review card — only when delivered */}
          {showReview && (
            <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
              <h2 className="font-semibold text-[#1A1814] mb-1">Rate your order</h2>
              <p className="text-sm text-[#9C968E] mb-4">How was your experience with {order.vendor_name}?</p>
              {submitted ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <CheckCircle2 size={40} className="text-[#2E7D52] mb-3" />
                  <p className="font-semibold text-[#1A1814]">Thanks for your review!</p>
                  <p className="text-sm text-[#9C968E] mt-1">Your feedback helps others discover great food.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <StarRating value={rating} onChange={setRating} />
                    {rating > 0 && (
                      <span className="text-sm text-[#5C5750]">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                      </span>
                    )}
                  </div>
                  <textarea
                    placeholder="Tell us more about your experience (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] resize-none bg-[#F7F5F0] text-[#1A1814] placeholder:text-[#9C968E]"
                  />
                  <p className="text-xs text-[#9C968E] text-right">{comment.length}/500</p>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting || rating === 0}
                    className="px-6 py-2.5 bg-[#B8962E] text-white rounded-xl font-semibold text-sm hover:bg-[#A07828] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — 42% */}
        <div className="w-[380px] flex-shrink-0 space-y-5">

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#B8962E]/20 flex items-center justify-center font-bold text-[#B8962E]">
                {order.vendor_name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-[#1A1814]">{order.vendor_name}</p>
                <p className="text-xs text-[#9C968E]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="text-[#5C5750] flex-1 mr-2">{item.name} × {item.quantity}</span>
                  <span className="text-[#1A1814] font-medium flex-shrink-0">{gbp(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-sm border-t border-[#E4E0D5] pt-3">
              <div className="flex justify-between text-[#5C5750]"><span>Subtotal</span><span>{gbp(order.subtotal)}</span></div>
              <div className="flex justify-between text-[#5C5750]"><span>Delivery</span><span>{gbp(order.delivery_fee)}</span></div>
              {order.credits_used > 0 && (
                <div className="flex justify-between text-[#2E7D52]"><span>Credits Used</span><span>−{gbp(order.credits_used)}</span></div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-[#2E7D52]"><span>Discount</span><span>−{gbp(order.discount)}</span></div>
              )}
              <div className="flex justify-between font-bold text-[#1A1814] text-base border-t border-[#E4E0D5] pt-2">
                <span>Total</span><span>{gbp(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
            <h2 className="font-semibold text-[#1A1814] mb-3">Delivery Address</h2>
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-[#B8962E] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#5C5750]">{order.delivery_address}</p>
            </div>
          </div>

          {/* Order timeline */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
            <h2 className="font-semibold text-[#1A1814] mb-4">Timeline</h2>
            <div className="space-y-3">
              {[...order.timeline].reverse().map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', i === 0 ? 'bg-[#B8962E]' : 'bg-[#E4E0D5]')} />
                  <div>
                    <p className="text-sm font-medium text-[#1A1814]">{STATUS_LABELS[event.status] ?? event.status}</p>
                    <p className="text-xs text-[#9C968E]">{formatDate(event.timestamp)} · {formatTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/afrocart/customer/orders"
              className="flex-1 py-2.5 border border-[#E4E0D5] text-[#5C5750] rounded-xl text-sm font-medium text-center hover:bg-[#F7F5F0] transition-colors"
            >
              All Orders
            </Link>
            {order.status === 'delivered' && (
              <Link
                href="/afrocart/customer/eats"
                className="flex-1 py-2.5 bg-[#B8962E] text-white rounded-xl text-sm font-semibold text-center hover:bg-[#A07828] transition-colors"
              >
                Order Again
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
