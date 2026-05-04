'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { RestaurantCard } from '@/components/customer/RestaurantCard'
import { GroceryStoreCard } from '@/components/customer/GroceryStoreCard'
import type { Restaurant, GroceryStore } from '@/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RESTAURANTS: Restaurant[] = [
  { id: 'r1', business_name: "Mama's Kitchen",    business_type: 'restaurant', address: '12 Peckham Rd, London SE15',      rating: 4.8, total_reviews: 312, delivery_time_min: 25, delivery_time_max: 35, delivery_fee: 199, min_order: 1000, is_open: true,  cuisine_tags: ['Nigerian', 'West African'] },
  { id: 'r2', business_name: 'Jerk Palace',       business_type: 'restaurant', address: '45 Brixton Hill, London SW2',     rating: 4.5, total_reviews: 186, delivery_time_min: 30, delivery_time_max: 45, delivery_fee: 149, min_order: 1500, is_open: true,  cuisine_tags: ['Caribbean', 'Jamaican'] },
  { id: 'r3', business_name: 'Suya Spot',         business_type: 'restaurant', address: '8 Elephant Rd, London SE1',      rating: 4.7, total_reviews: 204, delivery_time_min: 20, delivery_time_max: 30, delivery_fee: 0,   min_order: 1200, is_open: true,  cuisine_tags: ['Nigerian', 'Grills'] },
  { id: 'r4', business_name: 'Habesha House',     business_type: 'restaurant', address: '33 Lewisham Way, London SE4',    rating: 4.6, total_reviews: 143, delivery_time_min: 35, delivery_time_max: 50, delivery_fee: 199, min_order: 1000, is_open: false, cuisine_tags: ['Ethiopian', 'East African'] },
  { id: 'r5', business_name: 'Fufu Palace',       business_type: 'restaurant', address: '19 Old Kent Rd, London SE1',     rating: 4.4, total_reviews: 97,  delivery_time_min: 30, delivery_time_max: 40, delivery_fee: 99,  min_order: 800,  is_open: true,  cuisine_tags: ['Ghanaian', 'West African'] },
  { id: 'r6', business_name: 'Somali Kitchen',    business_type: 'restaurant', address: '55 Camberwell Rd, London SE5',   rating: 4.3, total_reviews: 78,  delivery_time_min: 25, delivery_time_max: 35, delivery_fee: 149, min_order: 1000, is_open: true,  cuisine_tags: ['Somali', 'East African'] },
]

const MOCK_STORES: GroceryStore[] = [
  { id: 's1', business_name: 'Abuja Spice Store',     business_type: 'store', address: '78 Rye Lane, London SE15',        rating: 4.7, delivery_time_min: 30, delivery_time_max: 45, delivery_fee: 249, min_order: 1500, is_open: true,  category_tags: ['Spices', 'Seasonings', 'Dried Goods'] },
  { id: 's2', business_name: 'Caribbean Grocery Hub', business_type: 'store', address: '22 Atlantic Rd, London SW9',      rating: 4.5, delivery_time_min: 25, delivery_time_max: 40, delivery_fee: 199, min_order: 1000, is_open: true,  category_tags: ['Produce', 'Drinks', 'Snacks'] },
  { id: 's3', business_name: 'Lagos Food Mart',       business_type: 'store', address: '61 Coldharbour Ln, London SE5',  rating: 4.6, delivery_time_min: 35, delivery_time_max: 50, delivery_fee: 149, min_order: 2000, is_open: true,  category_tags: ['Rice', 'Grains', 'Frozen'] },
  { id: 's4', business_name: 'Accra Fresh Market',   business_type: 'store', address: '14 Denmark Hill, London SE5',    rating: 4.4, delivery_time_min: 20, delivery_time_max: 30, delivery_fee: 0,   min_order: 1500, is_open: false, category_tags: ['Vegetables', 'Meat & Fish', 'Household'] },
]

