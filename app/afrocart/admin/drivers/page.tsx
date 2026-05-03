'use client'

import { useState } from 'react'
import { Users, Wifi, Truck, Clock } from 'lucide-react'
import { KpiCard } from '@/components/admin/KpiCard'
import { DriverGrid } from '@/components/admin/DriverGrid'
import { DriverDetailPanel } from '@/components/admin/DriverDetailPanel'
import { cn } from '@/lib/utils'
import type { Driver, DriverApprovalStatus } from '@/types'

type Filter = 'all' | DriverApprovalStatus

const TABS: { label: string; value: Filter }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Approved',  value: 'approved' },
  { label: 'Rejected',  value: 'rejected' },
  { label: 'Suspended', value: 'suspended' },
]

const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1', name: 'Kofi Mensah', email: 'kofi@driver.com', phone: '+447700900010',
    status: 'online', approval_status: 'approved', vehicle_type: 'motorcycle',
    vehicle_plate: 'LB21 KMX', documents: [], dbs_check_acknowledged: true,
    active_deliveries: 2, total_completed: 184, rating: 4.8, earnings_today: 6200,
    created_at: '2026-01-05T09:00:00Z',
  },
  {
    id: 'd2', name: 'Ade Bello', email: 'ade@driver.com', phone: '+447700900011',
    status: 'online', approval_status: 'approved', vehicle_type: 'bicycle',
    vehicle_plate: undefined, documents: [], dbs_check_acknowledged: true,
    active_deliveries: 1, total_completed: 97, rating: 4.6, earnings_today: 3800,
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'd3', name: 'Emeka Nwosu', email: 'emeka@driver.com', phone: '+447700900012',
    status: 'offline', approval_status: 'approved', vehicle_type: 'car',
    vehicle_plate: 'SW19 ENW', documents: [], dbs_check_acknowledged: true,
    active_deliveries: 0, total_completed: 312, rating: 4.9, earnings_today: 0,
    created_at: '2025-11-20T08:00:00Z',
  },
  {
    id: 'd4', name: 'Seun Falola', email: 'seun@driver.com', phone: '+447700900013',
    status: 'offline', approval_status: 'pending', vehicle_type: 'moped',
    vehicle_plate: 'SE15 SFX', documents: [], dbs_check_acknowledged: true,
    active_deliveries: 0, total_completed: 0, rating: 0, earnings_today: 0,
    created_at: '2026-04-29T14:00:00Z',
  },
  {
    id: 'd5', name: 'Tunde Bakare', email: 'tunde@driver.com', phone: '+447700900014',
    status: 'offline', approval_status: 'pending', vehicle_type: 'bicycle',
    vehicle_plate: undefined, documents: [], dbs_check_acknowledged: true,
    active_deliveries: 0, total_completed: 0, rating: 0, earnings_today: 0,
    created_at: '2026-04-30T09:30:00Z',
  },
  {
    id: 'd6', name: 'Abayomi Ojo', email: 'abayomi@driver.com', phone: '+447700900015',
    status: 'offline', approval_status: 'pending', vehicle_type: 'van',
    vehicle_plate: 'N17 AOJ', documents: [], dbs_check_acknowledged: true,
    active_deliveries: 0, total_completed: 0, rating: 0, earnings_today: 0,
    created_at: '2026-05-01T08:00:00Z',
  },
  {
    id: 'd7', name: 'Chukwudi Obi', email: 'chukwudi@driver.com', phone: '+447700900016',
    status: 'offline', approval_status: 'rejected', vehicle_type: 'moped',
    vehicle_plate: 'E8 COB', documents: [], dbs_check_acknowledged: false,
    active_deliveries: 0, total_completed: 0, rating: 0, earnings_today: 0,
    rejection_reason: 'Incomplete DBS documentation',
    created_at: '2026-03-10T11:00:00Z',
  },
  {
    id: 'd8', name: 'Grace Osei', email: 'grace@driver.com', phone: '+447700900017',
    status: 'online', approval_status: 'approved', vehicle_type: 'car',
    vehicle_plate: 'SE4 GOX', documents: [], dbs_check_acknowledged: true,
    active_deliveries: 1, total_completed: 56, rating: 4.7, earnings_today: 2800,
    created_at: '2026-02-18T10:00:00Z',
  },
]

export default function DriversPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  const pendingCount = MOCK_DRIVERS.filter((d) => d.approval_status === 'pending').length
  const filtered = filter === 'all' ? MOCK_DRIVERS : MOCK_DRIVERS.filter((d) => d.approval_status === filter)

  const onlineNow       = MOCK_DRIVERS.filter((d) => d.approval_status === 'approved' && d.status === 'online').length
  const activeDeliveries = MOCK_DRIVERS.reduce((sum, d) => sum + d.active_deliveries, 0)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Drivers" value={MOCK_DRIVERS.length} icon={<Users size={20} />} />
        <div
          className="bg-[#EFECE5] rounded-xl border border-surface-dark p-6 cursor-pointer"
          onClick={() => setFilter('pending')}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-text-muted font-medium">Pending Approval</p>
            <Clock size={20} className={pendingCount > 0 ? 'text-amber-600 opacity-70' : 'text-text-muted opacity-70'} />
          </div>
          <p className={`text-3xl font-semibold tracking-tight ${pendingCount > 0 ? 'text-amber-700' : 'text-text-primary'}`}>
            {pendingCount}
          </p>
          <p className="text-xs text-text-muted mt-2">Awaiting review</p>
        </div>
        <KpiCard label="Online Now"         value={onlineNow}       subLabel="Available for jobs" icon={<Wifi size={20} />} />
        <KpiCard label="Active Deliveries"  value={activeDeliveries}                              icon={<Truck size={20} />} />
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
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                filter === tab.value ? 'bg-white/20 text-white' : 'bg-gold/10 text-gold'
              )}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <DriverGrid drivers={filtered} onDriverClick={setSelectedDriver} />

      <DriverDetailPanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
    </div>
  )
}
