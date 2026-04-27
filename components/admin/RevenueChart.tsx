'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface DailyOrder {
  date: string
  count: number
}

interface RevenueSplit {
  vendor: number
  platform: number
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
}

export function OrdersBarChart({ data }: { data: DailyOrder[] }) {
  const formatted = data.map((d) => ({ ...d, label: formatDay(d.date) }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Orders Per Day — Last 7 Days</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9C968E' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9C968E' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#EFECE5',
              border: '1px solid #E4E0D5',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            cursor={{ fill: '#E8D5A3', opacity: 0.3 }}
          />
          <Bar dataKey="count" fill="#B8962E" radius={[4, 4, 0, 0]} name="Orders" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function RevenuePieChart({ data }: { data: RevenueSplit }) {
  const chartData = [
    { name: 'Vendor', value: data.vendor, color: '#B8962E' },
    { name: 'AfroCart', value: data.platform, color: '#1E1B16' },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Revenue Split</CardTitle>
        <span className="text-xs text-text-muted">Today</span>
      </CardHeader>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value ?? 0)), '']}
            contentStyle={{
              background: '#EFECE5',
              border: '1px solid #E4E0D5',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, entry: any) => (
              <span className="text-xs text-text-secondary">
                {value} {entry?.payload?.value != null ? formatCurrency(entry.payload.value) : ''}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
