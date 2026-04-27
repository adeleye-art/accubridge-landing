'use client'

import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { CreditTransaction, Referral } from '@/types'

interface ReferralTableProps {
  referrals: Referral[]
  transactions: CreditTransaction[]
  loading?: boolean
}

export function ReferralTable({ referrals, transactions, loading }: ReferralTableProps) {
  type ReferralRow = Record<string, unknown> & Referral
  type TxRow = Record<string, unknown> & CreditTransaction

  const referralColumns = [
    { key: 'referrer_name', label: 'Referrer', sortable: true },
    { key: 'referred_name', label: 'Referred Friend', sortable: true },
    { key: 'orders_completed', label: 'Orders', sortable: true },
    {
      key: 'reward_status',
      label: 'Reward',
      sortable: true,
      render: (v: unknown) => <Badge status={v as Referral['reward_status']} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (v: unknown) => <span className="text-xs text-text-muted">{formatDate(String(v))}</span>,
    },
  ]

  const txColumns = [
    { key: 'user_name', label: 'User', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (v: unknown, row: TxRow) => (
        <span className={row.type === 'earned' ? 'text-success font-medium' : 'text-danger font-medium'}>
          {row.type === 'earned' ? '+' : '-'}{formatCurrency(Number(v))}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (v: unknown) => <Badge status={v as CreditTransaction['type']} />,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (v: unknown) => <span className="text-xs text-text-secondary">{String(v)}</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (v: unknown) => <span className="text-xs text-text-muted">{formatDate(String(v))}</span>,
    },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[55fr_45fr] gap-6">
      {/* Referral Tracking */}
      <div className="bg-white rounded-xl border border-surface-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-dark">
          <h3 className="font-semibold text-text-primary text-sm">Referral Tracking</h3>
        </div>
        <Table<ReferralRow>
          columns={referralColumns}
          data={referrals as unknown as ReferralRow[]}
          loading={loading}
          emptyMessage="No referrals yet"
          emptyIcon="🎁"
        />
      </div>

      {/* Credit Transactions */}
      <div className="bg-white rounded-xl border border-surface-dark overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-dark">
          <h3 className="font-semibold text-text-primary text-sm">Credit Transactions</h3>
        </div>
        <Table<TxRow>
          columns={txColumns}
          data={transactions as unknown as TxRow[]}
          loading={loading}
          emptyMessage="No transactions yet"
          emptyIcon="💳"
        />
      </div>
    </div>
  )
}
