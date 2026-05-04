'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, UtensilsCrossed } from 'lucide-react'
import { MenuItemCard } from '@/components/vendor/MenuItemCard'
import { MenuItemModal } from '@/components/vendor/MenuItemModal'
import { DeleteMenuItemModal } from '@/components/vendor/DeleteMenuItemModal'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { MenuItem, MenuCategory } from '@/types'

const MOCK_CATEGORIES: MenuCategory[] = [
  { id: 'c1', name: 'Rice',   item_count: 4 },
  { id: 'c2', name: 'Soups',  item_count: 3 },
  { id: 'c3', name: 'Grills', item_count: 3 },
  { id: 'c4', name: 'Sides',  item_count: 4 },
  { id: 'c5', name: 'Drinks', item_count: 2 },
]

const now = new Date().toISOString()

const INITIAL_ITEMS: MenuItem[] = [
  { id: 'm1', vendor_id: 'v1', name: 'Jollof Rice with Chicken', description: 'Classic party jollof rice served with a juicy grilled chicken thigh.', price: 1150, category: 'Rice', availability: true, created_at: now, updated_at: now },
  { id: 'm2', vendor_id: 'v1', name: 'Fried Rice with Beef', description: 'Nigerian-style fried rice loaded with mixed vegetables and spiced beef.', price: 1050, category: 'Rice', availability: true, created_at: now, updated_at: now },
  { id: 'm3', vendor_id: 'v1', name: 'White Rice & Stew', description: 'Fluffy white rice with rich tomato beef stew.', price: 950, category: 'Rice', availability: false, created_at: now, updated_at: now },
  { id: 'm4', vendor_id: 'v1', name: 'Egusi Soup + Eba', description: 'Rich ground melon seed soup cooked with assorted meat and stockfish.', price: 1200, category: 'Soups', availability: true, created_at: now, updated_at: now },
  { id: 'm5', vendor_id: 'v1', name: 'Pepper Soup (Goat Meat)', description: 'Spicy, aromatic broth with tender goat meat pieces.', price: 1350, category: 'Soups', availability: true, created_at: now, updated_at: now },
  { id: 'm6', vendor_id: 'v1', name: 'Edikaikong Soup', description: 'Nutrient-rich vegetable soup with assorted meat, periwinkle and crayfish.', price: 1100, category: 'Soups', availability: true, created_at: now, updated_at: now },
  { id: 'm7', vendor_id: 'v1', name: 'Suya Skewers (3 sticks)', description: 'Perfectly grilled beef suya on a skewer with house spice blend.', price: 800, category: 'Grills', availability: true, created_at: now, updated_at: now },
  { id: 'm8', vendor_id: 'v1', name: 'Grilled Chicken (Half)', description: 'Half chicken marinated in house spices and charcoal grilled.', price: 1400, category: 'Grills', availability: true, created_at: now, updated_at: now },
  { id: 'm9', vendor_id: 'v1', name: 'Ofada Rice & Ayamase', description: 'Local unprocessed rice paired with the signature green pepper stew.', price: 1050, category: 'Rice', availability: false, created_at: now, updated_at: now },
  { id: 'm10', vendor_id: 'v1', name: 'Fried Plantain', description: 'Sweet ripe plantain slices, golden fried to perfection.', price: 350, category: 'Sides', availability: true, created_at: now, updated_at: now },
  { id: 'm11', vendor_id: 'v1', name: 'Moi Moi', description: 'Steamed bean pudding with egg, fish and peppers.', price: 450, category: 'Sides', availability: true, created_at: now, updated_at: now },
  { id: 'm12', vendor_id: 'v1', name: 'Puff Puff (6 pcs)', description: 'Soft, pillowy deep-fried dough balls lightly sweetened.', price: 300, category: 'Sides', availability: true, created_at: now, updated_at: now },
  { id: 'm13', vendor_id: 'v1', name: 'Chapman', description: 'Classic Nigerian non-alcoholic cocktail with citrus and grenadine.', price: 400, category: 'Drinks', availability: true, created_at: now, updated_at: now },
  { id: 'm14', vendor_id: 'v1', name: 'Zobo (Cold)', description: 'Chilled hibiscus tea with ginger and pineapple. Refreshing and natural.', price: 300, category: 'Drinks', availability: true, created_at: now, updated_at: now },
  { id: 'm15', vendor_id: 'v1', name: 'Coleslaw & Side Salad', description: 'Freshly prepared coleslaw with carrots and light mayo dressing.', price: 300, category: 'Sides', availability: true, created_at: now, updated_at: now },
]

