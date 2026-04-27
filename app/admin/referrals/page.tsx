'use client'

import { DollarSign, Clock, CreditCard, AlertCircle, RefreshCcw } from 'lucide-react'
import { KpiCard } from '@/components/admin/KpiCard'
import { ReferralTable } from '@/components/admin/ReferralTable'
import { Button } from '@/components/ui/Button'
import { useGetReferralsQuery, useGetCreditTransactionsQuery } from '@/store/api/adminApi'
import { formatCurrency } from '@/lib/utils'

export default function ReferralsPage() {
  const { data: referrals, isLoading: loadingReferrals, isError: errorReferrals, refetch: refetchReferrals } = useGetReferralsQuery()
  const { data: transactions, isLoading: loadingTx, isError: errorTx, refetch: refetchTx } = useGetCreditTransactionsQuery()

  const totalPaid = referrals?.filter((r) => r.reward_status === 'paid').length ?? 0
  const totalPending = referrals?.filter((r) => r.reward_status === 'pending').length ?? 0
  const creditsInCirculation = transactions?.filter((t) => t.type === 'earned').reduce((sum, t) => sum + t.amount, 0) ?? 0

  const isError = errorReferrals || errorTx

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={40} className="text-danger" />
        <p className="text-text-secondary">Failed to load referrals data</p>
        <Button variant="outline" onClick={() => { refetchReferrals(); refetchTx() }} icon={<RefreshCcw size={14} />}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loadingReferrals || loadingTx ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-surface-dark p-6 h-32 animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard label="Rewards Paid" value={`${totalPaid} referrals`} icon={<DollarSign size={20} />} />
            <KpiCard label="Pending Rewards" value={`${totalPending} referrals`} subLabel="Awaiting completion" icon={<Clock size={20} />} />
            <KpiCard label="Credits in Circulation" value={formatCurrency(creditsInCirculation)} icon={<CreditCard size={20} />} />
          </>
        )}
      </div>

      <ReferralTable
        referrals={referrals ?? []}
        transactions={transactions ?? []}
        loading={loadingReferrals || loadingTx}
      />
    </div>
  )
}
