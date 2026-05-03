'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { VendorOrder } from '@/types'

const REJECT_PRESETS = ['Item unavailable', 'Too busy', 'Closing soon', 'Other']

interface RejectOrderModalProps {
  order: VendorOrder | null
  onClose: () => void
  onConfirm: (order: VendorOrder, reason: string) => Promise<void>
}

export function RejectOrderModal({ order, onClose, onConfirm }: RejectOrderModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (!order) return null

  async function handleConfirm() {
    if (!reason.trim()) return
    setLoading(true)
    await onConfirm(order!, reason)
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={!!order} onClose={onClose} title={`Reject Order ${order.order_number}`} size="md">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-text-secondary">
          The customer will be notified and may not be charged.
        </div>

        {/* Preset reasons */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
            Reason for rejection
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {REJECT_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setReason(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  reason === p
                    ? 'bg-danger text-white border-danger'
                    : 'bg-white border-surface-dark text-text-secondary hover:border-danger/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejection..."
            className="w-full border border-surface-dark rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger text-text-primary bg-white resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="danger"
            size="md"
            className="flex-1"
            loading={loading}
            disabled={!reason.trim()}
            onClick={handleConfirm}
          >
            Confirm Rejection
          </Button>
          <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}
