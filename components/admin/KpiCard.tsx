import * as React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  change?: number
  changeType?: 'up' | 'down'
  icon: React.ReactNode
  subLabel?: string
}

export function KpiCard({ label, value, change, changeType, icon, subLabel }: KpiCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-surface-dark p-6">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-text-muted font-medium">{label}</p>
        <div className="text-gold opacity-70">{icon}</div>
      </div>
      <p className="text-3xl font-semibold text-text-primary tracking-tight">{value}</p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {change !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              changeType === 'up' ? 'text-success' : 'text-danger'
            )}
          >
            {changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change}%
          </span>
        )}
        {subLabel && (
          <span className="text-xs text-text-muted">{subLabel}</span>
        )}
      </div>
    </div>
  )
}
