'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { VendorDetailPanel } from './VendorDetailPanel'
import { formatDate } from '@/lib/utils'
import type { Vendor } from '@/types'

interface VendorTableProps {
  vendors: Vendor[]
  loading?: boolean
}

export function VendorTable({ vendors, loading }: VendorTableProps) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [approvingId, setApprovingId] = useState(false)
  const [rejectingId, setRejectingId] = useState(false)

  type VendorRow = Record<string, unknown> & Vendor

  const columns = [
    {
      key: 'business_name',
      label: 'Business',
      sortable: true,
      render: (_: unknown, row: VendorRow) => (
        <div>
          <p className="font-medium text-text-primary text-sm">{row.business_name}</p>
          <Badge status={row.business_type} className="mt-1" />
        </div>
      ),
    },
    { key: 'address', label: 'Address', render: (v: unknown) => <span className="text-text-secondary text-xs">{String(v)}</span> },
    { key: 'owner_name', label: 'Owner', sortable: true },
    {
      key: 'created_at',
      label: 'Submitted',
      sortable: true,
      render: (v: unknown) => <span className="text-text-muted text-xs">{formatDate(String(v))}</span>,
    },
    {
      key: 'commission_rate',
      label: 'Commission',
      sortable: true,
      render: (v: unknown) => <span className="font-medium text-text-primary">{String(v)}%</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (v: unknown) => <Badge status={v as Vendor['status']} />,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_: unknown, row: VendorRow) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="primary"
                className="bg-success hover:bg-[#256644] text-xs h-7 px-2"
                loading={approvingId}
                onClick={async (e) => {
                  e.stopPropagation()
                  setApprovingId(true)
                  await new Promise((r) => setTimeout(r, 400))
                  setApprovingId(false)
                  toast.success('Vendor approved')
                }}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="text-xs h-7 px-2"
                loading={rejectingId}
                onClick={async (e) => {
                  e.stopPropagation()
                  setRejectingId(true)
                  await new Promise((r) => setTimeout(r, 400))
                  setRejectingId(false)
                  toast.error('Vendor rejected')
                }}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedVendor(row as unknown as Vendor)
            }}
          >
            <Eye size={14} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="bg-white rounded-xl border border-surface-dark overflow-hidden">
        <Table<VendorRow>
          columns={columns}
          data={vendors as unknown as VendorRow[]}
          loading={loading}
          emptyMessage="No vendors found"
          emptyIcon="🏪"
        />
      </div>
      <VendorDetailPanel vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
    </>
  )
}
