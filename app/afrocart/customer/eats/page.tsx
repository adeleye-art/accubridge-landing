'use client'

import { useState, useMemo } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { RestaurantCard } from '@/components/customer/RestaurantCard'
import { cn } from '@/lib/utils'
import type { Restaurant } from '@/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_RESTAURANTS: Restaurant[] = [
  { id: 'r1',  business_name: "Mama's Kitchen",    business_type: 'restaurant', address: '12 Peckham Rd, London SE15',     rating: 4.8, total_reviews: 312, delivery_time_min: 25, delivery_time_max: 35, delivery_fee: 199, min_order: 1000, is_open: true,  cuisine_tags: ['Nigerian', 'West African'] },
  { id: 'r2',  business_name: 'Jerk Palace',       business_type: 'restaurant', address: '45 Brixton Hill, London SW2',    rating: 4.5, total_reviews: 186, delivery_time_min: 30, delivery_time_max: 45, delivery_fee: 149, min_order: 1500, is_open: true,  cuisine_tags: ['Caribbean', 'Jamaican'] },
  { id: 'r3',  business_name: 'Suya Spot',         business_type: 'restaurant', address: '8 Elephant Rd, London SE1',     rating: 4.7, total_reviews: 204, delivery_time_min: 20, delivery_time_max: 30, delivery_fee: 0,   min_order: 1200, is_open: true,  cuisine_tags: ['Nigerian', 'Grills', 'Halal'] },
  { id: 'r4',  business_name: 'Habesha House',     business_type: 'restaurant', address: '33 Lewisham Way, London SE4',   rating: 4.6, total_reviews: 143, delivery_time_min: 35, delivery_time_max: 50, delivery_fee: 199, min_order: 1000, is_open: false, cuisine_tags: ['Ethiopian', 'East African', 'Vegetarian'] },
  { id: 'r5',  business_name: 'Fufu Palace',       business_type: 'restaurant', address: '19 Old Kent Rd, London SE1',    rating: 4.4, total_reviews: 97,  delivery_time_min: 30, delivery_time_max: 40, delivery_fee: 99,  min_order: 800,  is_open: true,  cuisine_tags: ['Ghanaian', 'West African'] },
  { id: 'r6',  business_name: 'Somali Kitchen',    business_type: 'restaurant', address: '55 Camberwell Rd, London SE5',  rating: 4.3, total_reviews: 78,  delivery_time_min: 25, delivery_time_max: 35, delivery_fee: 149, min_order: 1000, is_open: true,  cuisine_tags: ['Somali', 'East African'] },
  { id: 'r7',  business_name: 'Akara House',       business_type: 'restaurant', address: '88 Walworth Rd, London SE17',   rating: 4.2, total_reviews: 55,  delivery_time_min: 15, delivery_time_max: 25, delivery_fee: 0,   min_order: 600,  is_open: true,  cuisine_tags: ['Nigerian', 'Snacks'] },
  { id: 'r8',  business_name: 'Caribbean Jerk Co', business_type: 'restaurant', address: '3 Electric Ave, London SW9',    rating: 4.6, total_reviews: 231, delivery_time_min: 25, delivery_time_max: 35, delivery_fee: 149, min_order: 1200, is_open: true,  cuisine_tags: ['Caribbean', 'Halal'] },
  { id: 'r9',  business_name: 'Egusi Kingdom',     business_type: 'restaurant', address: '27 Coldharbour Ln, London SE5', rating: 4.5, total_reviews: 108, delivery_time_min: 30, delivery_time_max: 45, delivery_fee: 249, min_order: 1500, is_open: false, cuisine_tags: ['Nigerian', 'West African'] },
  { id: 'r10', business_name: 'Afro Bites',        business_type: 'restaurant', address: '64 Rye Lane, London SE15',      rating: 4.1, total_reviews: 44,  delivery_time_min: 20, delivery_time_max: 30, delivery_fee: 99,  min_order: 800,  is_open: true,  cuisine_tags: ['West African', 'Grills'] },
  { id: 'r11', business_name: 'Naija Express',     business_type: 'restaurant', address: '11 Peckham High St, London SE15', rating: 4.4, total_reviews: 167, delivery_time_min: 25, delivery_time_max: 40, delivery_fee: 149, min_order: 1000, is_open: true, cuisine_tags: ['Nigerian', 'Halal'] },
  { id: 'r12', business_name: 'Taste of Ghana',   business_type: 'restaurant', address: '39 Denmark Hill, London SE5',   rating: 4.7, total_reviews: 198, delivery_time_min: 30, delivery_time_max: 45, delivery_fee: 199, min_order: 1200, is_open: true,  cuisine_tags: ['Ghanaian', 'Vegetarian'] },
]

const CUISINES = ['Nigerian', 'Ghanaian', 'Caribbean', 'Somali', 'Ethiopian', 'East African', 'Vegetarian', 'Halal']

type Sort = 'recommended' | 'rating' | 'delivery_time' | 'delivery_fee'
type DeliveryTimeFilter = 'any' | 'under20' | 'under30'
type MinOrderFilter = 'any' | 'under10' | 'under15'

