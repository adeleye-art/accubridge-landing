'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Percent, Wallet, Calendar, Download } from 'lucide-react'
import { EarningsLineChart } from '@/components/vendor/EarningsLineChart'
import { Button } from '@/components/ui/Button'
import { format, subDays, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { EarningsRecord, PayoutInfo, VendorStats } from '@/types'

// ─── Mock Data ────────────────────────────────────────────────────────────────

function makeDailyEarnings() {
  const earnings = []
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
    const amount = Math.floor(Math.random() * 30000 + 15000)
    earnings.push({ date, amount })
  }
  return earnings
}

const MOCK_DAILY = makeDailyEarnings()

const MOCK_EARNINGS: EarningsRecord[] = [
  { id: 'e1',  order_id: 'o1',  order_number: '#AC-00342', date: '2026-05-01', items_total: 2050, commission_rate: 20, commission_amount: 410,  net_earned: 1640, payout_status: 'pending' },
  { id: 'e2',  order_id: 'o2',  order_number: '#AC-00340', date: '2026-05-01', items_total: 1800, commission_rate: 20, commission_amount: 360,  net_earned: 1440, payout_status: 'pending' },
  { id: 'e3',  order_id: 'o3',  order_number: '#AC-00338', date: '2026-05-01', items_total: 3900, commission_rate: 20, commission_amount: 780,  net_earned: 3120, payout_status: 'pending' },
  { id: 'e4',  order_id: 'o4',  order_number: '#AC-00335', date: '2026-04-30', items_total: 1500, commission_rate: 20, commission_amount: 300,  net_earned: 1200, payout_status: 'processing' },
  { id: 'e5',  order_id: 'o5',  order_number: '#AC-00330', date: '2026-04-30', items_total: 4100, commission_rate: 20, commission_amount: 820,  net_earned: 3280, payout_status: 'processing' },
  { id: 'e6',  order_id: 'o6',  order_number: '#AC-00325', date: '2026-04-29', items_total: 1250, commission_rate: 20, commission_amount: 250,  net_earned: 1000, payout_status: 'paid' },
  { id: 'e7',  order_id: 'o7',  order_number: '#AC-00318', date: '2026-04-29', items_total: 2800, commission_rate: 20, commission_amount: 560,  net_earned: 2240, payout_status: 'paid' },
  { id: 'e8',  order_id: 'o8',  order_number: '#AC-00310', date: '2026-04-28', items_total: 1700, commission_rate: 20, commission_amount: 340,  net_earned: 1360, payout_status: 'paid' },
  { id: 'e9',  order_id: 'o9',  order_number: '#AC-00302', date: '2026-04-28', items_total: 3200, commission_rate: 20, commission_amount: 640,  net_earned: 2560, payout_status: 'paid' },
  { id: 'e10', order_id: 'o10', order_number: '#AC-00295', date: '2026-04-27', items_total: 950,  commission_rate: 20, commission_amount: 190,  net_earned: 760,  payout_status: 'paid' },
]

