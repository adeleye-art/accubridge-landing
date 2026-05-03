'use client'

import { useState } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { OrdersTable } from '@/components/admin/OrdersTable'
import type { Order, OrderStatus } from '@/types'

const ORDER_STATUSES: { label: string; value: OrderStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending',      value: 'pending' },
  { label: 'Accepted',     value: 'accepted' },
  { label: 'Preparing',    value: 'preparing' },
  { label: 'Picked Up',    value: 'picked_up' },
  { label: 'Delivered',    value: 'delivered' },
  { label: 'Completed',    value: 'completed' },
  { label: 'Cancelled',    value: 'cancelled' },
]

const MOCK_VENDORS = [
  { id: 'v1', business_name: "Mama's Kitchen" },
  { id: 'v2', business_name: 'Jerk Stop' },
  { id: 'v3', business_name: 'Lagos Buka' },
  { id: 'v4', business_name: 'Suya Spot' },
  { id: 'v5', business_name: 'Egusi Palace' },
]

const MOCK_ORDERS: Order[] = [
  { id: '1',  order_number: 'ORD-0041', user_id: 'u1', customer_name: 'Amara Okafor',  vendor_id: 'v1', vendor_name: "Mama's Kitchen", items: [], total_amount: 4200,  delivery_fee: 350, credits_used: 0,   status: 'delivered',  driver_name: 'Kofi Mensah',  created_at: '2026-05-01T14:32:00Z' },
  { id: '2',  order_number: 'ORD-0040', user_id: 'u2', customer_name: 'Fatima Diallo', vendor_id: 'v2', vendor_name: 'Jerk Stop',       items: [], total_amount: 6800,  delivery_fee: 350, credits_used: 0,   status: 'preparing',  driver_name: undefined,      created_at: '2026-05-01T14:10:00Z' },
  { id: '3',  order_number: 'ORD-0039', user_id: 'u3', customer_name: 'Chidi Eze',     vendor_id: 'v3', vendor_name: 'Lagos Buka',      items: [], total_amount: 3150,  delivery_fee: 350, credits_used: 200, status: 'picked_up',  driver_name: 'Ade Bello',    created_at: '2026-05-01T13:55:00Z' },
  { id: '4',  order_number: 'ORD-0038', user_id: 'u4', customer_name: 'Yemi Adeyemi',  vendor_id: 'v1', vendor_name: "Mama's Kitchen", items: [], total_amount: 5200,  delivery_fee: 350, credits_used: 0,   status: 'completed',  driver_name: 'Kofi Mensah',  created_at: '2026-05-01T12:40:00Z' },
  { id: '5',  order_number: 'ORD-0037', user_id: 'u5', customer_name: 'Ngozi Iwu',     vendor_id: 'v4', vendor_name: 'Suya Spot',       items: [], total_amount: 2800,  delivery_fee: 350, credits_used: 0,   status: 'pending',    driver_name: undefined,      created_at: '2026-05-01T12:20:00Z' },
  { id: '6',  order_number: 'ORD-0036', user_id: 'u6', customer_name: 'Kwame Asante',  vendor_id: 'v2', vendor_name: 'Jerk Stop',       items: [], total_amount: 7400,  delivery_fee: 350, credits_used: 500, status: 'accepted',   driver_name: 'Ade Bello',    created_at: '2026-05-01T11:58:00Z' },
  { id: '7',  order_number: 'ORD-0035', user_id: 'u7', customer_name: 'Abena Mensah',  vendor_id: 'v5', vendor_name: 'Egusi Palace',    items: [], total_amount: 4600,  delivery_fee: 350, credits_used: 0,   status: 'cancelled',  driver_name: undefined,      created_at: '2026-05-01T11:30:00Z' },
  { id: '8',  order_number: 'ORD-0034', user_id: 'u8', customer_name: 'Olu Babalola',  vendor_id: 'v3', vendor_name: 'Lagos Buka',      items: [], total_amount: 3800,  delivery_fee: 350, credits_used: 100, status: 'completed',  driver_name: 'Kofi Mensah',  created_at: '2026-05-01T10:55:00Z' },
  { id: '9',  order_number: 'ORD-0033', user_id: 'u9', customer_name: 'Seun Falola',   vendor_id: 'v1', vendor_name: "Mama's Kitchen", items: [], total_amount: 5600,  delivery_fee: 350, credits_used: 0,   status: 'delivered',  driver_name: 'Ade Bello',    created_at: '2026-05-01T10:20:00Z' },
  { id: '10', order_number: 'ORD-0032', user_id: 'u10',customer_name: 'Tunde Bakare',  vendor_id: 'v4', vendor_name: 'Suya Spot',       items: [], total_amount: 2200,  delivery_fee: 350, credits_used: 0,   status: 'completed',  driver_name: 'Kofi Mensah',  created_at: '2026-05-01T09:45:00Z' },
]

export default function OrdersPage() {
  const [filters, setFilters] = useState({ status: '', vendor_id: '', from: '', to: '', search: '' })
  const [applied, setApplied] = useState({ status: '', vendor_id: '', from: '', to: '', search: '' })

  const filtered = MOCK_ORDERS.filter((o) => {
    if (applied.status && o.status !== applied.status) return false
    if (applied.vendor_id && o.vendor_id !== applied.vendor_id) return false
    if (applied.search && !o.order_number.toLowerCase().includes(applied.search.toLowerCase()) &&
        !o.customer_name.toLowerCase().includes(applied.search.toLowerCase())) return false
    return true
  })

  function applyFilters() { setApplied({ ...filters }) }
  function resetFilters() {
    const empty = { status: '', vendor_id: '', from: '', to: '', search: '' }
    setFilters(empty); setApplied(empty)
  }

  const selectClass = 'px-3 py-2 text-sm bg-white border border-surface-dark rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary'
  const inputClass  = 'px-3 py-2 text-sm bg-white border border-surface-dark rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary placeholder:text-text-muted'

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-surface-dark p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted uppercase tracking-wider">From</label>
            <input type="date" className={inputClass} value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted uppercase tracking-wider">To</label>
            <input type="date" className={inputClass} value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted uppercase tracking-wider">Status</label>
            <select className={selectClass} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted uppercase tracking-wider">Vendor</label>
            <select className={selectClass} value={filters.vendor_id} onChange={(e) => setFilters((f) => ({ ...f, vendor_id: e.target.value }))}>
              <option value="">All Vendors</option>
              {MOCK_VENDORS.map((v) => <option key={v.id} value={v.id}>{v.business_name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs text-text-muted uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Order ID or customer..." className={`${inputClass} pl-8 w-full`}
                value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="md" onClick={applyFilters}>Apply Filters</Button>
            <Button variant="ghost" size="md" onClick={resetFilters} icon={<RotateCcw size={14} />}>Reset</Button>
          </div>
        </div>
      </div>

      <OrdersTable orders={filtered} loading={false} />
    </div>
  )
}