export default function CustomerHomePage() {
  const [promoDismissed, setPromoDismissed] = useState(false)

  return (
    <div className="pb-20">
      {/* Hero */}
      <div className="relative h-64 bg-[#1E1B16] overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#B8962E 0,#B8962E 1px,transparent 0,transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 flex items-center h-full px-8 gap-8">
          <div className="flex-1">
            <h1 className="font-bold text-[#C9A84C] leading-tight" style={{ fontSize: '2.2rem', fontFamily: 'Georgia, serif' }}>
              Taste of Home,<br />Delivered
            </h1>
            <p className="text-[#9C968E] mt-2 max-w-md text-sm leading-relaxed">
              African &amp; Caribbean food, groceries and more — delivered to your door
            </p>
            <div className="flex gap-3 mt-6">
              <Link href="/afrocart/customer/eats"   className="px-5 py-2.5 bg-[#B8962E] text-white rounded-xl font-semibold text-sm hover:bg-[#A07828] transition-colors">Order Food 🍛</Link>
              <Link href="/afrocart/customer/market" className="px-5 py-2.5 border-2 border-[#B8962E] text-[#C9A84C] rounded-xl font-semibold text-sm hover:bg-[#B8962E]/10 transition-colors">Shop Groceries 🛒</Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center relative w-56 h-48">
            <div className="absolute top-2  left-6  w-28 h-28 rounded-full bg-[#E4E0D5]/20 flex items-center justify-center text-5xl border-2 border-[#B8962E]/30">🍛</div>
            <div className="absolute top-12 left-20 w-28 h-28 rounded-full bg-[#E4E0D5]/20 flex items-center justify-center text-5xl border-2 border-[#B8962E]/30">🥘</div>
            <div className="absolute bottom-0 left-12 w-28 h-28 rounded-full bg-[#E4E0D5]/20 flex items-center justify-center text-5xl border-2 border-[#B8962E]/30">🌶️</div>
          </div>
        </div>
      </div>

      {/* Promo banner */}
      {!promoDismissed && (
        <div className="bg-gradient-to-r from-[#B8962E] to-[#C9A84C] px-8 py-3 flex items-center justify-between">
          <p className="text-white font-medium text-sm">🎉 Free delivery on your first order — Use code: <strong>AFRO-FIRST</strong></p>
          <button onClick={() => setPromoDismissed(true)} className="text-white/70 hover:text-white transition-colors ml-4"><X size={16} /></button>
        </div>
      )}

      <div className="px-8 py-8 space-y-12">
        {/* Eats */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#1A1814]">AfroCart Eats 🍛</h2>
            <Link href="/afrocart/customer/eats" className="text-sm text-[#B8962E] hover:underline">See all →</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2">
            {MOCK_RESTAURANTS.map((r) => <RestaurantCard key={r.id} restaurant={r} size="sm" />)}
          </div>
        </section>

        {/* Market */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-[#1A1814]">AfroCart Market 🛒</h2>
            <Link href="/afrocart/customer/market" className="text-sm text-[#B8962E] hover:underline">See all →</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2">
            {MOCK_STORES.map((s) => <GroceryStoreCard key={s.id} store={s} size="sm" />)}
          </div>
        </section>

        {/* Promotions */}
        <section>
          <h2 className="text-xl font-semibold text-[#1A1814] mb-5">Promotions 🔥</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1E1B16] rounded-2xl p-8 flex flex-col justify-between min-h-[160px]">
              <p className="text-[#C9A84C] text-xl font-bold leading-snug">20% off your first grocery order</p>
              <Link href="/afrocart/customer/market" className="inline-block mt-4 px-5 py-2 bg-[#B8962E] text-white rounded-lg text-sm font-semibold hover:bg-[#A07828] transition-colors self-start">Shop Now</Link>
            </div>
            <div className="bg-[#B8962E] rounded-2xl p-8 flex flex-col justify-between min-h-[160px]">
              <p className="text-white text-xl font-bold leading-snug">Refer a friend, earn £5 credit</p>
              <Link href="/afrocart/customer/account?tab=referral" className="inline-block mt-4 px-5 py-2 bg-white text-[#B8962E] rounded-lg text-sm font-semibold hover:bg-[#EFECE5] transition-colors self-start">Invite Friends</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
