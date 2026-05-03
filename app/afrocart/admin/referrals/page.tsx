'use client'

import { DollarSign, Clock, CreditCard } from 'lucide-react'
import { KpiCard } from '@/components/admin/KpiCard'
import { ReferralTable } from '@/components/admin/ReferralTable'
import { formatCurrency } from '@/lib/utils'
import type { Referral, CreditTransaction } from '@/types'

const MOCK_REFERRALS: Referral[] = [
  { id: 'r1', referrer_name: 'Amara Okafor',  referred_name: 'Seun Falola',    orders_completed: 5,  reward_status: 'paid',    created_at: '2026-01-15T09:00:00Z' },
  { id: 'r2', referrer_name: 'Kofi Mensah',   referred_name: 'Tunde Bakare',   orders_completed: 5,  reward_status: 'paid',    created_at: '2026-01-22T10:00:00Z' },
  { id: 'r3', referrer_name: 'Chidi Eze',     referred_name: 'Grace Osei',     orders_completed: 5,  reward_status: 'paid',    created_at: '2026-02-08T11:30:00Z' },
  { id: 'r4', referrer_name: 'Yemi Adeyemi',  referred_name: 'Olu Babalola',   orders_completed: 3,  reward_status: 'pending', created_at: '2026-03-10T14:00:00Z' },
  { id: 'r5', referrer_name: 'Fatima Diallo', referred_name: 'Abena Mensah',   orders_completed: 2,  reward_status: 'pending', created_at: '2026-03-25T09:00:00Z' },
  { id: 'r6', referrer_name: 'Amara Okafor',  referred_name: 'Kwame Asante',   orders_completed: 1,  reward_status: 'pending', created_at: '2026-04-12T10:00:00Z' },
  { id: 'r7', referrer_name: 'Ngozi Iwu',     referred_name: 'Emeka Nwosu',    orders_completed: 5,  reward_status: 'paid',    created_at: '2026-02-20T08:00:00Z' },
  { id: 'r8', referrer_name: 'Kofi Mensah',   referred_name: 'Chukwudi Obi',   orders_completed: 0,  reward_status: 'pending', created_at: '2026-04-30T15:00:00Z' },
]

const MOCK_TRANSACTIONS: CreditTransaction[] = [
  { id: 'ct1', user_id: 'u1', user_name: 'Amara Okafor',  amount: 500,  type: 'earned',   reason: 'Referral reward — Seun Falola',  created_at: '2026-01-20T09:00:00Z' },
  { id: 'ct2', user_id: 'u2', user_name: 'Kofi Mensah',   amount: 500,  type: 'earned',   reason: 'Referral reward — Tunde Bakare', created_at: '2026-01-27T10:00:00Z' },
  { id: 'ct3', user_id: 'u3', user_name: 'Chidi Eze',     amount: 500,  type: 'earned',   reason: 'Referral reward — Grace Osei',   created_at: '2026-02-13T11:00:00Z' },
  { id: 'ct4', user_id: 'u7', user_name: 'Ngozi Iwu',     amount: 500,  type: 'earned',   reason: 'Referral reward — Emeka Nwosu',  created_at: '2026-02-25T09:00:00Z' },
  { id: 'ct5', user_id: 'u3', user_name: 'Chidi Eze',     amount: 200,  type: 'deducted', reason: 'Order payment — Lagos Buka',      created_at: '2026-03-01T13:00:00Z' },
  { id: 'ct6', user_id: 'u1', user_name: 'Amara Okafor',  amount: 350,  type: 'earned',   reason: 'Welcome bonus',                   created_at: '2026-01-10T09:00:00Z' },
  { id: 'ct7', user_id: 'u6', user_name: 'Kwame Asante',  amount: 500,  type: 'deducted', reason: 'Order payment — Jerk Stop',       created_at: '2026-04-01T12:00:00Z' },
]

export default function ReferralsPage() {
  const totalPaid    = MOCK_REFERRALS.filter((r) => r.reward_status === 'paid').length
  const totalPending = MOCK_REFERRALS.filter((r) => r.reward_status === 'pending').length
  const creditsInCirculation = MOCK_TRANSACTIONS
    .filter((t) => t.type === 'earned')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Rewards Paid"           value={`${totalPaid} referrals`}    icon={<DollarSign size={20} />} />
        <KpiCard label="Pending Rewards"        value={`${totalPending} referrals`} subLabel="Awaiting completion" icon={<Clock size={20} />} />
        <KpiCard label="Credits in Circulation" value={formatCurrency(creditsInCirculation)} icon={<CreditCard size={20} />} />
      </div>

      <ReferralTable
        referrals={MOCK_REFERRALS}
        transactions={MOCK_TRANSACTIONS}
        loading={false}
      />
    </div>
  )
}
