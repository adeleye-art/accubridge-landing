'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { OrderCard } from '@/components/customer/OrderCard'
import { setVendor, clearCart, addItem } from '@/store/cartSlice'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { CustomerOrder } from '@/types'
import type { AppDispatch } from '@/store'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ORDERS: CustomerOrder[] = [
  {
    id: 'o1', order_number: '#AC-00401', vendor_id: 'r1', vendor_name: "Mama's Kitchen",
    items: [
      { name: 'Jollof Rice with Chicken', quantity: 2, unit_price: 1150, total: 2300 },
      { name: 'Fried Plantain',           quantity: 1, unit_price: 350,  total: 350  },
    ],
    subtotal: 2650, delivery_fee: 199, credits_used: 0, discount: 0, total_amount: 2849,
    delivery_address: '42 Peckham High Street, London SE15 5EB',
    status: 'preparing', placed_at: new Date(Date.now() - 12 * 60000).toISOString(),
    timeline: [
      { status: 'pending',   timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
      { status: 'accepted',  timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 8  * 60000).toISOString() },
    ],
  },
  {
    id: 'o2', order_number: '#AC-00398', vendor_id: 'r2', vendor_name: 'Jerk Palace',
    items: [
      { name: 'Jerk Chicken & Rice',  quantity: 1, unit_price: 1350, total: 1350 },
      { name: 'Festival Dumplings',   quantity: 2, unit_price: 300,  total: 600  },
      { name: 'Ginger Beer',          quantity: 1, unit_price: 200,  total: 200  },
    ],
    subtotal: 2150, delivery_fee: 149, credits_used: 200, discount: 0, total_amount: 2099,
    delivery_address: '42 Peckham High Street, London SE15 5EB',
    status: 'delivered', placed_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    delivered_at: new Date(Date.now() - 2 * 24 * 3600000 + 40 * 60000).toISOString(),
    timeline: [
      { status: 'pending',   timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
      { status: 'accepted',  timestamp: new Date(Date.now() - 2 * 24 * 3600000 + 5  * 60000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 2 * 24 * 3600000 + 10 * 60000).toISOString() },
      { status: 'picked_up', timestamp: new Date(Date.now() - 2 * 24 * 3600000 + 30 * 60000).toISOString() },
      { status: 'delivered', timestamp: new Date(Date.now() - 2 * 24 * 3600000 + 40 * 60000).toISOString() },
    ],
  },
  {
    id: 'o3', order_number: '#AC-00390', vendor_id: 's1', vendor_name: 'Abuja Spice Store',
    items: [
      { name: 'Palm Oil 1L',     quantity: 2, unit_price: 399, total: 798 },
      { name: 'Crayfish Powder', quantity: 1, unit_price: 249, total: 249 },
    ],
    subtotal: 1047, delivery_fee: 249, credits_used: 0, discount: 200, total_amount: 1096,
    delivery_address: '42 Peckham High Street, London SE15 5EB',
    status: 'cancelled', placed_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    timeline: [
      { status: 'pending',   timestamp: new Date(Date.now() - 5 * 24 * 3600000).toISOString() },
      { status: 'cancelled', timestamp: new Date(Date.now() - 5 * 24 * 3600000 + 5 * 60000).toISOString() },
    ],
  },
]

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled'

const ACTIVE_STATUSES   = ['pending', 'accepted', 'preparing', 'picked_up']
const COMPLETE_STATUSES = ['delivered', 'completed']

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const [tab, setTab] = useState<FilterTab>('all')

  const filtered = MOCK_ORDERS.filter((o) => {
    if (tab === 'active')    return ACTIVE_STATUSES.includes(o.status)
    if (tab === 'completed') return COMPLETE_STATUSES.includes(o.status)
    if (tab === 'cancelled') return o.status === 'cancelled'
    return true
  })

  function handleReorder(order: CustomerOrder) {
    dispatch(clearCart())
    dispatch(setVendor({ vendor_id: order.vendor_id, vendor_name: order.vendor_name }))
    order.items.forEach((item, idx) => {
      const slugId = `${order.vendor_id}_${item.name.replace(/\s+/g, '_').toLowerCase()}_${idx}`
      dispatch(addItem({
        id:           `ci_${slugId}`,
        menu_item_id: slugId,
        vendor_id:    order.vendor_id,
        vendor_name:  order.vendor_name,
        name:         item.name,
        description:  '',
        price:        item.unit_price,
        quantity:     item.quantity,
        category:     '',
      }))
    })
    toast.success('Items added to cart')
  }

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',       label: 'All',       count: MOCK_ORDERS.length },
    { key: 'active',    label: 'Active',    count: MOCK_ORDERS.filter((o) => ACTIVE_STATUSES.includes(o.status)).length },
    { key: 'completed', label: 'Completed', count: MOCK_ORDERS.filter((o) => COMPLETE_STATUSES.includes(o.status)).length },
    { key: 'cancelled', label: 'Cancelled', count: MOCK_ORDERS.filter((o) => o.status === 'cancelled').length },
  ]

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-[#1A1814] mb-6">My Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white border border-[#E4E0D5] rounded-xl p-1 mb-6 w-fit">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
              tab === key ? 'bg-[#B8962E] text-white' : 'text-[#5C5750] hover:text-[#1A1814] hover:bg-[#F7F5F0]'
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full', tab === key ? 'bg-white/20' : 'bg-[#EFECE5]')}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={56} className="text-[#B8962E]/20 mx-auto mb-4" />
          <p className="font-semibold text-[#5C5750] mb-1">No orders yet</p>
          <p className="text-sm text-[#9C968E] mb-6">Your orders will appear here</p>
          <Link href="/afrocart/customer/eats" className="px-6 py-2.5 bg-[#B8962E] text-white rounded-xl font-semibold text-sm hover:bg-[#A07828] transition-colors">
            Start ordering
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onReorder={handleReorder} />
          ))}
        </div>
      )}
    </div>
  )
}
