'use client'

import { X, FileText, IdCard } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import {
  useApproveVendorMutation,
  useRejectVendorMutation,
  useUpdateCommissionMutation,
} from '@/store/api/adminApi'
import type { Vendor } from '@/types'

interface VendorDetailPanelProps {
  vendor: Vendor | null
  onClose: () => void
}

export function VendorDetailPanel({ vendor, onClose }: VendorDetailPanelProps) {
  const [commission, setCommission] = useState('')
  const [approve, { isLoading: approving }] = useApproveVendorMutation()
  const [reject, { isLoading: rejecting }] = useRejectVendorMutation()
  const [updateCommission, { isLoading: updatingCommission }] = useUpdateCommissionMutation()

  if (!vendor) return null

  async function handleApprove() {
    try {
      await approve(vendor!.id).unwrap()
      toast.success(`${vendor!.business_name} approved`)
      onClose()
    } catch {
      toast.error('Failed to approve')
    }
  }

  async function handleReject() {
    try {
      await reject(vendor!.id).unwrap()
      toast.success(`${vendor!.business_name} rejected`)
      onClose()
    } catch {
      toast.error('Failed to reject')
    }
  }

  async function handleUpdateCommission() {
    const rate = parseFloat(commission)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Enter a valid rate (0–100)')
      return
    }
    try {
      await updateCommission({ id: vendor!.id, commission_rate: rate }).unwrap()
      toast.success('Commission updated')
      setCommission('')
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[420px] bg-surface border-l border-surface-dark z-40 flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-dark">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-text-primary text-sm">{vendor.business_name}</h2>
            <Badge status={vendor.status} />
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-dark text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Business Info */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Business Info</p>
            <div className="bg-background rounded-lg p-4 space-y-2">
              <Row label="Name" value={vendor.business_name} />
              <Row label="Type" value={<Badge status={vendor.business_type} />} />
              <Row label="Address" value={vendor.address} />
              <Row label="Submitted" value={formatDate(vendor.created_at)} />
            </div>
          </section>

          {/* Owner Info */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Owner Info</p>
            <div className="bg-background rounded-lg p-4 space-y-2">
              <Row label="Name" value={vendor.owner_name} />
              <Row label="Email" value={vendor.email} />
              <Row label="Phone" value={vendor.phone} />
            </div>
          </section>

          {/* Documents */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Documents</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Business Registration', icon: FileText },
                { label: 'ID Verification', icon: IdCard },
              ].map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="bg-background border border-surface-dark rounded-lg p-4 flex flex-col items-center gap-2 text-center"
                >
                  <Icon size={24} className="text-text-muted" />
                  <p className="text-xs text-text-secondary">{label}</p>
                  <span className="text-xs text-gold">View</span>
                </div>
              ))}
            </div>
          </section>

          {/* Commission Rate */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Commission Rate</p>
            <div className="bg-background rounded-lg p-4 space-y-3">
              <p className="text-sm text-text-secondary">
                Current rate:{' '}
                <span className="font-semibold text-text-primary">{vendor.commission_rate}%</span>
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="New rate %"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  loading={updatingCommission}
                  onClick={handleUpdateCommission}
                >
                  Update
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        {vendor.status === 'pending' && (
          <div className="px-6 py-4 border-t border-surface-dark flex gap-3">
            <Button
              variant="primary"
              size="md"
              className="flex-1 bg-success hover:bg-[#256644]"
              loading={approving}
              onClick={handleApprove}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="md"
              className="flex-1"
              loading={rejecting}
              onClick={handleReject}
            >
              Reject
            </Button>
            <Button variant="outline" size="md">
              Message
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4 text-sm">
      <span className="text-text-muted flex-shrink-0">{label}</span>
      <span className="text-text-primary text-right">{value}</span>
    </div>
  )
}
