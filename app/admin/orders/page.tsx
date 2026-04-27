'use client'

import { useState } from 'react'
import { Search, RotateCcw, AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { OrdersTable } from '@/components/admin/OrdersTable'
import { useGetOrdersQuery, useGetVendorsQuery } from '@/store/api/adminApi'
import type { OrderStatus } from '@/types'

const ORDER_STATUSES: { label: string; value: OrderStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Picked Up', value: 'picked_up' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function OrdersPage() {
  const [filters, setFilters] = useState({ status: '', vendor_id: '', from: '', to: '', search: '' })
  const [applied, setApplied] = useState({ status: '', vendor_id: '', from: '', to: '', search: '' })

  const { data: orders, isLoading, isError, refetch } = useGetOrdersQuery({
    status: applied.status || undefined,
    vendor_id: applied.vendor_id || undefined,
    from: applied.from || undefined,
    to: applied.to || undefined,
  })

  const { data: vendors } = useGetVendorsQuery({})

  const filtered = orders?.filter((o) =>
    !applied.search ||
    o.order_number.toLowerCase().includes(applied.search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(applied.search.toLowerCase())
  ) ?? []

  function applyFilters() {
    setApplied({ ...filters })
  }

  function resetFilters() {
    const empty = { status: '', vendor_id: '', from: '', to: '', search: '' }
    setFilters(empty)
    setApplied(empty)
  }

  const selectClass = 'px-3 py-2 text-sm bg-white border border-surface-dark rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary'
  const inputClass = 'px-3 py-2 text-sm bg-white border border-surface-dark rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary placeholder:text-text-muted'

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={40} className="text-danger" />
        <p className="text-text-secondary">Failed to load orders</p>
        <Button variant="outline" onClick={() => refetch()} icon={<RefreshCcw size={14} />}>Retry</Button>
      </div>
    )
  }

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
              {vendors?.map((v) => <option key={v.id} value={v.id}>{v.business_name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs text-text-muted uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Order ID or customer..."
                className={`${inputClass} pl-8 w-full`}
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="md" onClick={applyFilters}>Apply Filters</Button>
            <Button variant="ghost" size="md" onClick={resetFilters} icon={<RotateCcw size={14} />}>Reset</Button>
          </div>
        </div>
      </div>

      <OrdersTable orders={filtered} loading={isLoading} />
    </div>
  )
}
