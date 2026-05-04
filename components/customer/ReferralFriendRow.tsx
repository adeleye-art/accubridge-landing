'use client'

import { cn } from '@/lib/utils'

interface ReferralFriend {
  name: string
  orders_completed: number
  reward_status: 'pending' | 'paid'
  joined_at: string
}

interface ReferralFriendRowProps {
  friend: ReferralFriend
}

export function ReferralFriendRow({ friend }: ReferralFriendRowProps) {
  const pct      = Math.min(100, (friend.orders_completed / 2) * 100)
  const done     = friend.orders_completed >= 2
  const initials = friend.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#E4E0D5] last:border-0">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#B8962E]/20 flex items-center justify-center text-sm font-bold text-[#B8962E] flex-shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1A1814] text-sm">{friend.name}</p>
        <div className="flex items-center gap-2 mt-1">
          {/* Progress bar */}
          <div className="flex-1 h-1.5 bg-[#E4E0D5] rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', done ? 'bg-[#2E7D52]' : 'bg-amber-400')}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-[#9C968E] flex-shrink-0">
            {done
              ? '2/2 orders ✅ · Reward Paid!'
              : friend.orders_completed === 1
              ? '1/2 orders · Halfway there!'
              : 'Signed up · 0/2 orders'}
          </p>
        </div>
      </div>

      {/* Badge */}
      <span className={cn(
        'text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0',
        done ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
      )}>
        {friend.reward_status === 'paid' ? 'Paid' : 'Pending'}
      </span>
    </div>
  )
}
