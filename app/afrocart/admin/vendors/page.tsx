'use client'

import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VendorTable } from '@/components/admin/VendorTable'
import { cn } from '@/lib/utils'
import type { Vendor } from '@/types'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

const MOCK_VENDORS: Vendor[] = [
  { id: 'v1', user_id: 'u1', business_name: "Mama's Kitchen",     business_type: 'restaurant', address: '12 Peckham Rd, London SE15',    status: 'approved',  commission_rate: 15, created_at: '2026-01-10T09:00:00Z', owner_name: 'Amara Okafor',  email: 'amara@mamaskitchen.co.uk',  phone: '+447700900001' },
  { id: 'v2', user_id: 'u2', business_name: 'Jerk Stop',           business_type: 'restaurant', address: '8 Brixton Hill, London SW2',     status: 'approved',  commission_rate: 15, created_at: '2026-01-14T10:30:00Z', owner_name: 'Kwame Asante',   email: 'kwame@jerkstop.co.uk',      phone: '+447700900002' },
  { id: 'v3', user_id: 'u3', business_name: 'Lagos Buka',          business_type: 'restaurant', address: '5 Dalston Lane, London E8',      status: 'approved',  commission_rate: 12, created_at: '2026-01-20T11:00:00Z', owner_name: 'Chidi Eze',      email: 'chidi@lagosbuka.co.uk',     phone: '+447700900003' },
  { id: 'v4', user_id: 'u4', business_name: 'Suya Spot',           business_type: 'restaurant', address: '22 Old Kent Rd, London SE1',     status: 'pending',   commission_rate: 15, created_at: '2026-04-28T08:00:00Z', owner_name: 'Yemi Adeyemi',   email: 'yemi@suyaspot.co.uk',       phone: '+447700900004' },
  { id: 'v5', user_id: 'u5', business_name: 'Egusi Palace',        business_type: 'restaurant', address: '3 Tottenham High Rd, London N17', status: 'pending',   commission_rate: 15, created_at: '2026-04-29T14:00:00Z', owner_name: 'Ngozi Iwu',      email: 'ngozi@egusipalace.co.uk',   phone: '+447700900005' },
  { id: 'v6', user_id: 'u6', business_name: 'Afro Grocers',        business_type: 'store',      address: '14 Walworth Rd, London SE17',    status: 'pending',   commission_rate: 10, created_at: '2026-04-30T09:30:00Z', owner_name: 'Fatima Diallo',  email: 'fatima@afrogrocers.co.uk',  phone: '+447700900006' },
  { id: 'v7', user_id: 'u7', business_name: 'Caribbean Flavours',  business_type: 'restaurant', address: '9 Lewisham Way, London SE4',     status: 'rejected',  commission_rate: 15, created_at: '2026-03-15T10:00:00Z', owner_name: 'Abena Mensah',   email: 'abena@caribflavours.co.uk', phone: '+447700900007' },
  { id: 'v8', user_id: 'u8', business_name: 'West African Store',  business_type: 'store',      address: '7 Forest Hill Rd, London SE23',  status: 'approved',  commission_rate: 10, created_at: '2026-02-05T12:00:00Z', owner_name: 'Kofi Mensah',    email: 'kofi@westafricanstore.co.uk', phone: '+447700900008' },
  { id: 'v9', user_id: 'u9', business_name: 'Plantain Paradise',   business_type: 'restaurant', address: '31 Rye Lane, London SE15',       status: 'rejected',  commission_rate: 15, created_at: '2026-03-22T11:30:00Z', owner_name: 'Olu Babalola',   email: 'olu@plantainparadise.co.uk', phone: '+447700900009' },
]

export default function VendorsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const pendingCount = MOCK_VENDORS.filter((v) => v.status === 'pending').length

  const filtered = MOCK_VENDORS.filter((v) => {
    const matchFilter = filter === 'all' || v.status === filter
    const matchSearch = !search ||
      v.business_name.toLowerCase().includes(search.toLowerCase()) ||
      v.owner_name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const tabs: { label: string; value: Filter; count?: number }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending', count: pendingCount },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ]

  return (
    <div className="space-y-5">
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
          <Button variant="outline" size="md" icon={<Download size={14} />}>Export</Button>
        </div>
      </div>

      <VendorTable vendors={filtered} loading={false} />
    </div>
  )
}
