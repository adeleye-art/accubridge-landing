'use client'

import { useSelector, useDispatch } from 'react-redux'
import { DriverTopbar } from '@/components/driver/DriverTopbar'
import { OnlineStatusToggle } from '@/components/driver/OnlineStatusToggle'
import { OfflineStateBanner } from '@/components/driver/OfflineStateBanner'
import { JobCard } from '@/components/driver/JobCard'
import { EarningsBarChart } from '@/components/driver/EarningsBarChart'
import {
  selectDriverIsOnline,
  selectHasActiveDelivery,
} from '@/store/driverSlice'
import {
  useGetAvailableJobsQuery,
  useGetDriverStatsQuery,
} from '@/store/api/driverApi'
import { Navigation } from 'lucide-react'
import Link from 'next/link'
import type { AppDispatch } from '@/store'

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

const MOCK_STATS = {
  today: 4250,
  this_week: 22800,
  this_month: 89500,
  all_time: 412000,
  deliveries_today: 6,
  deliveries_week: 34,
  daily_earnings: [
    { date: '2026-04-28', amount: 3200, deliveries: 5 },
    { date: '2026-04-29', amount: 5100, deliveries: 8 },
    { date: '2026-04-30', amount: 2800, deliveries: 4 },
    { date: '2026-05-01', amount: 4100, deliveries: 6 },
    { date: '2026-05-02', amount: 3700, deliveries: 5 },
    { date: '2026-05-03', amount: 4250, deliveries: 6 },
    { date: '2026-05-04', amount: 0,    deliveries: 0 },
  ],
}

const MOCK_JOBS = [
  {
    id: 'j1',
    order_number: 'AC-0091',
    type: 'food' as const,
    pickup_name: 'Jollof House',
    pickup_address: '14 Market St, London',
    dropoff_address: '72 Brixton Rd, London',
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
    type: 'grocery' as const,
    pickup_name: 'Peckham Superstore',
    pickup_address: '3 Rye Lane, Peckham',
    dropoff_address: '18 Forest Hill Rd, London',
    distance_miles: 2.4,
    estimated_minutes: 28,
    earnings: 960,
    item_summary: 'Weekly grocery shop',
    customer_first_name: 'Kofi',
    posted_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
]

export default function DriverDashboardPage() {
  const dispatch          = useDispatch<AppDispatch>()
  const isOnline          = useSelector(selectDriverIsOnline)
  const hasActiveDelivery = useSelector(selectHasActiveDelivery)

  // In production these would poll from the API; use mock data for the portal
  const stats = MOCK_STATS
  const jobs  = isOnline ? MOCK_JOBS : []

  return (
    <>
      <DriverTopbar title="Dashboard" />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Online toggle row (mobile-style, visible above the sidebar on small screens) */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1A1814]">
                {isOnline ? 'You\'re Online' : 'You\'re Offline'}
              </h2>
              <p className="text-sm text-[#9C968E]">
                {isOnline
                  ? `${jobs.length} job${jobs.length !== 1 ? 's' : ''} nearby`
                  : 'Go online to start accepting jobs'}
              </p>
            </div>
            <OnlineStatusToggle hasActiveDelivery={hasActiveDelivery} size="sm" />
          </div>

          {/* Active delivery banner */}
          {hasActiveDelivery && (
            <Link
              href="/afrocart/driver/active"
              className="flex items-center gap-4 bg-[#2E7D52] text-white rounded-2xl p-4 hover:bg-green-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Navigation size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Active Delivery in Progress</p>
                <p className="text-sm text-white/80">Tap to view and update status</p>
              </div>
              <span className="text-2xl">→</span>
            </Link>
          )}

          {/* Offline banner */}
          {!isOnline && <OfflineStateBanner />}

          {/* Today's stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Today',      value: gbp(stats.today),      sub: `${stats.deliveries_today} deliveries`  },
              { label: 'This Week',  value: gbp(stats.this_week),  sub: `${stats.deliveries_week} deliveries`  },
              { label: 'This Month', value: gbp(stats.this_month), sub: 'month to date'                         },
              { label: 'All Time',   value: gbp(stats.all_time),   sub: 'lifetime earnings'                     },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#E4E0D5] p-4">
                <p className="text-xs text-[#9C968E] mb-1">{s.label}</p>
                <p className="text-xl font-bold text-[#B8962E]">{s.value}</p>
                <p className="text-xs text-[#9C968E] mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Earnings chart */}
          <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5">
            <h3 className="font-semibold text-[#1A1814] mb-4">7-Day Earnings</h3>
            <EarningsBarChart data={stats.daily_earnings} showDeliveries />
          </div>

          {/* Available jobs */}
          {isOnline && jobs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1A1814]">Nearby Jobs</h3>
                <Link
                  href="/afrocart/driver/jobs"
                  className="text-sm text-[#B8962E] hover:underline"
                >
                  View all
                </Link>
              </div>
              {jobs.slice(0, 2).map((job) => (
                <JobCard key={job.id} job={job} size="sm" />
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
