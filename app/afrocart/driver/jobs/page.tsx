'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { DriverTopbar } from '@/components/driver/DriverTopbar'
import { JobCard } from '@/components/driver/JobCard'
import { OfflineStateBanner } from '@/components/driver/OfflineStateBanner'
import { OnlineStatusToggle } from '@/components/driver/OnlineStatusToggle'
import { selectDriverIsOnline, selectHasActiveDelivery } from '@/store/driverSlice'
import { RefreshCw } from 'lucide-react'
import type { AvailableJob } from '@/types'

const MOCK_JOBS: AvailableJob[] = [
  {
    id: 'j1',
    order_number: 'AC-0091',
    type: 'food',
    pickup_name: 'Jollof House',
    pickup_address: '14 Market St, London SE1',
    dropoff_address: '72 Brixton Rd, London SW9',
    distance_miles: 1.8,
    estimated_minutes: 22,
    earnings: 720,
    item_summary: '2× Jollof Rice, 1× Plantain',
    customer_first_name: 'Amara',
    posted_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'j2',
    order_number: 'AC-0092',
    type: 'grocery',
    pickup_name: 'Peckham Superstore',
    pickup_address: '3 Rye Lane, Peckham SE15',
    dropoff_address: '18 Forest Hill Rd, London SE23',
    distance_miles: 2.4,
    estimated_minutes: 28,
    earnings: 960,
    item_summary: 'Weekly grocery shop — 12 items',
    customer_first_name: 'Kofi',
    posted_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'j3',
    order_number: 'AC-0093',
    type: 'delivery',
    pickup_name: 'AfroCart Hub — Clapham',
    pickup_address: '9 Clapham High St, London SW4',
    dropoff_address: '44 Stockwell Park Rd, London SW9',
    distance_miles: 0.9,
    estimated_minutes: 14,
    earnings: 480,
    item_summary: 'Package delivery',
    customer_first_name: 'Yemi',
    posted_at: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'j4',
    order_number: 'AC-0094',
    type: 'food',
    pickup_name: 'Suya Spot',
    pickup_address: '22 Old Kent Rd, London SE1',
    dropoff_address: '61 New Cross Rd, London SE14',
    distance_miles: 3.1,
    estimated_minutes: 35,
    earnings: 1120,
    item_summary: '3× Suya Platter, 2× Zobo Drink',
    customer_first_name: 'Ngozi',
    posted_at: new Date(Date.now() - 11 * 60000).toISOString(),
  },
]

type Filter = 'all' | 'food' | 'grocery' | 'delivery'

export default function DriverJobsPage() {
  const isOnline          = useSelector(selectDriverIsOnline)
  const hasActiveDelivery = useSelector(selectHasActiveDelivery)
  const [filter, setFilter] = useState<Filter>('all')
  const [refreshing, setRefreshing] = useState(false)

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',      label: 'All Jobs' },
    { key: 'food',     label: '🍛 Food'     },
    { key: 'grocery',  label: '🛒 Grocery'  },
    { key: 'delivery', label: '📦 Delivery' },
  ]

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise((r) => setTimeout(r, 800))
    setRefreshing(false)
  }

  const jobs = isOnline
    ? MOCK_JOBS.filter((j) => filter === 'all' || j.type === filter)
    : []

  return (
    <>
      <DriverTopbar title="Available Jobs" />
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Online toggle + refresh */}
          <div className="flex items-center justify-between">
            <OnlineStatusToggle hasActiveDelivery={hasActiveDelivery} size="sm" />
            {isOnline && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-sm text-[#9C968E] hover:text-[#5C5750] disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            )}
          </div>

          {/* Offline state */}
          {!isOnline && <OfflineStateBanner />}

          {/* Filters */}
          {isOnline && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
                    flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${filter === key
                      ? 'bg-[#1A1814] text-white'
                      : 'bg-white border border-[#E4E0D5] text-[#5C5750] hover:border-[#B8962E]/40'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Job cards */}
          {isOnline && (
            <>
              {jobs.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="font-semibold text-[#1A1814]">No jobs in this category</p>
                  <p className="text-sm text-[#9C968E] mt-1">Try another filter or check back soon</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[#9C968E] mb-3">
                    {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
                  </p>
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} size="sm" />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </>
  )
}
