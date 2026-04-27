'use client'

import { X, CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useRefundOrderMutation, useAssignDriverMutation, useGetDriversQuery } from '@/store/api/adminApi'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Order, OrderStatus } from '@/types'

interface OrderDetailPanelProps {
  order: Order | null
  onClose: () => void
}

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'accepted', label: 'Accepted' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'picked_up', label: 'Picked Up' },
  { status: 'delivered', label: 'Delivered' },
  { status: 'completed', label: 'Completed' },
]

const STATUS_ORDER: OrderStatus[] = ['pending', 'accepted', 'preparing', 'picked_up', 'delivered', 'completed']

function getStepState(step: OrderStatus, current: OrderStatus) {
  if (current === 'cancelled') return 'future'
  const stepIdx = STATUS_ORDER.indexOf(step)
  const currIdx = STATUS_ORDER.indexOf(current)
  if (stepIdx < currIdx) return 'done'
  if (stepIdx === currIdx) return 'current'
  return 'future'
}

export function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
  const [refund, { isLoading: refunding }] = useRefundOrderMutation()
  const [assignDriver] = useAssignDriverMutation()
  const { data: drivers } = useGetDriversQuery({ approval_status: 'approved' })

  if (!order) return null

  async function handleRefund() {
    if (!order) return
    try {
      await refund(order.id).unwrap()
      toast.success('Order refunded')
      onClose()
    } catch {
      toast.error('Refund failed')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[420px] bg-surface border-l border-surface-dark z-40 flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-dark">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-text-primary text-sm">{order.order_number}</h2>
            <Badge status={order.status} />
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-dark text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Customer info */}
          <div className="bg-background rounded-lg p-4 space-y-1.5">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-2">Customer</p>
            <p className="text-sm font-medium text-text-primary">{order.customer_name}</p>
            <p className="text-xs text-text-secondary">{order.vendor_name}</p>
            <p className="text-xs text-text-muted">{formatDateTime(order.created_at)}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Items</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="text-text-primary font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-background rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Delivery Fee</span>
              <span>{formatCurrency(order.delivery_fee)}</span>
            </div>
            {order.credits_used > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Credits Used</span>
                <span>-{formatCurrency(order.credits_used)}</span>
              </div>
            )}
            <div className="border-t border-surface-dark pt-2 flex justify-between text-sm font-semibold text-text-primary">
              <span>Grand Total</span>
              <span>{formatCurrency(order.total_amount + order.delivery_fee - order.credits_used)}</span>
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Order Timeline</p>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {TIMELINE_STEPS.map((step, i) => {
                  const state = getStepState(step.status, order.status)
                  return (
                    <div key={step.status} className="flex items-center">
                      <div className="flex flex-col items-center gap-1 min-w-[52px]">
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            state === 'done' && 'bg-gold',
                            state === 'current' && 'bg-gold ring-2 ring-gold/30 ring-offset-1',
                            state === 'future' && 'bg-surface-dark'
                          )}
                        >
                          {state === 'done' ? (
                            <CheckCircle2 size={14} className="text-white" />
                          ) : (
                            <Circle size={10} className={state === 'current' ? 'text-white' : 'text-text-muted'} />
                          )}
                        </div>
                        <span className={cn('text-[9px] text-center leading-tight', state === 'future' ? 'text-text-muted' : 'text-text-secondary')}>
                          {step.label}
                        </span>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={cn('w-4 h-px mb-3.5', state === 'done' ? 'bg-gold' : 'bg-surface-dark')} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Driver */}
          <div className="bg-background rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-2">Driver</p>
            {order.driver_name ? (
              <p className="text-sm text-text-primary font-medium">{order.driver_name}</p>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-text-muted flex-1">Unassigned</p>
                <select
                  className="text-xs border border-surface-dark rounded px-2 py-1 bg-white text-text-primary focus:outline-none focus:border-gold"
                  defaultValue=""
                  onChange={async (e) => {
                    if (!e.target.value || !order) return
                    await assignDriver({ orderId: order.id, driver_id: e.target.value })
                    toast.success('Driver assigned')
                  }}
                >
                  <option value="">Assign driver…</option>
                  {drivers?.filter((d) => d.status === 'online').map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-dark">
          <Button
            variant="danger-outline"
            size="md"
            className="w-full"
            loading={refunding}
            onClick={handleRefund}
            disabled={order.status === 'cancelled' || order.status === 'completed'}
          >
            Refund Order
          </Button>
        </div>
      </aside>
    </>
  )
}
