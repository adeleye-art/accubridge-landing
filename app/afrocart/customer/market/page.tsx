'use client'

import { useState, useMemo } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { GroceryStoreCard } from '@/components/customer/GroceryStoreCard'
import type { GroceryStore } from '@/types'

const ALL_STORES: GroceryStore[] = [
  { id: 's1', business_name: 'Abuja Spice Store',       business_type: 'store', address: '78 Rye Lane, London SE15',         rating: 4.7, delivery_time_min: 30, delivery_time_max: 45, delivery_fee: 249, min_order: 1500, is_open: true,  category_tags: ['Spices & Seasonings', 'Rice & Grains', 'Dried Goods'] },
  { id: 's2', business_name: 'Caribbean Grocery Hub',   business_type: 'store', address: '22 Atlantic Rd, London SW9',       rating: 4.5, delivery_time_min: 25, delivery_time_max: 40, delivery_fee: 199, min_order: 1000, is_open: true,  category_tags: ['Snacks & Drinks', 'Produce', 'Frozen'] },
  { id: 's3', business_name: 'Lagos Food Mart',         business_type: 'store', address: '61 Coldharbour Ln, London SE5',   rating: 4.6, delivery_time_min: 35, delivery_time_max: 50, delivery_fee: 149, min_order: 2000, is_open: true,  category_tags: ['Rice & Grains', 'Meat & Fish', 'Frozen'] },
  { id: 's4', business_name: 'Accra Fresh Market',      business_type: 'store', address: '14 Denmark Hill, London SE5',     rating: 4.4, delivery_time_min: 20, delivery_time_max: 30, delivery_fee: 0,   min_order: 1500, is_open: false, category_tags: ['Vegetables', 'Meat & Fish', 'Household'] },
  { id: 's5', business_name: 'Naija Grocers',           business_type: 'store', address: '53 Peckham High St, London SE15', rating: 4.3, delivery_time_min: 25, delivery_time_max: 40, delivery_fee: 199, min_order: 1000, is_open: true,  category_tags: ['Spices & Seasonings', 'Snacks & Drinks'] },
  { id: 's6', business_name: 'East African Essentials', business_type: 'store', address: '91 Camberwell Rd, London SE5',    rating: 4.5, delivery_time_min: 30, delivery_time_max: 45, delivery_fee: 149, min_order: 1200, is_open: true,  category_tags: ['Vegetables', 'Rice & Grains', 'Household'] },
]

const CATEGORIES = ['Rice & Grains', 'Spices & Seasonings', 'Meat & Fish', 'Snacks & Drinks', 'Frozen', 'Vegetables', 'Household']
type Sort = 'recommended' | 'rating' | 'delivery_time' | 'delivery_fee'
type DeliveryTimeFilter = 'any' | 'under20' | 'under30'
type MinOrderFilter = 'any' | 'under10' | 'under15'

