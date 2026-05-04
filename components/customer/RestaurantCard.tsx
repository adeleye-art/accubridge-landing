'use client'

import Link from 'next/link'
import { Star, Clock, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Restaurant } from '@/types'

interface RestaurantCardProps {
  restaurant: Restaurant
  size?: 'sm' | 'lg'
}

function gbp(pence: number) {
  return `£${(pence / 100).toFixed(2)}`
}

export function RestaurantCard({ restaurant, size = 'sm' }: RestaurantCardProps) {
  return (
    <Link
      href={`/afrocart/customer/eats/${restaurant.id}`}
      className={cn(
        'block rounded-xl overflow-hidden border border-[#E4E0D5] bg-[#EFECE5]',
        'hover:shadow-md hover:scale-[1.02] transition-all duration-200',
        size === 'sm' ? 'w-64 flex-shrink-0' : 'w-full'
      )}
    >
      {/* Image */}
      <div className={cn('relative bg-[#E4E0D5]', size === 'sm' ? 'h-40' : 'h-48')}>
        {restaurant.banner_url ? (
          <img src={restaurant.banner_url} alt={restaurant.business_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍛</div>
        )}
        {/* Open/Closed pill */}
        <span className={cn(
          'absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full',
          restaurant.is_open
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-200 text-gray-600'
        )}>
          {restaurant.is_open ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="font-semibold text-[#1A1814] text-sm truncate">{restaurant.business_name}</p>
        <p className="text-xs text-[#9C968E] mt-0.5 truncate">{restaurant.cuisine_tags.join(' · ')}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star size={12} fill="#B8962E" stroke="none" />
          <span className="text-xs font-medium text-[#1A1814]">{restaurant.rating.toFixed(1)}</span>
          <span className="text-xs text-[#9C968E]">· {restaurant.total_reviews} reviews</span>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-3 mt-2 text-xs text-[#5C5750]">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {restaurant.delivery_time_min}–{restaurant.delivery_time_max} min
          </span>
          <span className="flex items-center gap-1">
            <Bike size={11} />
            {restaurant.delivery_fee === 0 ? 'Free delivery' : `${gbp(restaurant.delivery_fee)} delivery`}
          </span>
        </div>
      </div>
    </Link>
  )
}
