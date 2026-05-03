'use client'

import { useState, useMemo } from 'react'
import { Search, Printer, CheckCircle2, Eye, X as XIcon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { OrderDetailPanel } from '@/components/vendor/OrderDetailPanel'
import { AcceptOrderModal } from '@/components/vendor/AcceptOrderModal'
import { RejectOrderModal } from '@/components/vendor/RejectOrderModal'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { VendorOrder, OrderStatus } from '@/types'

type TabKey = 'incoming' | 'active' | 'ready' | 'completed' | 'cancelled'

const TABS: { key: TabKey; label: string; statuses: OrderStatus[] }[] = [
  { key: 'incoming',  label: 'Incoming',  statuses: ['pending'] },
  { key: 'active',    label: 'Active',    statuses: ['accepted', 'preparing'] },
  { key: 'ready',     label: 'Ready',     statuses: ['picked_up'] },
  { key: 'completed', label: 'Completed', statuses: ['delivered', 'completed'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
]

const now = new Date()
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString()

const INITIAL_ORDERS: VendorOrder[] = [
  { id: 'o1', order_number: '#AC-00342', customer_name: 'Adaeze Obi', customer_address: '14 Coldharbour Lane, London SE5 9NR', items: [{ name: 'Jollof Rice', quantity: 2, unit_price: 850, total: 1700 }, { name: 'Fried Plantain', quantity: 1, unit_price: 350, total: 350 }], subtotal: 2050, delivery_fee: 199, total_amount: 2249, payment_status: 'paid', status: 'pending', placed_at: minsAgo(2) },
  { id: 'o2', order_number: '#AC-00343', customer_name: 'Kwame Asante', customer_address: '7 Electric Avenue, London SW9 8LA', customer_note: 'Extra spicy please', items: [{ name: 'Pepper Soup', quantity: 1, unit_price: 750, total: 750 }, { name: 'Puff Puff', quantity: 2, unit_price: 300, total: 600 }], subtotal: 1350, delivery_fee: 199, total_amount: 1549, payment_status: 'paid', status: 'pending', placed_at: minsAgo(5) },
  { id: 'o3', order_number: '#AC-00338', customer_name: 'Ngozi Iwu', customer_address: '22 Stockwell Road, London SW9 0XH', items: [{ name: 'Egusi Soup + Eba', quantity: 1, unit_price: 950, total: 950 }], subtotal: 950, delivery_fee: 199, total_amount: 1149, payment_status: 'paid', status: 'accepted', placed_at: minsAgo(12), accepted_at: minsAgo(10) },
  { id: 'o4', order_number: '#AC-00339', customer_name: 'Seun Falola', customer_address: '8 Acre Lane, London SW2 5SP', items: [{ name: 'Grilled Chicken', quantity: 2, unit_price: 1100, total: 2200 }, { name: 'Jollof Rice', quantity: 2, unit_price: 850, total: 1700 }], subtotal: 3900, delivery_fee: 199, total_amount: 4099, payment_status: 'paid', status: 'preparing', placed_at: minsAgo(22), accepted_at: minsAgo(20), prep_time_minutes: 20 },
  { id: 'o5', order_number: '#AC-00340', customer_name: 'Tunde Bakare', customer_address: '31 Loughborough Road, London SW9 7TB', items: [{ name: 'Suya Skewers', quantity: 3, unit_price: 600, total: 1800 }], subtotal: 1800, delivery_fee: 199, total_amount: 1999, payment_status: 'paid', status: 'picked_up', placed_at: minsAgo(35), driver_name: 'Kofi Mensah' },
  { id: 'o6', order_number: '#AC-00335', customer_name: 'Fatima Diallo', customer_address: '5 Railton Road, London SE24 0LT', items: [{ name: 'Ofada Rice', quantity: 1, unit_price: 900, total: 900 }, { name: 'Ayamase Stew', quantity: 1, unit_price: 600, total: 600 }], subtotal: 1500, delivery_fee: 199, total_amount: 1699, payment_status: 'paid', status: 'completed', placed_at: minsAgo(120), driver_name: 'Ade Bello' },
  { id: 'o7', order_number: '#AC-00334', customer_name: 'Chidi Eze', customer_address: '18 Brixton Hill, London SW2 1RS', items: [{ name: 'Moi Moi', quantity: 2, unit_price: 450, total: 900 }], subtotal: 900, delivery_fee: 199, total_amount: 1099, payment_status: 'refunded', status: 'cancelled', placed_at: minsAgo(180) },
]

export default function VendorOrdersPage() {
  const [orders, setOrders]           = useState<VendorOrder[]>(INITIAL_ORDERS)
  const [activeTab, setActiveTab]     = useState<TabKey>('incoming')
  const [search, setSearch]           = useState('')
  const [from, setFrom]               = useState('')
  const [to, setTo]                   = useState('')
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null)
  const [acceptTarget, setAcceptTarget]   = useState<VendorOrder | null>(null)
  const [rejectTarget, setRejectTarget]   = useState<VendorOrder | null>(null)

  const tabStatuses = TABS.find((t) => t.key === activeTab)?.statuses ?? []

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (!tabStatuses.includes(o.status)) return false
      if (search && !o.order_number.toLowerCase().includes(search.toLowerCase()) &&
          !o.customer_name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [orders, activeTab, search])

  function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    setSelectedOrder(null)
  }

  async function handleAccept(order: VendorOrder, prepTime: number) {
    await new Promise((r) => setTimeout(r, 400))
    handleStatusChange(order.id, 'accepted')
    toast.success(`${order.order_number} accepted — ${prepTime} min prep`)
  }

  async function handleReject(order: VendorOrder, reason: string) {
    await new Promise((r) => setTimeout(r, 400))
    handleStatusChange(order.id, 'cancelled')
    toast.success(`${order.order_number} rejected`)
  }

  async function handleMarkReady(order: VendorOrder) {
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'picked_up' } : o))
    toast.success(`${order.order_number} marked ready`)
  }

  return (
    <div className="space-y-5">
      {/* Tabs + Search */}
      <div className="bg-white rounded-xl border border-[#E4E0D5] overflow-hidden">
        {/* Tab row */}
        <div className="flex border-b border-[#E4E0D5]">
          {TABS.map((tab) => {
            const count = orders.filter((o) => tab.statuses.includes(o.status)).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-[#B8962E] text-[#B8962E]'
                    : 'border-transparent text-[#9C968E] hover:text-[#1A1814]'
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    'text-xs rounded-full px-1.5 py-0.5 font-semibold',
                    activeTab === tab.key
                      ? 'bg-[#B8962E]/10 text-[#B8962E]'
                      : 'bg-[#F7F5F0] text-[#9C968E]'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Filter row */}
        <div className="px-5 py-3 flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C968E]" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-[#F7F5F0] border border-[#E4E0D5] rounded-lg w-full focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary placeholder:text-text-muted"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#9C968E] whitespace-nowrap">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="py-2 px-3 text-sm bg-[#F7F5F0] border border-[#E4E0D5] rounded-lg focus:outline-none focus:border-gold text-text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#9C968E] whitespace-nowrap">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="py-2 px-3 text-sm bg-[#F7F5F0] border border-[#E4E0D5] rounded-lg focus:outline-none focus:border-gold text-text-primary" />
          </div>
          <Button variant="primary" size="sm">Search</Button>
        </div>
      </div>

      {/* Table */}
      <div className={cn('bg-white rounded-xl border border-[#E4E0D5] overflow-hidden', selectedOrder && 'mr-[396px]')}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E0D5] bg-[#F7F5F0]">
              {['Order #', 'Customer', 'Items', 'Total', 'Placed', 'Status', 'Prep', 'Actions'].map((h) => (
                <th key={h} className="py-3 px-4 text-left text-xs uppercase tracking-wider text-[#9C968E] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-[#9C968E] text-sm">
                  No orders in this category
                </td>
              </tr>
            ) : filtered.map((order) => {
              const itemsSummary = order.items.slice(0, 2).map((i) => `${i.quantity}× ${i.name}`).join(', ')
                + (order.items.length > 2 ? ` +${order.items.length - 2} more` : '')
              return (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="border-b border-[#E4E0D5] last:border-0 hover:bg-[#F7F5F0] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs text-[#B8962E] font-medium">{order.order_number}</td>
                  <td className="py-3 px-4 text-[#1A1814]">{order.customer_name}</td>
                  <td className="py-3 px-4 text-[#5C5750] text-xs max-w-[180px] truncate">{itemsSummary}</td>
                  <td className="py-3 px-4 font-medium text-[#1A1814]">£{(order.total_amount / 100).toFixed(2)}</td>
                  <td className="py-3 px-4 text-xs text-[#9C968E]" title={order.placed_at}>
                    {formatDistanceToNow(new Date(order.placed_at), { addSuffix: false })} ago
                  </td>
                  <td className="py-3 px-4"><Badge status={order.status} /></td>
                  <td className="py-3 px-4 text-xs text-[#9C968E]">
                    {order.prep_time_minutes ? `${order.prep_time_minutes}m` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="View details"
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#9C968E] hover:text-[#B8962E]"
                      >
                        <Eye size={14} />
                      </button>
                      {(order.status === 'accepted' || order.status === 'preparing') && (
                        <button
                          title="Mark ready"
                          onClick={() => handleMarkReady(order)}
                          className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#9C968E] hover:text-[#2E7D52]"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      {order.status === 'completed' && (
                        <button
                          title="Print receipt"
                          onClick={() => window.print()}
                          className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#9C968E] hover:text-[#B8962E]"
                        >
                          <Printer size={14} />
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button
                          title="Reject order"
                          onClick={() => setRejectTarget(order)}
                          className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#9C968E] hover:text-danger"
                        >
                          <XIcon size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <OrderDetailPanel
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />

      <AcceptOrderModal order={acceptTarget} onClose={() => setAcceptTarget(null)} onConfirm={handleAccept} />
      <RejectOrderModal order={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
    </div>
  )
}
