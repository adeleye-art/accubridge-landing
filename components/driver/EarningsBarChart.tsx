'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import type { DriverEarningsSummary } from '@/types'

interface EarningsBarChartProps {
  data: DriverEarningsSummary['daily_earnings']
  showDeliveries?: boolean
}

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function formatDay(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short' })
  } catch { return dateStr }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const earnings   = payload.find((p) => p.name === 'earnings')
  const deliveries = payload.find((p) => p.name === 'deliveries')
  return (
    <div className="bg-white border border-[#E4E0D5] rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-[#1A1814] mb-1">{label}</p>
      {earnings   && <p className="text-[#B8962E]">{gbp(earnings.value)}</p>}
      {deliveries && <p className="text-[#9C968E]">{deliveries.value} deliveries</p>}
    </div>
  )
}

export function EarningsBarChart({ data, showDeliveries = false }: EarningsBarChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    day:      formatDay(d.date),
    earnings: d.amount,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9C968E' }} axisLine={false} tickLine={false} />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11, fill: '#9C968E' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `£${(v / 100).toFixed(0)}`}
          width={36}
        />
        {showDeliveries && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#9C968E' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Bar yAxisId="left" dataKey="earnings" name="earnings" fill="#B8962E" radius={[4, 4, 0, 0]} maxBarSize={36} />
        {showDeliveries && (
          <Bar yAxisId="right" dataKey="deliveries" name="deliveries" fill="#E8D5A3" radius={[4, 4, 0, 0]} maxBarSize={20} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