const MOCK_PAYOUT: PayoutInfo = {
  next_payout_date: '2026-05-09',
  pending_amount: 9480,
  bank_account_masked: '****1234',
  bank_name: 'Barclays Bank',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

function formatDate(d: string) {
  try { return format(parseISO(d), 'dd MMM yyyy') } catch { return d }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PER_PAGE = 20

export default function EarningsPage() {
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [page, setPage]       = useState(1)
  const [exporting, setExporting] = useState(false)

  const totalItemsTotal      = MOCK_EARNINGS.reduce((s, r) => s + r.items_total, 0)
  const totalCommission      = MOCK_EARNINGS.reduce((s, r) => s + r.commission_amount, 0)
  const totalNetEarned       = MOCK_EARNINGS.reduce((s, r) => s + r.net_earned, 0)

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return MOCK_EARNINGS.slice(start, start + PER_PAGE)
  }, [page])

  const totalPages = Math.ceil(MOCK_EARNINGS.length / PER_PAGE)

  async function handleExport() {
    setExporting(true)
    await new Promise((r) => setTimeout(r, 800))
    setExporting(false)
    // Mock CSV download
    const csv = [
      'Order #,Date,Items Total,Commission,Net Earned,Status',
      ...MOCK_EARNINGS.map((r) =>
        `${r.order_number},${r.date},${gbp(r.items_total)},${gbp(r.commission_amount)},${gbp(r.net_earned)},${r.payout_status}`
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `afrocart-earnings-${from || 'all'}-${to || 'all'}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Earnings exported')
  }

  const PAYOUT_STATUS_CLS: Record<string, string> = {
    pending:    'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    paid:       'bg-green-100 text-green-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-lg font-semibold text-[#1A1814] tracking-tight">Earnings</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#9C968E]">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="py-2 px-3 text-sm bg-white border border-[#E4E0D5] rounded-lg focus:outline-none focus:border-gold text-text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#9C968E]">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="py-2 px-3 text-sm bg-white border border-[#E4E0D5] rounded-lg focus:outline-none focus:border-gold text-text-primary" />
          </div>
          <Button variant="primary" size="sm">Apply</Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            loading={exporting}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EFECE5] rounded-xl border border-[#E4E0D5] p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-[#9C968E] font-medium">Total Earnings</p>
            <TrendingUp size={20} className="text-[#B8962E] opacity-70" />
          </div>
          <p className="text-3xl font-semibold text-[#1A1814] tracking-tight">{gbp(totalItemsTotal)}</p>
          <p className="text-xs text-[#9C968E] mt-2">Items revenue before commission</p>
        </div>

        <div className="bg-[#E8D5A3]/30 rounded-xl border border-[#E4E0D5] p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-[#9C968E] font-medium">AfroCart Commission (20%)</p>
            <Percent size={20} className="text-[#B8962E] opacity-70" />
          </div>
          <p className="text-3xl font-semibold text-[#1A1814] tracking-tight">{gbp(totalCommission)}</p>
          <p className="text-xs text-[#9C968E] mt-2">Deducted automatically</p>
        </div>

        <div className="bg-green-50 rounded-xl border border-[#E4E0D5] p-6">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-[#9C968E] font-medium">Net Payout</p>
            <Wallet size={20} className="text-[#2E7D52] opacity-70" />
          </div>
          <p className="text-3xl font-semibold text-[#1A1814] tracking-tight">{gbp(totalNetEarned)}</p>
          <p className="text-xs text-[#9C968E] mt-2">Your take-home earnings</p>
        </div>
      </div>

      {/* Chart + Payout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Chart */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-[#E4E0D5] p-6">
          <h3 className="text-sm font-semibold text-[#1A1814] mb-5">Daily Earnings — Last 30 Days</h3>
          <EarningsLineChart data={MOCK_DAILY} />
        </div>

        {/* Payout info */}
        <div className="xl:col-span-2 bg-[#EFECE5] rounded-xl border border-[#E4E0D5] p-6 space-y-5">
          <h3 className="text-sm font-semibold text-[#1A1814]">Payout Information</h3>

          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-[#B8962E] flex-shrink-0" />
            <div>
              <p className="text-xs text-[#9C968E]">Next payout date</p>
              <p className="text-sm font-semibold text-[#1A1814]">
                {formatDate(MOCK_PAYOUT.next_payout_date)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-[#9C968E] mb-1">Pending payout</p>
            <p className="text-2xl font-semibold text-[#B8962E]">{gbp(MOCK_PAYOUT.pending_amount)}</p>
          </div>

          <div>
            <p className="text-xs text-[#9C968E] mb-1">Payout to:</p>
            <p className="text-sm font-medium text-[#1A1814]">{MOCK_PAYOUT.bank_name}</p>
            <p className="text-xs text-[#5C5750]">{MOCK_PAYOUT.bank_account_masked}</p>
            <button className="text-xs text-[#B8962E] hover:underline mt-1">
              Update Bank Details
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
              Scheduled
            </span>
          </div>

          <div className="border-t border-[#E4E0D5] pt-4">
            <p className="text-xs text-[#9C968E]">Your commission rate: <span className="font-semibold">20%</span></p>
            <p className="text-xs text-[#9C968E] mt-0.5">Set by AfroCart. Contact us to discuss.</p>
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white rounded-xl border border-[#E4E0D5] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E0D5]">
          <h3 className="text-sm font-semibold text-[#1A1814]">Earnings Breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E0D5] bg-[#F7F5F0]">
              {['Order #', 'Date', 'Items Total', 'Commission', 'Net Earned', 'Status'].map((h) => (
                <th key={h} className="py-3 px-5 text-left text-xs uppercase tracking-wider text-[#9C968E] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((record) => (
              <tr key={record.id} className="border-b border-[#E4E0D5] last:border-0 hover:bg-[#F7F5F0] transition-colors">
                <td className="py-3 px-5 font-mono text-xs text-[#B8962E] font-medium">{record.order_number}</td>
                <td className="py-3 px-5 text-[#5C5750] text-xs">{formatDate(record.date)}</td>
                <td className="py-3 px-5 text-[#1A1814]">{gbp(record.items_total)}</td>
                <td className="py-3 px-5 text-amber-700">{gbp(record.commission_amount)}</td>
                <td className="py-3 px-5 font-semibold text-[#2E7D52]">{gbp(record.net_earned)}</td>
                <td className="py-3 px-5">
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', PAYOUT_STATUS_CLS[record.payout_status] ?? 'bg-gray-100 text-gray-800')}>
                    {record.payout_status.charAt(0).toUpperCase() + record.payout_status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E4E0D5] flex items-center justify-between">
            <p className="text-xs text-[#9C968E]">
              Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, MOCK_EARNINGS.length)} of {MOCK_EARNINGS.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
