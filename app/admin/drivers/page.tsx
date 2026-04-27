'use client'

import { useState } from 'react'
import { Users, Wifi, Truck, Clock, AlertCircle, RefreshCcw } from 'lucide-react'
import { KpiCard } from '@/components/admin/KpiCard'
import { DriverGrid } from '@/components/admin/DriverGrid'
import { DriverDetailPanel } from '@/components/admin/DriverDetailPanel'
import { Button } from '@/components/ui/Button'
import { useGetDriversQuery } from '@/store/api/adminApi'
import { cn } from '@/lib/utils'
import type { Driver, DriverApprovalStatus } from '@/types'

type Filter = 'all' | DriverApprovalStatus

const TABS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
]

export default function DriversPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  const {
    data: drivers,
    isLoading,
    isError,
    refetch,
  } = useGetDriversQuery(filter === 'all' ? {} : { approval_status: filter })

  const { data: pendingDrivers } = useGetDriversQuery({ approval_status: 'pending' })
  const pendingCount = pendingDrivers?.length ?? 0

  const totalDrivers = drivers?.length ?? 0
  const onlineNow = drivers?.filter((d) => d.approval_status === 'approved' && d.status === 'online').length ?? 0
  const activeDeliveries = drivers?.reduce((sum, d) => sum + d.active_deliveries, 0) ?? 0

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={40} className="text-danger" />
        <p className="text-text-secondary">Failed to load drivers</p>
        <Button variant="outline" onClick={() => refetch()} icon={<RefreshCcw size={14} />}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-surface-dark p-6 h-32 animate-pulse"
            />
          ))
        ) : (
          <>
            <KpiCard label="Total Drivers" value={totalDrivers} icon={<Users size={20} />} />
            <div
              className="bg-[#EFECE5] rounded-xl border border-surface-dark p-6 cursor-pointer"
              onClick={() => setFilter('pending')}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs uppercase tracking-widest text-text-muted font-medium">
                  Pending Approval
                </p>
                <div className="opacity-70">
                  <Clock size={20} className={pendingCount > 0 ? 'text-amber-600' : 'text-text-muted'} />
                </div>
              </div>
              <p
                className={`text-3xl font-semibold tracking-tight ${
                  pendingCount > 0 ? 'text-amber-700' : 'text-text-primary'
                }`}
              >
                {pendingCount}
              </p>
              <p className="text-xs text-text-muted mt-2">Awaiting review</p>
            </div>
            <KpiCard
              label="Online Now"
              value={onlineNow}
              subLabel="Available for jobs"
              icon={<Wifi size={20} />}
            />
            <KpiCard
              label="Active Deliveries"
              value={activeDeliveries}
              icon={<Truck size={20} />}
            />
          </>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-surface-dark p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === tab.value
                ? 'bg-gold text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-background'
            )}
          >
            {tab.label}
            {tab.value === 'pending' && pendingCount > 0 && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                  filter === tab.value ? 'bg-white/20 text-white' : 'bg-gold/10 text-gold'
                )}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Driver Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-surface-dark p-5 h-48 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <DriverGrid
          drivers={drivers ?? []}
          onDriverClick={setSelectedDriver}
        />
      )}

      {/* Detail Panel */}
      <DriverDetailPanel
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
      />
    </div>
  )
}
