'use client'

import { useState } from 'react'
import { DriverTopbar } from '@/components/driver/DriverTopbar'
import { EarningsBarChart } from '@/components/driver/EarningsBarChart'
import { TrendingUp, Clock, CreditCard } from 'lucide-react'

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return iso }
}

const MOCK_SUMMARY = {
  today: 4250,
  this_week: 22800,
  this_month: 89500,
  all_time: 412000,
  deliveries_today: 6,
  deliveries_week: 34,
  daily_earnings: [
    { date: '2026-04-28', amount: 3200, deliveries: 5 },
    { date: '2026-04-29', amount: 5100, deliveries: 8 },
    { date: '2026-04-30', amount: 2800, deliveries: 4 },
    { date: '2026-05-01', amount: 4100, deliveries: 6 },
    { date: '2026-05-02', amount: 3700, deliveries: 5 },
    { date: '2026-05-03', amount: 4250, deliveries: 6 },
    { date: '2026-05-04', amount: 0,    deliveries: 0 },
  ],
}

const MOCK_PAYOUT = {
  pending_amount: 14200,
  next_payout_date: '2026-05-07T00:00:00Z',
  bank_account_masked: '****4821',
  bank_name: 'Monzo',
}

const MOCK_RECORDS = [
  { id: 'r1', date: '2026-05-03', deliveries: 6, gross: 4250, tip: 180, fee: 320 },
  { id: 'r2', date: '2026-05-02', deliveries: 5, gross: 3700, tip: 0,   fee: 280 },
  { id: 'r3', date: '2026-05-01', deliveries: 6, gross: 4100, tip: 200, fee: 310 },
  { id: 'r4', date: '2026-04-30', deliveries: 4, gross: 2800, tip: 100, fee: 210 },
  { id: 'r5', date: '2026-04-29', deliveries: 8, gross: 5100, tip: 350, fee: 385 },
  { id: 'r6', date: '2026-04-28', deliveries: 5, gross: 3200, tip: 0,   fee: 240 },
]

type Period = 'week' | 'month' | 'all'

export default function DriverEarningsPage() {
  const [period, setPeriod] = useState<Period>('week')

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'week',  label: 'This Week'  },
    { key: 'month', label: 'This Month' },
    { key: 'all',   label: 'All Time'   },
  ]

  const summaryValue =
    period === 'week'  ? MOCK_SUMMARY.this_week  :
    period === 'month' ? MOCK_SUMMARY.this_month :
                         MOCK_SUMMARY.all_time

  return (
    <>
      <DriverTopbar title="Earnings" />
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Period tabs */}
          <div className="flex gap-2">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  period === key
                    ? 'bg-[#1A1814] text-white'
                    : 'bg-white border border-[#E4E0D5] text-[#5C5750] hover:border-[#B8962E]/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Hero card */}
          <div className="bg-gradient-to-br from-[#1E1B16] to-[#2D2820] rounded-2xl p-6 text-white">
            <p className="text-sm text-white/60 mb-1">
              {period === 'week' ? 'This week' : period === 'month' ? 'This month' : 'All time'}
            </p>
            <p className="text-4xl font-bold text-[#B8962E]">{gbp(summaryValue)}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={14} />
                {period === 'week' ? MOCK_SUMMARY.deliveries_week : '--'} deliveries
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                Today: {gbp(MOCK_SUMMARY.today)}
              </span>
            </div>
          </div>

          {/* Payout info */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F7F5F0] flex items-center justify-center">
                <CreditCard size={18} className="text-[#B8962E]" />
              </div>
              <div>
                <p className="font-semibold text-[#1A1814]">Next Payout</p>
                <p className="text-sm text-[#9C968E]">
                  {MOCK_PAYOUT.bank_name} · {MOCK_PAYOUT.bank_account_masked}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F7F5F0] rounded-xl p-3">
                <p className="text-xs text-[#9C968E] mb-1">Pending Amount</p>
                <p className="text-xl font-bold text-[#B8962E]">{gbp(MOCK_PAYOUT.pending_amount)}</p>
              </div>
              <div className="bg-[#F7F5F0] rounded-xl p-3">
                <p className="text-xs text-[#9C968E] mb-1">Payout Date</p>
                <p className="text-sm font-bold text-[#1A1814]">{formatDate(MOCK_PAYOUT.next_payout_date)}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5">
            <h3 className="font-semibold text-[#1A1814] mb-4">Daily Breakdown</h3>
            <EarningsBarChart data={MOCK_SUMMARY.daily_earnings} showDeliveries />
          </div>

          {/* Daily records table */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4E0D5]">
              <h3 className="font-semibold text-[#1A1814]">Earnings Log</h3>
            </div>
            <div className="divide-y divide-[#E4E0D5]">
              {/* Header */}
              <div className="grid grid-cols-5 px-5 py-2 text-xs font-medium text-[#9C968E] uppercase tracking-wide">
                <span className="col-span-2">Date</span>
                <span className="text-right">Deliveries</span>
                <span className="text-right">Tips</span>
                <span className="text-right font-semibold text-[#1A1814]">Net</span>
              </div>
              {MOCK_RECORDS.map((r) => (
                <div key={r.id} className="grid grid-cols-5 px-5 py-3 text-sm items-center">
                  <span className="col-span-2 text-[#1A1814]">{formatDate(r.date)}</span>
                  <span className="text-right text-[#5C5750]">{r.deliveries}</span>
                  <span className="text-right text-[#5C5750]">{r.tip > 0 ? gbp(r.tip) : '—'}</span>
                  <span className="text-right font-semibold text-[#B8962E]">{gbp(r.gross - r.fee)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
