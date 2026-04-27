'use client'

import { useState } from 'react'
import { Search, Download, AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VendorTable } from '@/components/admin/VendorTable'
import { useGetVendorsQuery } from '@/store/api/adminApi'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

export default function VendorsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const { data: vendors, isLoading, isError, refetch } = useGetVendorsQuery({ status: filter === 'all' ? 'all' : filter })

  const { data: pendingData } = useGetVendorsQuery({ status: 'pending' })
  const pendingCount = pendingData?.length ?? 0

  const filtered = vendors?.filter((v) =>
    !search ||
    v.business_name.toLowerCase().includes(search.toLowerCase()) ||
    v.owner_name.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const tabs: { label: string; value: Filter; count?: number }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending', count: pendingCount },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ]

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle size={40} className="text-danger" />
        <p className="text-text-secondary">Failed to load vendors</p>
        <Button variant="outline" onClick={() => refetch()} icon={<RefreshCcw size={14} />}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Filter Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-surface-dark p-1">
          {tabs.map((tab) => (
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
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                  filter === tab.value ? 'bg-white/20 text-white' : 'bg-gold/10 text-gold'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Export */}
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-white border border-surface-dark rounded-lg w-52 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary placeholder:text-text-muted"
            />
          </div>
          <Button variant="outline" size="md" icon={<Download size={14} />}>
            Export
          </Button>
        </div>
      </div>

      <VendorTable vendors={filtered} loading={isLoading} />
    </div>
  )
}
