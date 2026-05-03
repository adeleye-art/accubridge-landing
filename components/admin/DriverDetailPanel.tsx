'use client'

import { useState } from 'react'
import { X, FileText, Car, Bike, Truck, ExternalLink, CheckSquare, Square } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Driver, VehicleType } from '@/types'

interface DriverDetailPanelProps {
  driver: Driver | null
  onClose: () => void
}

const VEHICLE_ICONS: Record<VehicleType, React.ReactNode> = {
  bicycle: <Bike size={16} />,
  moped: <Bike size={16} />,
  motorcycle: <Bike size={16} />,
  car: <Car size={16} />,
  van: <Truck size={16} />,
}

const VEHICLE_LABELS: Record<VehicleType, string> = {
  bicycle: 'Bicycle',
  moped: 'Moped',
  motorcycle: 'Motorcycle',
  car: 'Car',
  van: 'Van',
}

const DOC_LABELS: Record<string, string> = {
  driving_licence: 'Driving Licence (front)',
  vehicle_insurance: 'Vehicle Insurance Certificate',
  right_to_work: 'Proof of Right to Work (UK)',
  profile_photo: 'Profile Photo',
}

export function DriverDetailPanel({ driver, onClose }: DriverDetailPanelProps) {
  const [rejectMode, setRejectMode] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [suspending, setSuspending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifiedDocs, setVerifiedDocs] = useState<Set<string>>(new Set())

  if (!driver) return null

  const allDocsVerified = driver.documents.length === 0 || driver.documents.every((d) => d.verified || verifiedDocs.has(d.type))
  const canApprove = driver.dbs_check_acknowledged && (driver.documents.length === 0 || allDocsVerified)

  async function handleApprove() {
    setApproving(true)
    await new Promise((r) => setTimeout(r, 500))
    setApproving(false)
    toast.success(`${driver!.name} approved`)
    onClose()
  }

  async function handleReject() {
    if (!rejectReason.trim()) { toast.error('Please enter a rejection reason'); return }
    setRejecting(true)
    await new Promise((r) => setTimeout(r, 500))
    setRejecting(false)
    toast.success(`${driver!.name} rejected`)
    onClose()
  }

  async function handleSuspend() {
    setSuspending(true)
    await new Promise((r) => setTimeout(r, 500))
    setSuspending(false)
    toast.success(`${driver!.name} suspended`)
    onClose()
  }

  async function handleVerifyDoc(docType: string, currentlyVerified: boolean) {
    if (currentlyVerified || verifiedDocs.has(docType)) return
    setVerifying(true)
    await new Promise((r) => setTimeout(r, 400))
    setVerifying(false)
    setVerifiedDocs((prev) => new Set([...prev, docType]))
    toast.success('Document verified')
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-[440px] bg-surface border-l border-surface-dark z-40 flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-dark">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-text-primary text-sm">{driver.name}</h2>
            <Badge status={driver.approval_status} />
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-dark text-text-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Personal Info */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Personal Info</p>
            <div className="bg-background rounded-lg p-4 space-y-2">
              <Row label="Name" value={driver.name} />
              <Row label="Email" value={driver.email} />
              <Row label="Phone" value={driver.phone} />
              <Row label="Registered" value={formatDate(driver.created_at)} />
            </div>
          </section>

          {/* Vehicle Info */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Vehicle Info</p>
            <div className="bg-background rounded-lg p-4 space-y-2">
              <Row
                label="Vehicle Type"
                value={
                  <span className="flex items-center gap-1.5">
                    {VEHICLE_ICONS[driver.vehicle_type]}
                    {VEHICLE_LABELS[driver.vehicle_type]}
                  </span>
                }
              />
              {driver.vehicle_plate && (
                <Row label="Plate Number" value={<code className="text-xs">{driver.vehicle_plate}</code>} />
              )}
            </div>
          </section>

          {/* Documents */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">
              Submitted Documents
            </p>
            <div className="space-y-2">
              {driver.documents.length === 0 ? (
                <p className="text-xs text-text-muted bg-background rounded-lg px-4 py-3">
                  No documents uploaded yet.
                </p>
              ) : (
                driver.documents.map((doc) => (
                  <div
                    key={doc.type}
                    className="bg-background rounded-lg px-4 py-3 flex items-center gap-3"
                  >
                    <FileText size={14} className="text-text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">
                        {DOC_LABELS[doc.type] ?? doc.type}
                      </p>
                    </div>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gold hover:underline flex items-center gap-0.5 flex-shrink-0"
                      >
                        View <ExternalLink size={10} />
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={doc.verified || verifiedDocs.has(doc.type) || verifying}
                      onClick={() => handleVerifyDoc(doc.type, doc.verified)}
                      className="flex items-center gap-1 text-xs flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                      title={doc.verified || verifiedDocs.has(doc.type) ? 'Already verified' : 'Mark as verified'}
                    >
                      {doc.verified || verifiedDocs.has(doc.type) ? (
                        <>
                          <CheckSquare size={14} className="text-success" />
                          <span className="text-success">Verified</span>
                        </>
                      ) : (
                        <>
                          <Square size={14} className="text-text-muted" />
                          <span className="text-text-muted">Verify</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* DBS Check */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">DBS Check</p>
            <div className="bg-background rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                {driver.dbs_check_acknowledged ? (
                  <CheckSquare size={16} className="text-success mt-0.5 flex-shrink-0" />
                ) : (
                  <Square size={16} className="text-text-muted mt-0.5 flex-shrink-0" />
                )}
                <p className="text-xs text-text-secondary">
                  Candidate acknowledged DBS check consent
                </p>
              </div>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
              >
                <ExternalLink size={12} />
                Request DBS Check
              </a>
            </div>
          </section>

          {/* Approval History */}
          <section>
            <p className="text-xs uppercase tracking-wider text-text-muted mb-3">Status</p>
            <div className="bg-background rounded-lg p-4 space-y-2">
              <Row label="Current Status" value={<Badge status={driver.approval_status} />} />
              {driver.rejection_reason && (
                <Row label="Rejection Reason" value={driver.rejection_reason} />
              )}
            </div>
          </section>

          {/* Reject reason textarea */}
          {rejectMode && (
            <section>
              <p className="text-xs uppercase tracking-wider text-text-muted mb-2">
                Rejection Reason
              </p>
              <textarea
                className="w-full border border-surface-dark rounded-lg px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
                rows={3}
                placeholder="Explain why the application is being rejected…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  loading={rejecting}
                  onClick={handleReject}
                >
                  Confirm Rejection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRejectMode(false)
                    setRejectReason('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        {!rejectMode && (
          <div className="px-6 py-4 border-t border-surface-dark flex gap-2 flex-wrap">
            {(driver.approval_status === 'pending' || driver.approval_status === 'rejected') && (
              <Button
                variant="primary"
                size="md"
                className="flex-1 bg-[#2E7D52] hover:bg-[#256644]"
                loading={approving}
                disabled={!canApprove}
                title={!canApprove ? 'Verify all documents first' : undefined}
                onClick={handleApprove}
              >
                Approve
              </Button>
            )}

            {driver.approval_status !== 'rejected' && (
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={() => setRejectMode(true)}
              >
                Reject
              </Button>
            )}

            {driver.approval_status === 'approved' && (
              <Button
                variant="outline"
                size="md"
                className="border-amber-400 text-amber-700 hover:bg-amber-50"
                loading={suspending}
                onClick={handleSuspend}
              >
                Suspend
              </Button>
            )}

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
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="text-text-muted flex-shrink-0">{label}</span>
      <span className="text-text-primary text-right">{value}</span>
    </div>
  )
}