type AvailFilter = 'all' | 'available' | 'unavailable'

let nextId = 100

export default function MenuPage() {
  const [items, setItems]             = useState<MenuItem[]>(INITIAL_ITEMS)
  const [availFilter, setAvailFilter] = useState<AvailFilter>('all')
  const [activeCategory, setCategory] = useState<string>('all')
  const [search, setSearch]           = useState('')
  const [addOpen, setAddOpen]         = useState(false)
  const [editItem, setEditItem]       = useState<MenuItem | null>(null)
  const [deleteItem, setDeleteItem]   = useState<MenuItem | null>(null)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)))
    return cats.map((name) => ({ id: name, name, item_count: items.filter((i) => i.category === name).length }))
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (availFilter === 'available'   && !item.availability) return false
      if (availFilter === 'unavailable' &&  item.availability) return false
      if (activeCategory !== 'all' && item.category !== activeCategory) return false
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [items, availFilter, activeCategory, search])

  async function handleSave(data: {
    name: string; description: string; price: number; category: string; availability: boolean; image?: File
  }) {
    await new Promise((r) => setTimeout(r, 500))
    if (editItem) {
      setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, ...data, updated_at: new Date().toISOString() } : i))
      toast.success(`${data.name} updated`)
    } else {
      const newItem: MenuItem = {
        id: `m${++nextId}`, vendor_id: 'v1', ...data,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
      setItems((prev) => [newItem, ...prev])
      toast.success(`${data.name} added to menu`)
    }
    setEditItem(null)
    setAddOpen(false)
  }

  async function handleDelete(item: MenuItem) {
    await new Promise((r) => setTimeout(r, 400))
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    toast.success(`${item.name} removed from menu`)
  }

  function handleToggleAvailability(item: MenuItem, next: boolean) {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, availability: next } : i))
  }

  const AVAIL_TABS: { key: AvailFilter; label: string }[] = [
    { key: 'all',         label: 'All' },
    { key: 'available',   label: 'Available' },
    { key: 'unavailable', label: 'Unavailable' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1A1814] tracking-tight">My Menu</h2>
        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} />}
          onClick={() => { setEditItem(null); setAddOpen(true) }}
        >
          Add Item
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-[#E4E0D5] px-5 py-4 space-y-3">
        {/* Availability tabs */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            {AVAIL_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setAvailFilter(tab.key)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  availFilter === tab.key
                    ? 'bg-[#B8962E] text-white'
                    : 'text-[#9C968E] hover:text-[#1A1814] hover:bg-[#F7F5F0]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C968E]" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-sm bg-[#F7F5F0] border border-[#E4E0D5] rounded-lg w-56 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary placeholder:text-text-muted"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('all')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              activeCategory === 'all'
                ? 'bg-[#B8962E] text-white'
                : 'bg-[#EFECE5] text-[#5C5750] hover:bg-[#E4E0D5]'
            )}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.name)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                activeCategory === cat.name
                  ? 'bg-[#B8962E] text-white'
                  : 'bg-[#EFECE5] text-[#5C5750] hover:bg-[#E4E0D5]'
              )}
            >
              {cat.name} ({cat.item_count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <UtensilsCrossed size={48} className="text-[#B8962E]/30 mx-auto mb-4" />
          <p className="font-semibold text-[#5C5750] mb-1">
            {items.length === 0 ? 'Your menu is empty' : 'No items match your filters'}
          </p>
          <p className="text-sm text-[#9C968E] mb-5">
            {items.length === 0
              ? 'Add your first item to start receiving orders'
              : 'Try a different category or search term'}
          </p>
          {items.length === 0 && (
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => setAddOpen(true)}
            >
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={(i) => { setEditItem(i); setAddOpen(true) }}
              onDelete={setDeleteItem}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      <MenuItemModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditItem(null) }}
        editItem={editItem}
        onSave={handleSave}
      />

      <DeleteMenuItemModal
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
