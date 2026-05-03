'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  DollarSign,
  Store,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { KpiCard } from '@/components/admin/KpiCard'
import { OrdersBarChart, RevenuePieChart } from '@/components/admin/RevenueChart'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { AdminStats, Order } from '@/types'

// ─── Mock data (replace with real API when backend is ready) ──────────────────

const MOCK_STATS: AdminStats = {
  total_users: 1_284,
  orders_today: 47,
  revenue_today: 389_500,
  active_vendors: 32,
  pending_vendors: 4,
  active_drivers: 18,
  pending_drivers: 3,
  daily_orders: [
    { date: 'Mon', count: 28 },
    { date: 'Tue', count: 35 },
    { date: 'Wed', count: 42 },
    { date: 'Thu', count: 31 },
    { date: 'Fri', count: 53 },
    { date: 'Sat', count: 61 },
    { date: 'Sun', count: 47 },
  ],
  revenue_split: { vendor: 72, platform: 28 },
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1', order_number: 'ORD-0041', user_id: 'u1',
    customer_name: 'Amara Okafor', vendor_id: 'v1', vendor_name: "Mama's Kitchen",
    items: [], total_amount: 4200, delivery_fee: 350, credits_used: 0,
    status: 'delivered', driver_name: 'Kofi Mensah', created_at: '2026-05-01T14:32:00Z',
  },
  {
    id: '2', order_number: 'ORD-0040', user_id: 'u2',
    customer_name: 'Fatima Diallo', vendor_id: 'v2', vendor_name: 'Jerk Stop',
    items: [], total_amount: 6800, delivery_fee: 350, credits_used: 0,
    status: 'preparing', driver_name: undefined, created_at: '2026-05-01T14:10:00Z',
  },
  {
    id: '3', order_number: 'ORD-0039', user_id: 'u3',
    customer_name: 'Chidi Eze', vendor_id: 'v3', vendor_name: 'Lagos Buka',
    items: [], total_amount: 3150, delivery_fee: 350, credits_used: 200,
    status: 'picked_up', driver_name: 'Ade Bello', created_at: '2026-05-01T13:55:00Z',
  },
  {
    id: '4', order_number: 'ORD-0038', user_id: 'u4',
    customer_name: 'Yemi Adeyemi', vendor_id: 'v1', vendor_name: "Mama's Kitchen",
    items: [], total_amount: 5200, delivery_fee: 350, credits_used: 0,
    status: 'completed', driver_name: 'Kofi Mensah', created_at: '2026-05-01T12:40:00Z',
  },
  {
    id: '5', order_number: 'ORD-0037', user_id: 'u5',
    customer_name: 'Ngozi Iwu', vendor_id: 'v4', vendor_name: 'Suya Spot',
    items: [], total_amount: 2800, delivery_fee: 350, credits_used: 0,
    status: 'pending', driver_name: undefined, created_at: '2026-05-01T12:20:00Z',
  },
  {
    id: '6', order_number: 'ORD-0036', user_id: 'u6',
    customer_name: 'Kwame Asante', vendor_id: 'v2', vendor_name: 'Jerk Stop',
    items: [], total_amount: 7400, delivery_fee: 350, credits_used: 500,
    status: 'accepted', driver_name: 'Ade Bello', created_at: '2026-05-01T11:58:00Z',
  },
  {
    id: '7', order_number: 'ORD-0035', user_id: 'u7',
    customer_name: 'Abena Mensah', vendor_id: 'v5', vendor_name: 'Egusi Palace',
    items: [], total_amount: 4600, delivery_fee: 350, credits_used: 0,
    status: 'cancelled', driver_name: undefined, created_at: '2026-05-01T11:30:00Z',
  },
]

// ─── Row component ────────────────────────────────────────────────────────────

function RecentOrdersRow({ order }: { order: Order }) {
  return (
    <tr className="border-b border-surface-dark last:border-0 hover:bg-background transition-colors">
      <td className="py-3 px-4 font-mono text-xs font-medium text-text-primary">
        {order.order_number}
      </td>
      <td className="py-3 px-4 text-sm">{order.customer_name}</td>
      <td className="py-3 px-4 text-sm text-text-secondary">{order.vendor_name}</td>
      <td className="py-3 px-4 text-sm font-medium">{formatCurrency(order.total_amount)}</td>
      <td className="py-3 px-4 text-xs text-text-secondary">{formatCurrency(order.delivery_fee)}</td>
      <td className="py-3 px-4 text-sm">
        {order.driver_name ?? (
          <span className="text-text-muted italic text-xs">Unassigned</span>
        )}
      </td>
      <td className="py-3 px-4">
        <Badge status={order.status} />
      </td>
      <td className="py-3 px-4 text-xs text-text-muted">{formatDateTime(order.created_at)}</td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const stats = MOCK_STATS
  const recentOrders = MOCK_ORDERS

  const pendingTotal = stats.pending_vendors + stats.pending_drivers
  const pendingTooltip = `Vendors pending: ${stats.pending_vendors} | Drivers pending: ${stats.pending_drivers}`

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Total Users"
          value={stats.total_users.toLocaleString()}
          change={12}
          changeType="up"
          icon={<TrendingUp size={20} />}
        />
        <KpiCard
          label="Orders Today"
          value={stats.orders_today}
          change={8}
          changeType="up"
          icon={<ShoppingBag size={20} />}
        />
        <KpiCard
          label="Revenue Today"
          value={formatCurrency(stats.revenue_today)}
          change={5}
          changeType="up"
          icon={<DollarSign size={20} />}
        />
        <KpiCard
          label="Active Vendors"
          value={stats.active_vendors}
          subLabel={`${stats.pending_vendors} pending`}
          icon={<Store size={20} />}
        />
        <div
          className="bg-surface rounded-xl border border-surface-dark p-6"
          title={pendingTooltip}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-text-muted font-medium">
              Pending Reviews
            </p>
            <div className="text-gold opacity-70">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-3xl font-semibold text-text-primary tracking-tight">
            {pendingTotal}
          </p>
          <p className="text-xs text-text-muted mt-2">
            {stats.pending_vendors} vendors · {stats.pending_drivers} drivers
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[60fr_40fr] gap-4">
        <OrdersBarChart data={stats.daily_orders} />
        <RevenuePieChart data={stats.revenue_split} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-surface-dark overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-dark">
          <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
            <LayoutDashboard size={16} className="text-gold" />
            Recent Orders
          </h3>
          <Link href="/afrocart/admin/orders" className="text-xs text-gold hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-dark bg-background">
                {['Order #', 'Customer', 'Vendor', 'Amount', 'Fee', 'Driver', 'Status', 'Time'].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left text-xs uppercase tracking-wider text-text-secondary font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <RecentOrdersRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