export default function EatsPage() {
  const [search,         setSearch]         = useState('')
  const [selectedCuisines, setCuisines]     = useState<string[]>([])
  const [sort,           setSort]           = useState<Sort>('recommended')
  const [deliveryTime,   setDeliveryTime]   = useState<DeliveryTimeFilter>('any')
  const [minOrder,       setMinOrder]       = useState<MinOrderFilter>('any')
  const [appliedFilters, setAppliedFilters] = useState({ cuisines: [] as string[], sort: 'recommended' as Sort, deliveryTime: 'any' as DeliveryTimeFilter, minOrder: 'any' as MinOrderFilter })
  const [page,           setPage]           = useState(1)
  const PER_PAGE = 9

  const filtered = useMemo(() => {
    let list = ALL_RESTAURANTS.filter((r) => {
      if (search && !r.business_name.toLowerCase().includes(search.toLowerCase())) return false
      if (appliedFilters.cuisines.length > 0 && !appliedFilters.cuisines.some((c) => r.cuisine_tags.includes(c))) return false
      if (appliedFilters.deliveryTime === 'under20' && r.delivery_time_min >= 20) return false
      if (appliedFilters.deliveryTime === 'under30' && r.delivery_time_min >= 30) return false
      if (appliedFilters.minOrder === 'under10' && r.min_order >= 1000) return false
      if (appliedFilters.minOrder === 'under15' && r.min_order >= 1500) return false
      return true
    })
    if (appliedFilters.sort === 'rating')        list = [...list].sort((a, b) => b.rating - a.rating)
    if (appliedFilters.sort === 'delivery_time') list = [...list].sort((a, b) => a.delivery_time_min - b.delivery_time_min)
    if (appliedFilters.sort === 'delivery_fee')  list = [...list].sort((a, b) => a.delivery_fee - b.delivery_fee)
    return list
  }, [search, appliedFilters])

  const paginated = filtered.slice(0, page * PER_PAGE)
  const hasMore   = paginated.length < filtered.length

  function toggleCuisine(c: string) {
    setCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }

  function applyFilters() {
    setAppliedFilters({ cuisines: selectedCuisines, sort, deliveryTime, minOrder })
    setPage(1)
  }

  function clearAll() {
    setCuisines([])
    setSort('recommended')
    setDeliveryTime('any')
    setMinOrder('any')
    setAppliedFilters({ cuisines: [], sort: 'recommended', deliveryTime: 'any', minOrder: 'any' })
    setPage(1)
  }

  const activeChips = [
    ...appliedFilters.cuisines.map((c) => ({ label: c, onRemove: () => setAppliedFilters((f) => ({ ...f, cuisines: f.cuisines.filter((x) => x !== c) })) })),
    ...(appliedFilters.deliveryTime !== 'any' ? [{ label: appliedFilters.deliveryTime === 'under20' ? 'Under 20 min' : 'Under 30 min', onRemove: () => setAppliedFilters((f) => ({ ...f, deliveryTime: 'any' })) }] : []),
    ...(appliedFilters.minOrder !== 'any' ? [{ label: appliedFilters.minOrder === 'under10' ? 'Min < £10' : 'Min < £15', onRemove: () => setAppliedFilters((f) => ({ ...f, minOrder: 'any' })) }] : []),
  ]

  return (
    <div className="flex px-6 py-6 gap-6 max-w-[1400px] mx-auto">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 sticky top-20 self-start">
        <div className="bg-white rounded-xl border border-[#E4E0D5] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#1A1814] flex items-center gap-2"><SlidersHorizontal size={15} /> Filters</p>
            <button onClick={clearAll} className="text-xs text-[#B8962E] hover:underline">Clear all</button>
          </div>

          {/* Cuisine */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-2">Cuisine Type</p>
            <div className="space-y-1.5">
              {CUISINES.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedCuisines.includes(c)} onChange={() => toggleCuisine(c)} className="accent-[#B8962E]" />
                  <span className="text-sm text-[#5C5750]">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort */}
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

          {/* Delivery time */}
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

          {/* Min order */}
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
        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C968E]" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-10 py-3 border border-[#E4E0D5] rounded-xl bg-white text-sm text-[#1A1814] focus:outline-none focus:border-[#B8962E] placeholder:text-[#9C968E]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C968E] hover:text-[#1A1814]">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeChips.map((chip, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-[#E8D5A3] text-[#B8962E] text-xs font-medium px-3 py-1 rounded-full">
                {chip.label}
                <button onClick={chip.onRemove}><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        {/* Count */}
        <p className="text-sm text-[#9C968E] mb-4">{filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} near Peckham</p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="text-[#E4E0D5] mx-auto mb-4" />
            <p className="font-semibold text-[#5C5750]">No restaurants found</p>
            <p className="text-sm text-[#9C968E] mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((r) => <RestaurantCard key={r.id} restaurant={r} size="lg" />)}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 border-2 border-[#B8962E] text-[#B8962E] rounded-xl font-semibold text-sm hover:bg-[#E8D5A3]/30 transition-colors"
                >
                  Load more restaurants
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
