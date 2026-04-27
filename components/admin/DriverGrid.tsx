'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Star, Truck, Hourglass } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { useAssignDriverMutation, useGetOrdersQuery } from '@/store/api/adminApi'
import type { Driver } from '@/types'

interface DriverGridProps {
  drivers: Driver[]
  onDriverClick?: (driver: Driver) => void
}

export function DriverGrid({ drivers, onDriverClick }: DriverGridProps) {
  const [assignDriver, { isLoading }] = useAssignDriverMutation()
  const { data: pendingOrders } = useGetOrdersQuery({ status: 'pending' })
  const [assignments, setAssignments] = useState<Record<string, string>>({})

  const approvedOnlineDrivers = drivers.filter(
    (d) => d.approval_status === 'approved' && d.status === 'online'
  )

  return (
    <div className="space-y-6">
      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {drivers.map((driver) => (
          <DriverCard
            key={driver.id}
            driver={driver}
            onClick={() => onDriverClick?.(driver)}
          />
        ))}
      </div>

      {/* Unassigned Orders — only show when there are approved drivers */}
      {pendingOrders && pendingOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-surface-dark overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-dark">
            <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <Truck size={16} className="text-gold" />
              Unassigned Orders
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-dark bg-background">
                {['Order #', 'Customer', 'Vendor', 'Total', 'Time', 'Assign Driver', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="py-2.5 px-4 text-left text-xs uppercase tracking-wider text-text-secondary font-medium"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-surface-dark last:border-0 hover:bg-background transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-xs">{order.order_number}</td>
                  <td className="py-3 px-4">{order.customer_name}</td>
                  <td className="py-3 px-4 text-text-secondary">{order.vendor_name}</td>
                  <td className="py-3 px-4">{formatCurrency(order.total_amount)}</td>
                  <td className="py-3 px-4 text-xs text-text-muted">
                    {new Date(order.created_at).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      className="text-xs border border-surface-dark rounded px-2 py-1.5 bg-white text-text-primary focus:outline-none focus:border-gold w-40"
                      value={assignments[order.id] ?? ''}
                      onChange={(e) =>
                        setAssignments((prev) => ({ ...prev, [order.id]: e.target.value }))
                      }
                    >
                      <option value="">Select driver…</option>
                      {approvedOnlineDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.active_deliveries})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs h-8"
                      loading={isLoading}
                      disabled={!assignments[order.id]}
                      onClick={async () => {
                        await assignDriver({
                          orderId: order.id,
                          driver_id: assignments[order.id],
                        }).unwrap()
                        toast.success('Driver assigned')
                      }}
                    >
                      Confirm
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DriverCard({ driver, onClick }: { driver: Driver; onClick: () => void }) {
  const approvalStatus = driver.approval_status

  const bannerConfig = {
    pending: { label: 'PENDING REVIEW', className: 'bg-amber-500 text-white' },
    rejected: { label: 'REJECTED', className: 'bg-red-600 text-white' },
    suspended: { label: 'SUSPENDED', className: 'bg-gray-800 text-white' },
  } as const

  const banner = approvalStatus !== 'approved' ? bannerConfig[approvalStatus] : null

  return (
    <div className="bg-surface rounded-xl border border-surface-dark overflow-hidden relative">
      {/* Approval status banner */}
      {banner && (
        <div
          className={`${banner.className} text-[10px] font-bold tracking-widest text-center py-1`}
        >
          {banner.label}
        </div>
      )}

      <div className="p-5">
        {/* Status indicator (approved only) or hourglass (pending) */}
        <div className="absolute top-4 right-4">
          {approvalStatus === 'approved' ? (
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                driver.status === 'online' ? 'bg-success' : 'bg-text-muted'
              }`}
            />
          ) : approvalStatus === 'pending' ? (
            <Hourglass size={14} className="text-amber-500" />
          ) : null}
        </div>

        <div className="flex items-start gap-3 mb-4">
          <Avatar name={driver.name} size="md" />
          <div>
            <p className="font-semibold text-text-primary text-sm">{driver.name}</p>
            <Badge
              status={approvalStatus === 'approved' ? driver.status : approvalStatus}
              className="mt-0.5 text-[10px] px-1.5 py-px"
            />
          </div>
        </div>

        {approvalStatus === 'approved' && (
          <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
            <div>
              <p className="text-text-muted">Today</p>
              <p className="font-semibold text-text-primary">{driver.active_deliveries} active</p>
            </div>
            <div>
              <p className="text-text-muted">Total</p>
              <p className="font-semibold text-text-primary">{driver.total_completed}</p>
            </div>
            <div>
              <p className="text-text-muted">Earnings</p>
              <p className="font-semibold text-text-primary">
                {formatCurrency(driver.earnings_today)}
              </p>
            </div>
            <div>
              <p className="text-text-muted">Rating</p>
              <p className="font-semibold text-text-primary flex items-center gap-0.5">
                <Star size={10} className="text-gold fill-gold" />
                {driver.rating.toFixed(1)}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {approvalStatus === 'approved' && driver.status === 'online' && (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={onClick}>
            Assign Job
          </Button>
        )}

        {approvalStatus === 'pending' && (
          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs bg-amber-500 hover:bg-amber-600 border-0"
            onClick={onClick}
          >
            Review Application
          </Button>
        )}

        {approvalStatus === 'rejected' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onClick}>
              View
            </Button>
            <Button variant="primary" size="sm" className="flex-1 text-xs" onClick={onClick}>
              Re-approve
            </Button>
          </div>
        )}

        {approvalStatus === 'suspended' && (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={onClick}>
            Reinstate
          </Button>
        )}
      </div>
    </div>
  )
}
