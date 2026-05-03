'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { VendorOrder } from '@/types'

const PREP_PRESETS = [10, 15, 20, 30]

interface AcceptOrderModalProps {
  order: VendorOrder | null
  onClose: () => void
  onConfirm: (order: VendorOrder, prepTime: number) => Promise<void>
}

export function AcceptOrderModal({ order, onClose, onConfirm }: AcceptOrderModalProps) {
  const [prepTime, setPrepTime] = useState<string>('20')
  const [loading, setLoading] = useState(false)

  if (!order) return null

  async function handleConfirm() {
    const mins = parseInt(prepTime, 10)
    if (!mins || mins < 1) return
    setLoading(true)
    await onConfirm(order!, mins)
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={!!order} onClose={onClose} title={`Accept Order ${order.order_number}`} size="md">
      <div className="space-y-4">
        {/* Order summary */}
        <div className="bg-background rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-text-primary">{order.customer_name}</p>
          <ul className="text-xs text-text-secondary space-y-1">
            {order.items.map((item, i) => (
              <li key={i}>{item.quantity}× {item.name}</li>
            ))}
          </ul>
          <p className="text-sm font-semibold text-text-primary pt-1">
            Total: {formatCurrency(order.total_amount / 100)}
          </p>
        </div>

        {/* Prep time */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
            Estimated Prep Time (minutes)
          </label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {PREP_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrepTime(String(p))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  prepTime === String(p)
                    ? 'bg-[#B8962E] text-white border-[#B8962E]'
                    : 'bg-white border-surface-dark text-text-secondary hover:border-gold'
                }`}
              >
                {p} min
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            placeholder="Custom time..."
            className="w-full border border-surface-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary bg-white"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1 bg-[#2E7D52] hover:bg-[#256644]"
            loading={loading}
            disabled={!prepTime || parseInt(prepTime) < 1}
            onClick={handleConfirm}
          >
            Confirm & Accept
          </Button>
          <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}
