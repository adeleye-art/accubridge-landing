'use client'

import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import type { WalletTransaction } from '@/types'

interface TransactionRowProps {
  tx: WalletTransaction
}

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

function formatDate(iso: string) {
  try { return format(parseISO(iso), 'dd MMM yyyy') } catch { return iso }
}

export function TransactionRow({ tx }: TransactionRowProps) {
  const isEarned   = tx.type === 'earned' || tx.type === 'refunded'
  const Icon       = tx.type === 'earned' ? TrendingUp : tx.type === 'refunded' ? RefreshCw : TrendingDown
  const iconBg     = isEarned ? 'bg-green-100' : 'bg-red-50'
  const iconColor  = isEarned ? 'text-[#2E7D52]' : 'text-[#C0392B]'
  const amountText = isEarned ? `+${gbp(tx.amount)}` : `-${gbp(tx.amount)}`

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#E4E0D5] last:border-0">
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon size={15} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#1A1814] font-medium truncate">{tx.reason}</p>
        <p className="text-xs text-[#9C968E]">{formatDate(tx.created_at)}</p>
      </div>
      <p className={cn('font-semibold text-sm flex-shrink-0', isEarned ? 'text-[#2E7D52]' : 'text-[#C0392B]')}>
        {amountText}
      </p>
    </div>
  )
}
