'use client'

import { Star, Package, TrendingUp, Award } from 'lucide-react'
import type { DriverEarningsSummary } from '@/types'

interface DriverProfileCardProps {
  name: string
  phone: string
  vehiclePlate: string
  rating: number
  totalDeliveries: number
  memberSince: string
  stats: DriverEarningsSummary
}

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  } catch { return iso }
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= Math.round(value) ? 'text-[#B8962E] fill-[#B8962E]' : 'text-[#E4E0D5]'}
        />
      ))}
      <span className="text-sm font-semibold text-[#1A1814] ml-1">{value.toFixed(1)}</span>
    </div>
  )
}

export function DriverProfileCard({
  name,
  phone,
  vehiclePlate,
  rating,
  totalDeliveries,
  memberSince,
  stats,
}: DriverProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E4E0D5] overflow-hidden">
      {/* Avatar banner */}
      <div className="h-20 bg-gradient-to-br from-[#B8962E] to-[#8A6F22]" />
      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="-mt-10 mb-3">
          <div className="w-20 h-20 rounded-full bg-[#1E1B16] border-4 border-white flex items-center justify-center text-3xl font-bold text-[#B8962E]">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Name + rating */}
        <h2 className="text-lg font-bold text-[#1A1814]">{name}</h2>
        <StarRating value={rating} />

        {/* Info rows */}
        <div className="mt-3 space-y-1 text-sm text-[#5C5750]">
          <p>📱 {phone}</p>
          <p>🚗 {vehiclePlate}</p>
          <p className="text-xs text-[#9C968E]">Member since {formatDate(memberSince)}</p>
        </div>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-[#F7F5F0] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package size={13} className="text-[#B8962E]" />
              <span className="text-xs text-[#9C968E]">Total Deliveries</span>
            </div>
            <p className="text-xl font-bold text-[#1A1814]">{totalDeliveries}</p>
          </div>
          <div className="bg-[#F7F5F0] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-[#2E7D52]" />
              <span className="text-xs text-[#9C968E]">This Week</span>
            </div>
            <p className="text-xl font-bold text-[#1A1814]">{gbp(stats.this_week)}</p>
          </div>
          <div className="bg-[#F7F5F0] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award size={13} className="text-[#2C5F8A]" />
              <span className="text-xs text-[#9C968E]">This Month</span>
            </div>
            <p className="text-xl font-bold text-[#1A1814]">{gbp(stats.this_month)}</p>
          </div>
          <div className="bg-[#F7F5F0] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-[#B8962E]" />
              <span className="text-xs text-[#9C968E]">All Time</span>
            </div>
            <p className="text-xl font-bold text-[#1A1814]">{gbp(stats.all_time)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
