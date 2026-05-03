'use client'

import { useState } from 'react'
import { ShoppingBag, TrendingUp, Timer, Star } from 'lucide-react'
import { KpiCard } from '@/components/admin/KpiCard'
import { IncomingOrderCard } from '@/components/vendor/IncomingOrderCard'
import { OrderKanban } from '@/components/vendor/OrderKanban'
import { AcceptOrderModal } from '@/components/vendor/AcceptOrderModal'
import { RejectOrderModal } from '@/components/vendor/RejectOrderModal'
import toast from 'react-hot-toast'
import type { VendorStats, VendorOrder } from '@/types'

const MOCK_STATS: VendorStats = {
  orders_today: 12,
  revenue_today: 48600,
  avg_prep_time: 18,
  rating: 4.7,
  orders_this_week: 84,
  revenue_this_week: 341200,
  daily_earnings: [],
}

const now = new Date()
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString()

const MOCK_INCOMING: VendorOrder[] = [
  {
    id: 'i1', order_number: '#AC-00342', customer_name: 'Adaeze Obi',
    customer_address: '14 Coldharbour Lane, London SE5 9NR',
    items: [
      { name: 'Jollof Rice', quantity: 2, unit_price: 850, total: 1700 },
      { name: 'Fried Plantain', quantity: 1, unit_price: 350, total: 350 },
    ],
    subtotal: 2050, delivery_fee: 199, total_amount: 2249,
    payment_status: 'paid', status: 'pending',
    placed_at: minsAgo(2),
  },
  {
    id: 'i2', order_number: '#AC-00343', customer_name: 'Kwame Asante',
    customer_address: '7 Electric Avenue, London SW9 8LA',
    customer_note: 'Extra spicy please',
    items: [
      { name: 'Pepper Soup', quantity: 1, unit_price: 750, total: 750 },
      { name: 'Puff Puff', quantity: 2, unit_price: 300, total: 600 },
    ],
    subtotal: 1350, delivery_fee: 199, total_amount: 1549,
    payment_status: 'paid', status: 'pending',
    placed_at: minsAgo(5),
  },
]

const MOCK_ACTIVE: VendorOrder[] = [
  {
    id: 'a1', order_number: '#AC-00338', customer_name: 'Ngozi Iwu',
    customer_address: '22 Stockwell Road, London SW9 0XH',
    items: [{ name: 'Egusi Soup + Eba', quantity: 1, unit_price: 950, total: 950 }],
    subtotal: 950, delivery_fee: 199, total_amount: 1149,
    payment_status: 'paid', status: 'accepted',
    placed_at: minsAgo(12), accepted_at: minsAgo(10),
  },
  {
    id: 'a2', order_number: '#AC-00339', customer_name: 'Seun Falola',
    customer_address: '8 Acre Lane, London SW2 5SP',
    items: [
      { name: 'Grilled Chicken', quantity: 2, unit_price: 1100, total: 2200 },
      { name: 'Jollof Rice', quantity: 2, unit_price: 850, total: 1700 },
    ],
    subtotal: 3900, delivery_fee: 199, total_amount: 4099,
    payment_status: 'paid', status: 'preparing',
    placed_at: minsAgo(22), accepted_at: minsAgo(20), prep_time_minutes: 20,
  },
  {
    id: 'a3', order_number: '#AC-00340', customer_name: 'Tunde Bakare',
    customer_address: '31 Loughborough Road, London SW9 7TB',
    items: [{ name: 'Suya Skewers', quantity: 3, unit_price: 600, total: 1800 }],
    subtotal: 1800, delivery_fee: 199, total_amount: 1999,
    payment_status: 'paid', status: 'picked_up',
    placed_at: minsAgo(35), accepted_at: minsAgo(33), ready_at: minsAgo(10),
  },
]

export default function VendorDashboard() {
  const [incoming, setIncoming] = useState<VendorOrder[]>(MOCK_INCOMING)
  const [acceptTarget, setAcceptTarget] = useState<VendorOrder | null>(null)
  const [rejectTarget, setRejectTarget] = useState<VendorOrder | null>(null)

  async function handleAccept(order: VendorOrder, prepTime: number) {
    await new Promise((r) => setTimeout(r, 400))
    setIncoming((prev) => prev.filter((o) => o.id !== order.id))
    toast.success(`Order ${order.order_number} accepted — ${prepTime} min`)
  }

  async function handleReject(order: VendorOrder, reason: string) {
    await new Promise((r) => setTimeout(r, 400))
    setIncoming((prev) => prev.filter((o) => o.id !== order.id))
    toast.success(`Order ${order.order_number} rejected`)
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Orders Today"
          value={MOCK_STATS.orders_today}
          icon={<ShoppingBag size={20} />}
        />
        <KpiCard
          label="Revenue Today"
          value={`£${(MOCK_STATS.revenue_today / 100).toFixed(2)}`}
          icon={<TrendingUp size={20} />}
        />
        <KpiCard
          label="Avg Prep Time"
          value={`${MOCK_STATS.avg_prep_time}min`}
          icon={<Timer size={20} />}
        />
        <KpiCard
          label="Rating"
          value={`${MOCK_STATS.rating} ★`}
          icon={<Star size={20} />}
        />
      </div>

      {/* Main row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Incoming Orders — 60% */}
        <div className="xl:col-span-3 bg-[#EFECE5] rounded-xl border border-[#E4E0D5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E0D5] flex items-center justify-between">
            <h2 className="font-semibold text-[#1A1814] text-sm">Incoming Orders</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2E7D52] animate-pulse" />
                <span className="text-xs font-medium text-[#2E7D52]">Live</span>
              </div>
              <span className="text-xs text-[#9C968E]">Refreshes every 20s</span>
            </div>
          </div>

          <div className="p-5">
            {incoming.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={40} className="text-[#B8962E]/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-[#5C5750]">No new orders right now</p>
                <p className="text-xs text-[#9C968E] mt-1">New orders will appear here automatically</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incoming.map((order) => (
                  <IncomingOrderCard
                    key={order.id}
                    order={order}
                    onAccept={setAcceptTarget}
                    onReject={setRejectTarget}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Orders Kanban — 40% */}
        <div className="xl:col-span-2 bg-[#EFECE5] rounded-xl border border-[#E4E0D5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E0D5]">
            <h2 className="font-semibold text-[#1A1814] text-sm">Active Orders</h2>
          </div>
          <div className="p-4">
            <OrderKanban initialOrders={MOCK_ACTIVE} />
          </div>
        </div>
      </div>

      <AcceptOrderModal order={acceptTarget} onClose={() => setAcceptTarget(null)} onConfirm={handleAccept} />
      <RejectOrderModal order={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
    </div>
  )
}
