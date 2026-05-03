'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  defs,
  linearGradient,
  stop,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface ChartPoint {
  date: string
  amount: number // pence
}

interface EarningsLineChartProps {
  data: ChartPoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E4E0D5] rounded-lg shadow px-3 py-2 text-xs">
      <p className="text-text-muted mb-0.5">{label}</p>
      <p className="font-semibold text-[#1A1814]">
        £{(payload[0].value / 100).toFixed(2)}
      </p>
    </div>
  )
}

export function EarningsLineChart({ data }: EarningsLineChartProps) {
  const chartData = data.map((d) => ({
    date: (() => { try { return format(parseISO(d.date), 'dd MMM') } catch { return d.date } })(),
    amount: d.amount,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B8962E" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#B8962E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#9C968E' }}
          tickLine={false}
          axisLine={false}
          interval={Math.floor(data.length / 7)}
        />
        <YAxis
          tickFormatter={(v) => `£${(v / 100).toFixed(0)}`}
          tick={{ fontSize: 10, fill: '#9C968E' }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#B8962E"
          strokeWidth={2}
          fill="url(#earningsGrad)"
          dot={{ fill: '#B8962E', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#B8962E' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
