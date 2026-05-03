'use client'

import { X, CheckCircle2, Circle, MapPin, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { VendorOrder, OrderStatus } from '@/types'
import { AcceptOrderModal } from './AcceptOrderModal'
import { RejectOrderModal } from './RejectOrderModal'

interface OrderDetailPanelProps {
  order: VendorOrder | null
  onClose: () => void
  onStatusChange?: (id: string, status: OrderStatus) => void
}

const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: 'pending',    label: 'Order Placed' },
  { status: 'accepted',   label: 'Accepted' },
  { status: 'preparing',  label: 'Preparing' },
  { status: 'picked_up',  label: 'Ready for Pickup' },
  { status: 'delivered',  label: 'Delivered' },
  { status: 'completed',  label: 'Completed' },
]

const STATUS_ORDER: OrderStatus[] = ['pending', 'accepted', 'preparing', 'picked_up', 'delivered', 'completed']

function stepState(step: OrderStatus, current: OrderStatus) {
  if (current === 'cancelled') return 'future'
  const si = STATUS_ORDER.indexOf(step)
  const ci = STATUS_ORDER.indexOf(current)
  if (si < ci) return 'done'
  if (si === ci) return 'current'
  return 'future'
}

export function OrderDetailPanel({ order, onClose, onStatusChange }: OrderDetailPanelProps) {
  const [acceptTarget, setAcceptTarget] = useState<VendorOrder | null>(null)
  const [rejectTarget, setRejectTarget] = useState<VendorOrder | null>(null)
  const [markingReady, setMarkingReady] = useState(false)

  if (!order) return null

  async function handleMarkReady() {
    setMarkingReady(true)
    await new Promise((r) => setTimeout(r, 400))
    setMarkingReady(false)
    onStatusChange?.(order!.id, 'picked_up')
    toast.success(`${order!.order_number} marked ready for pickup`)
    onClose()
  }

  async function handleAccept(o: VendorOrder, prepTime: number) {
    await new Promise((r) => setTimeout(r, 400))
    onStatusChange?.(o.id, 'accepted')
    toast.success(`Order accepted — ${prepTime} min prep time set`)
  }

  async function handleReject(o: VendorOrder, reason: string) {
    await new Promise((r) => setTimeout(r, 400))
    onStatusChange?.(o.id, 'cancelled')
    toast.success(`Order rejected: ${reason}`)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[380px] bg-[#EFECE5] border-l border-[#E4E0D5] z-40 flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E0D5]">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-text-primary text-sm">{order.order_number}</h2>
            <Badge status={order.status} />
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-dark text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Customer */}
          <div className="bg-background rounded-lg p-4 space-y-2">
            <p className="text-xs uppercase tracking-wider text-text-muted mb-1">Customer</p>
            <p className="text-sm font-medium text-text-primary">{order.customer_name}</p>
            <div className="flex items-start gap-1.5 text-xs text-text-secondary">
              <MapPin size={12} className="mt-0.5 flex-shrink-0 text-[#B8962E]" />
              <span>{order.customer_address}</span>
            </div>
            {order.customer_note && (
              <div className="flex items-start gap-1.5 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <MessageSquare size={12} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <p className="text-xs text-[#1A1814]">📝 {order.customer_note}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Items</p>
            <div className="bg-background rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-[#E4E0D5] last:border-0">
                      <td className="px-4 py-2.5 text-text-secondary">
                        {item.quantity}× {item.name}
                      </td>
                      <td className="px-4 py-2.5 text-right text-text-primary font-medium">
                        {formatCurrency(item.total / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-background rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal / 100)}</span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Delivery Fee</span><span>{formatCurrency(order.delivery_fee / 100)}</span>
            </div>
            <div className="border-t border-[#E4E0D5] pt-2 flex justify-between text-sm font-semibold text-text-primary">
              <span>Total</span><span>{formatCurrency(order.total_amount / 100)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Payment</span>
              <Badge status={order.payment_status === 'paid' ? 'paid' : order.payment_status === 'refunded' ? 'rejected' : 'pending'} />
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Order Timeline</p>
              <div className="space-y-3">
                {TIMELINE.map((step) => {
                  const state = stepState(step.status, order.status)
                  return (
                    <div key={step.status} className="flex items-center gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                        state === 'done'    && 'bg-[#B8962E]',
                        state === 'current' && 'bg-[#B8962E] ring-2 ring-[#B8962E]/30 ring-offset-1',
                        state === 'future'  && 'bg-[#E4E0D5]'
                      )}>
                        {state === 'done' ? (
                          <CheckCircle2 size={12} className="text-white" />
                        ) : (
                          <Circle size={8} className={state === 'current' ? 'text-white' : 'text-text-muted'} />
                        )}
                      </div>
                      <span className={cn(
                        'text-sm',
                        state === 'future' ? 'text-text-muted' : 'text-text-secondary'
                      )}>
                        {step.label}
                      </span>
                      {state === 'current' && (
                        <span className="ml-auto">
                          <span className="w-2 h-2 bg-[#B8962E] rounded-full inline-block animate-pulse" />
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Driver */}
          {order.driver_name && (
            <div className="bg-background rounded-lg p-4">
              <p className="text-xs uppercase tracking-wider text-text-muted mb-2">Driver</p>
              <p className="text-sm font-medium text-text-primary">{order.driver_name}</p>
              {order.driver_phone && (
                <p className="text-xs text-text-secondary">{order.driver_phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#E4E0D5] flex gap-2 flex-wrap">
          {order.status === 'pending' && (
            <>
              <Button
                variant="primary"
                size="md"
                className="flex-1 bg-[#2E7D52] hover:bg-[#256644]"
                onClick={() => setAcceptTarget(order)}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={() => setRejectTarget(order)}
              >
                Reject
              </Button>
            </>
          )}
          {(order.status === 'accepted' || order.status === 'preparing') && (
            <Button
              variant="primary"
              size="md"
              className="w-full bg-[#2E7D52] hover:bg-[#256644]"
              loading={markingReady}
              onClick={handleMarkReady}
            >
              Mark as Ready
            </Button>
          )}
          {order.status === 'completed' && (
            <Button variant="outline" size="md" className="w-full" onClick={() => window.print()}>
              Print Receipt
            </Button>
          )}
        </div>
      </aside>

      <AcceptOrderModal order={acceptTarget} onClose={() => setAcceptTarget(null)} onConfirm={handleAccept} />
      <RejectOrderModal order={rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
    </>
  )
}
