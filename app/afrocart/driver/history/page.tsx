'use client'

import { useState } from 'react'
import { DriverTopbar } from '@/components/driver/DriverTopbar'
import { DeliveryHistoryRow } from '@/components/driver/DeliveryHistoryRow'
import { DeliveryDetailModal } from '@/components/driver/DeliveryDetailModal'
import { Search } from 'lucide-react'
import type { CompletedDelivery } from '@/types'

const MOCK_HISTORY: CompletedDelivery[] = [
  {
    id: 'cd_001',
    order_number: 'AC-0088',
    type: 'food',
    pickup_name: 'Jollof House',
    pickup_address: '14 Market St, London SE1',
    dropoff_address: '72 Brixton Rd, London SW9',
    customer_first_name: 'Amara',
    item_summary: '2× Jollof Rice, 1× Plantain',
    earnings: 720,
    payout_status: 'paid',
    accepted_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 24 * 3600000 + 22 * 60000).toISOString(),
    distance_miles: 1.8,
    duration_minutes: 24,
    rating: 5,
  },
  {
    id: 'cd_002',
    order_number: 'AC-0085',
    type: 'grocery',
    pickup_name: 'Peckham Superstore',
    pickup_address: '3 Rye Lane, Peckham SE15',
    dropoff_address: '18 Forest Hill Rd, London SE23',
    customer_first_name: 'Kofi',
    item_summary: 'Weekly grocery shop',
    earnings: 960,
    payout_status: 'paid',
    accepted_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 24 * 3600000 + 30 * 60000).toISOString(),
    distance_miles: 2.4,
    duration_minutes: 31,
    rating: 4,
  },
  {
    id: 'cd_003',
    order_number: 'AC-0082',
    type: 'delivery',
    pickup_name: 'AfroCart Hub — Clapham',
    pickup_address: '9 Clapham High St, London SW4',
    dropoff_address: '44 Stockwell Park Rd, London SW9',
    customer_first_name: 'Yemi',
    item_summary: 'Package delivery',
    earnings: 480,
    payout_status: 'processing',
    accepted_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 4 * 24 * 3600000 + 16 * 60000).toISOString(),
    distance_miles: 0.9,
    duration_minutes: 17,
    rating: 5,
  },
  {
    id: 'cd_004',
    order_number: 'AC-0079',
    type: 'food',
    pickup_name: 'Suya Spot',
    pickup_address: '22 Old Kent Rd, London SE1',
    dropoff_address: '61 New Cross Rd, London SE14',
    customer_first_name: 'Ngozi',
    item_summary: '3× Suya Platter, 2× Zobo Drink',
    earnings: 1120,
    payout_status: 'pending',
    accepted_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 5 * 24 * 3600000 + 38 * 60000).toISOString(),
    distance_miles: 3.1,
    duration_minutes: 39,
    rating: 4,
    customer_note: 'Thanks for the quick delivery!',
  },
  {
    id: 'cd_005',
    order_number: 'AC-0075',
    type: 'food',
    pickup_name: "Mama's Kitchen",
    pickup_address: '8 Coldharbour Lane, London SE5',
    dropoff_address: '33 Denmark Hill, London SE5',
    customer_first_name: 'Funmi',
    item_summary: '1× Egusi Soup, 1× Pounded Yam',
    earnings: 580,
    payout_status: 'paid',
    accepted_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    completed_at: new Date(Date.now() - 7 * 24 * 3600000 + 19 * 60000).toISOString(),
    distance_miles: 1.2,
    duration_minutes: 20,
    rating: 5,
  },
]

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

export default function DriverHistoryPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<CompletedDelivery | null>(null)

  const filtered = MOCK_HISTORY.filter((d) => {
    const q = search.toLowerCase()
    return (
      d.order_number.toLowerCase().includes(q) ||
      d.pickup_name.toLowerCase().includes(q) ||
      d.customer_first_name.toLowerCase().includes(q)
    )
  })

  const totalEarnings = MOCK_HISTORY.reduce((sum, d) => sum + d.earnings, 0)

  return (
    <>
      <DriverTopbar title="Delivery History" />
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#E4E0D5] p-4 text-center">
              <p className="text-2xl font-bold text-[#1A1814]">{MOCK_HISTORY.length}</p>
              <p className="text-xs text-[#9C968E] mt-0.5">Deliveries</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E4E0D5] p-4 text-center">
              <p className="text-2xl font-bold text-[#B8962E]">{gbp(totalEarnings)}</p>
              <p className="text-xs text-[#9C968E] mt-0.5">Total Earned</p>
            </div>
            <div className="bg-white rounded-xl border border-[#E4E0D5] p-4 text-center">
              <p className="text-2xl font-bold text-[#1A1814]">4.6</p>
              <p className="text-xs text-[#9C968E] mt-0.5">Avg Rating</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C968E]" />
            <input
              type="text"
              placeholder="Search by order, restaurant or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E4E0D5] rounded-xl text-sm text-[#1A1814] placeholder:text-[#9C968E] focus:outline-none focus:border-[#B8962E]"
            />
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold text-[#1A1814]">No results found</p>
              <p className="text-sm text-[#9C968E] mt-1">Try a different search term</p>
            </div>
          ) : (
            <div>
              {filtered.map((d) => (
                <DeliveryHistoryRow key={d.id} delivery={d} onClick={setSelected} />
              ))}
            </div>
          )}

        </div>
      </main>

      {selected && (
        <DeliveryDetailModal delivery={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