export default function MarketPage() {
  const [search,         setSearch]         = useState('')
  const [selectedCats,   setSelectedCats]   = useState<string[]>([])
  const [sort,           setSort]           = useState<Sort>('recommended')
  const [deliveryTime,   setDeliveryTime]   = useState<DeliveryTimeFilter>('any')
  const [minOrder,       setMinOrder]       = useState<MinOrderFilter>('any')
  const [appliedFilters, setAppliedFilters] = useState({ cats: [] as string[], sort: 'recommended' as Sort, deliveryTime: 'any' as DeliveryTimeFilter, minOrder: 'any' as MinOrderFilter })
  const [page, setPage] = useState(1)
  const PER_PAGE = 9

  const filtered = useMemo(() => {
    let list = ALL_STORES.filter((s) => {
      if (search && !s.business_name.toLowerCase().includes(search.toLowerCase())) return false
      if (appliedFilters.cats.length > 0 && !appliedFilters.cats.some((c) => s.category_tags.includes(c))) return false
      if (appliedFilters.deliveryTime === 'under20' && s.delivery_time_min >= 20) return false
      if (appliedFilters.deliveryTime === 'under30' && s.delivery_time_min >= 30) return false
      if (appliedFilters.minOrder === 'under10' && s.min_order >= 1000) return false
      if (appliedFilters.minOrder === 'under15' && s.min_order >= 1500) return false
      return true
    })
    if (appliedFilters.sort === 'rating')        list = [...list].sort((a, b) => b.rating - a.rating)
    if (appliedFilters.sort === 'delivery_time') list = [...list].sort((a, b) => a.delivery_time_min - b.delivery_time_min)
    if (appliedFilters.sort === 'delivery_fee')  list = [...list].sort((a, b) => a.delivery_fee - b.delivery_fee)
    return list
  }, [search, appliedFilters])

  const paginated = filtered.slice(0, page * PER_PAGE)
  const hasMore   = paginated.length < filtered.length

  function toggleCat(c: string) { setSelectedCats((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]) }
  function applyFilters() { setAppliedFilters({ cats: selectedCats, sort, deliveryTime, minOrder }); setPage(1) }
  function clearAll() { setSelectedCats([]); setSort('recommended'); setDeliveryTime('any'); setMinOrder('any'); setAppliedFilters({ cats: [], sort: 'recommended', deliveryTime: 'any', minOrder: 'any' }); setPage(1) }

  return (
    <div className="flex px-6 py-6 gap-6 max-w-[1400px] mx-auto">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 sticky top-20 self-start">
        <div className="bg-white rounded-xl border border-[#E4E0D5] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#1A1814] flex items-center gap-2"><SlidersHorizontal size={15} /> Filters</p>
            <button onClick={clearAll} className="text-xs text-[#B8962E] hover:underline">Clear all</button>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-2">Category</p>
            <div className="space-y-1.5">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedCats.includes(c)} onChange={() => toggleCat(c)} className="accent-[#B8962E]" />
                  <span className="text-sm text-[#5C5750]">{c}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-2">Sort By</p>
            <div className="space-y-1.5">
              {(['recommended', 'rating', 'delivery_time', 'delivery_fee'] as Sort[]).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="sort" checked={sort === s} onChange={() => setSort(s)} className="accent-[#B8962E]" />
                  <span className="text-sm text-[#5C5750] capitalize">{s === 'delivery_time' ? 'Delivery Time' : s === 'delivery_fee' ? 'Delivery Fee' : s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-2">Delivery Time</p>
            <div className="space-y-1.5">
              {([['any', 'Any'], ['under20', 'Under 20 min'], ['under30', 'Under 30 min']] as [DeliveryTimeFilter, string][]).map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="dtime" checked={deliveryTime === v} onChange={() => setDeliveryTime(v)} className="accent-[#B8962E]" />
                  <span className="text-sm text-[#5C5750]">{l}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-2">Minimum Order</p>
            <div className="space-y-1.5">
              {([['any', 'Any'], ['under10', 'Under £10'], ['under15', 'Under £15']] as [MinOrderFilter, string][]).map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="minorder" checked={minOrder === v} onChange={() => setMinOrder(v)} className="accent-[#B8962E]" />
                  <span className="text-sm text-[#5C5750]">{l}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={applyFilters} className="w-full bg-[#B8962E] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#A07828] transition-colors">Apply Filters</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C968E]" />
          <input type="text" placeholder="Search grocery stores..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full pl-10 pr-10 py-3 border border-[#E4E0D5] rounded-xl bg-white text-sm text-[#1A1814] focus:outline-none focus:border-[#B8962E] placeholder:text-[#9C968E]" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C968E] hover:text-[#1A1814]"><X size={15} /></button>}
        </div>
        <p className="text-sm text-[#9C968E] mb-4">{filtered.length} store{filtered.length !== 1 ? 's' : ''} near Peckham</p>
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="text-[#E4E0D5] mx-auto mb-4" />
            <p className="font-semibold text-[#5C5750]">No stores found</p>
            <p className="text-sm text-[#9C968E] mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((s) => <GroceryStoreCard key={s.id} store={s} size="lg" />)}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={() => setPage((p) => p + 1)} className="px-8 py-3 border-2 border-[#B8962E] text-[#B8962E] rounded-xl font-semibold text-sm hover:bg-[#E8D5A3]/30 transition-colors">Load more stores</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
