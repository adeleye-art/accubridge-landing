'use client'

import { useState } from 'react'
import { Eye, Truck, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { OrderDetailPanel } from './OrderDetailPanel'
import { formatCurrency, formatDateTime, truncate } from '@/lib/utils'
import { useAssignDriverMutation, useRefundOrderMutation, useGetDriversQuery } from '@/store/api/adminApi'
import type { Order } from '@/types'

interface OrdersTableProps {
  orders: Order[]
  loading?: boolean
}

export function OrdersTable({ orders, loading }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [assignTarget, setAssignTarget] = useState<Order | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [assignDriver, { isLoading: assigning }] = useAssignDriverMutation()
  const [refund] = useRefundOrderMutation()
  const { data: drivers } = useGetDriversQuery({ approval_status: 'approved' })

  type OrderRow = Record<string, unknown> & Order

  const columns = [
    {
      key: 'order_number',
      label: 'Order #',
      sortable: true,
      render: (v: unknown) => <span className="font-mono text-xs font-medium text-text-primary">{String(v)}</span>,
    },
    { key: 'customer_name', label: 'Customer', sortable: true },
    { key: 'vendor_name', label: 'Vendor', sortable: true },
    {
      key: 'items',
      label: 'Items',
      render: (_: unknown, row: OrderRow) => (
        <span className="text-xs text-text-secondary">{truncate(row.items.map((i) => i.name).join(', '), 35)}</span>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      sortable: true,
      render: (v: unknown) => formatCurrency(Number(v)),
    },
    {
      key: 'delivery_fee',
      label: 'Fee',
      render: (v: unknown) => <span className="text-text-secondary">{formatCurrency(Number(v))}</span>,
    },
    {
      key: 'driver_name',
      label: 'Driver',
      render: (v: unknown) => v ? String(v) : <span className="text-text-muted italic text-xs">Unassigned</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v: unknown) => <Badge status={v as Order['status']} />,
    },
    {
      key: 'created_at',
      label: 'Time',
      sortable: true,
      render: (v: unknown) => <span className="text-xs text-text-muted">{formatDateTime(String(v))}</span>,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: unknown, row: OrderRow) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedOrder(row as unknown as Order)}>
            <Eye size={14} />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setAssignTarget(row as unknown as Order); setSelectedDriverId('') }}>
            <Truck size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:text-danger"
            onClick={async () => {
              await refund(row.id).unwrap()
              toast.success('Refunded')
            }}
          >
            <RotateCcw size={14} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="bg-white rounded-xl border border-surface-dark overflow-hidden">
        <Table<OrderRow>
          columns={columns}
          data={orders as unknown as OrderRow[]}
          loading={loading}
          emptyMessage="No orders found"
          emptyIcon="📦"
        />
      </div>

      <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <Modal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title="Assign Driver"
        size="sm"
      >
        {assignTarget && (
          <div className="space-y-4">
            <div className="bg-background rounded-lg p-3 text-sm">
              <p className="font-medium text-text-primary">{assignTarget.order_number}</p>
              <p className="text-text-secondary text-xs mt-0.5">{assignTarget.customer_name} → {assignTarget.vendor_name}</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">
                Select Driver
              </label>
              <select
                className="w-full border border-surface-dark rounded-lg px-3 py-2.5 text-sm bg-white text-text-primary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">Choose a driver…</option>
                {drivers?.filter((d) => d.status === 'online').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.active_deliveries} active)
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              loading={assigning}
              disabled={!selectedDriverId}
              onClick={async () => {
                await assignDriver({ orderId: assignTarget.id, driver_id: selectedDriverId }).unwrap()
                toast.success('Driver assigned')
                setAssignTarget(null)
              }}
            >
              Confirm Assignment
            </Button>
          </div>
        )}
      </Modal>
    </>
  )
}
