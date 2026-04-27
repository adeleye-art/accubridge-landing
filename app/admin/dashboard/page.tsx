'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  ShoppingBag,
  DollarSign,
  Store,
  TrendingUp,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react'
import { KpiCard } from '@/components/admin/KpiCard'
import { OrdersBarChart, RevenuePieChart } from '@/components/admin/RevenueChart'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useGetAdminStatsQuery, useGetOrdersQuery } from '@/store/api/adminApi'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Order } from '@/types'

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

export default function DashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetAdminStatsQuery()
  const { data: orders, isLoading: ordersLoading } = useGetOrdersQuery({})

  const recentOrders = orders?.slice(0, 10) ?? []

  const pendingTotal = (stats?.pending_vendors ?? 0) + (stats?.pending_drivers ?? 0)
  const pendingTooltip = `Vendors pending: ${stats?.pending_vendors ?? 0} | Drivers pending: ${stats?.pending_drivers ?? 0}`

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={40} className="text-danger" />
        <p className="text-text-secondary">Failed to load dashboard data</p>
        <Button variant="outline" onClick={() => refetchStats()} icon={<RefreshCcw size={14} />}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-surface-dark p-6 h-36 animate-pulse"
            />
          ))
        ) : (
          <>
            <KpiCard
              label="Total Users"
              value={stats?.total_users.toLocaleString() ?? '—'}
              change={12}
              changeType="up"
              icon={<TrendingUp size={20} />}
            />
            <KpiCard
              label="Orders Today"
              value={stats?.orders_today ?? '—'}
              change={8}
              changeType="up"
              icon={<ShoppingBag size={20} />}
            />
            <KpiCard
              label="Revenue Today"
              value={stats ? formatCurrency(stats.revenue_today) : '—'}
              change={5}
              changeType="up"
              icon={<DollarSign size={20} />}
            />
            <KpiCard
              label="Active Vendors"
              value={stats?.active_vendors ?? '—'}
              subLabel={stats?.pending_vendors ? `${stats.pending_vendors} pending` : undefined}
              icon={<Store size={20} />}
            />
            {/* Pending Reviews — combined vendors + drivers */}
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
                {stats?.pending_vendors ?? 0} vendors · {stats?.pending_drivers ?? 0} drivers
              </p>
            </div>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[60fr_40fr] gap-4">
        {statsLoading ? (
          <>
            <div className="bg-surface rounded-xl border border-surface-dark p-6 h-64 animate-pulse" />
            <div className="bg-surface rounded-xl border border-surface-dark p-6 h-64 animate-pulse" />
          </>
        ) : stats ? (
          <>
            <OrdersBarChart data={stats.daily_orders} />
            <RevenuePieChart data={stats.revenue_split} />
          </>
        ) : null}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-surface-dark overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-dark">
          <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
            <LayoutDashboard size={16} className="text-gold" />
            Recent Orders
          </h3>
          <Link href="/admin/orders" className="text-xs text-gold hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-dark bg-background">
                {['Order #', 'Customer', 'Vendor', 'Amount', 'Fee', 'Driver', 'Status', 'Time'].map(
                  (h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-left text-xs uppercase tracking-wider text-text-secondary font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {ordersLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-surface-dark">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="py-3 px-4">
                          <div className="h-4 bg-surface-dark rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : recentOrders.map((order) => (
                    <RecentOrdersRow key={order.id} order={order} />
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
