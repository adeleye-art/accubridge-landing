'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Star, Clock, Bike, ShoppingBag, MapPin } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { MenuItemRow } from '@/components/customer/MenuItemRow'
import { CartFloatingBar } from '@/components/customer/CartFloatingBar'
import { selectCartVendorId, clearCart, setVendor } from '@/store/cartSlice'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { GroceryStore, MenuItem, MenuCategory } from '@/types'
import type { AppDispatch } from '@/store'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STORES: Record<string, GroceryStore & { categories: MenuCategory[] }> = {
  s1: {
    id: 's1', business_name: 'Abuja Spice Store', business_type: 'store',
    address: '78 Rye Lane, London SE15', rating: 4.7, delivery_time_min: 30,
    delivery_time_max: 45, delivery_fee: 249, min_order: 1500, is_open: true,
    category_tags: ['Spices & Seasonings', 'Rice & Grains', 'Dried Goods'],
    description: 'Your one-stop shop for authentic African and Caribbean spices.',
    distance_miles: 0.3,
    categories: [
      { id: 'c1', name: 'Spices & Seasonings', item_count: 5 },
      { id: 'c2', name: 'Rice & Grains',       item_count: 4 },
      { id: 'c3', name: 'Dried Goods',          item_count: 4 },
      { id: 'c4', name: 'Snacks & Drinks',      item_count: 3 },
    ],
  },
}

const MOCK_PRODUCTS: MenuItem[] = [
  { id: 'p1',  vendor_id: 's1', name: 'Tatashe Pepper 500g',        description: 'Sweet red bell peppers, sun-dried and packed fresh.',           price: 299,  category: 'Spices & Seasonings', availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p2',  vendor_id: 's1', name: 'Scotch Bonnet 6 Pack',       description: 'Fiery Scotch bonnet peppers. Handle with care!',                price: 199,  category: 'Spices & Seasonings', availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p3',  vendor_id: 's1', name: 'Crayfish Powder 100g',       description: 'Ground dried crayfish — essential for soups and stews.',          price: 249,  category: 'Spices & Seasonings', availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p4',  vendor_id: 's1', name: 'Suya Spice Mix 200g',        description: 'Authentic Nigerian suya seasoning blend.',                       price: 299,  category: 'Spices & Seasonings', availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p5',  vendor_id: 's1', name: 'Jollof Rice Mix 500g',       description: 'Pre-seasoned tomato mix perfect for party jollof.',              price: 349,  category: 'Spices & Seasonings', availability: false, image_url: '', created_at: '', updated_at: '' },
  { id: 'p6',  vendor_id: 's1', name: 'Basmati Rice 2kg',           description: 'Long-grain basmati, perfect for jollof and fried rice.',         price: 549,  category: 'Rice & Grains',       availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p7',  vendor_id: 's1', name: 'Ofada Rice 1kg',             description: 'Unprocessed local Nigerian rice with distinct earthy flavour.',  price: 449,  category: 'Rice & Grains',       availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p8',  vendor_id: 's1', name: 'Yellow Garri 1kg',           description: 'Coarse cassava granules, ideal for eba.',                        price: 299,  category: 'Rice & Grains',       availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p9',  vendor_id: 's1', name: 'Semolina 1kg',               description: 'Fine semolina for swallow dishes.',                              price: 249,  category: 'Rice & Grains',       availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p10', vendor_id: 's1', name: 'Iru (Locust Beans) 200g',    description: 'Fermented locust beans — adds depth to soups and stews.',        price: 150,  category: 'Dried Goods',         availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p11', vendor_id: 's1', name: 'Palm Oil 1L',                description: 'Rich, unrefined red palm oil for authentic cooking.',            price: 399,  category: 'Dried Goods',         availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p12', vendor_id: 's1', name: 'Ogiri Fermented Seeds 100g', description: 'Traditional fermented oil seeds for bold flavour.',              price: 120,  category: 'Dried Goods',         availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p13', vendor_id: 's1', name: 'Stockfish Fillet 200g',      description: 'Dried Atlantic cod, essential for Nigerian soups.',              price: 699,  category: 'Dried Goods',         availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p14', vendor_id: 's1', name: 'Plantain Chips 150g',        description: 'Crispy salted plantain chips, lightly seasoned.',                price: 179,  category: 'Snacks & Drinks',     availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p15', vendor_id: 's1', name: 'Malta Drink 330ml',          description: 'Classic non-alcoholic malt beverage.',                           price: 129,  category: 'Snacks & Drinks',     availability: true,  image_url: '', created_at: '', updated_at: '' },
  { id: 'p16', vendor_id: 's1', name: 'Puff Puff Mix 500g',         description: 'Ready-to-fry puff puff mix — just add water.',                  price: 249,  category: 'Snacks & Drinks',     availability: true,  image_url: '', created_at: '', updated_at: '' },
]

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function getFallbackStore(id: string): GroceryStore & { categories: MenuCategory[] } {
  return {
    id, business_name: 'Grocery Store', business_type: 'store', address: 'London',
    rating: 4.5, delivery_time_min: 30, delivery_time_max: 45,
    delivery_fee: 199, min_order: 1000, is_open: true, category_tags: [],
    categories: [],
  }
}

export default function StoreDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const id       = params.id as string

  const store    = MOCK_STORES[id] ?? getFallbackStore(id)
  const products = id === 's1' ? MOCK_PRODUCTS : []

  const cartVendorId = useSelector(selectCartVendorId)
  const [activeCategory, setActiveCategory] = useState(store.categories[0]?.name ?? '')
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [pendingItem,    setPendingItem]    = useState<MenuItem | null>(null)

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveCategory(visible[0].target.getAttribute('data-category') ?? '')
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function scrollToCategory(name: string) {
    sectionRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleVendorMismatch(_existingVendor: string, item: MenuItem) {
    setPendingItem(item)
    setClearModalOpen(true)
  }

  function handleStartNewCart() {
    dispatch(clearCart())
    dispatch(setVendor({ vendor_id: store.id, vendor_name: store.business_name }))
    if (pendingItem) {
      dispatch({ type: 'cart/addItem', payload: { id: `ci_${pendingItem.id}`, menu_item_id: pendingItem.id, vendor_id: store.id, vendor_name: store.business_name, name: pendingItem.name, description: pendingItem.description, price: pendingItem.price, quantity: 1, category: pendingItem.category } })
    }
    setClearModalOpen(false)
    setPendingItem(null)
    toast.success('Cart cleared — starting fresh')
  }

  const categoriesInProducts = [...new Set(products.map((p) => p.category))]

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="relative h-56 bg-[#E4E0D5]">
        <div className="w-full h-full flex items-center justify-center text-7xl">🛒</div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button onClick={() => router.back()} className="absolute top-4 left-4 w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <button className="absolute top-4 right-4 w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors">
          <Heart size={18} />
        </button>
      </div>

      {/* Info bar */}
      <div className="bg-[#EFECE5] border-b border-[#E4E0D5] px-8 py-5">
        <div className="flex items-start gap-5 max-w-[1400px] mx-auto">
          <div className="-mt-10 relative z-10 w-16 h-16 rounded-full border-4 border-white bg-[#B8962E]/20 flex items-center justify-center text-2xl font-bold text-[#B8962E] flex-shrink-0">
            {store.business_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1A1814]">{store.business_name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {store.category_tags.map((t) => (
                <span key={t} className="text-xs bg-[#E8D5A3] text-[#B8962E] px-2.5 py-0.5 rounded-full font-medium">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-[#5C5750]">
              <span className="flex items-center gap-1"><Star size={13} fill="#B8962E" stroke="none" /> {store.rating.toFixed(1)}</span>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', store.is_open ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>{store.is_open ? 'Open' : 'Closed'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#5C5750] flex-shrink-0">
            <span className="flex items-center gap-1.5"><Clock size={14} /> {store.delivery_time_min}–{store.delivery_time_max} min</span>
            <span className="flex items-center gap-1.5"><Bike size={14} /> {store.delivery_fee === 0 ? 'Free delivery' : `${gbp(store.delivery_fee)} delivery`}</span>
            <span className="flex items-center gap-1.5"><ShoppingBag size={14} /> {gbp(store.min_order)} min order</span>
            {store.distance_miles && <span className="flex items-center gap-1.5"><MapPin size={14} /> {store.distance_miles} miles</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex max-w-[1400px] mx-auto px-8 py-6 gap-8">
        {/* Category nav */}
        <nav className="w-[200px] flex-shrink-0 sticky top-20 self-start">
          <ul className="space-y-0.5">
            {categoriesInProducts.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => scrollToCategory(cat)}
                  className={cn(
                    'w-full text-left text-sm py-2 pl-3 border-l-2 transition-colors',
                    activeCategory === cat
                      ? 'border-[#B8962E] text-[#B8962E] font-medium'
                      : 'border-transparent text-[#5C5750] hover:text-[#1A1814]'
                  )}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {categoriesInProducts.map((cat) => (
            <section
              key={cat}
              data-category={cat}
              ref={(el) => { sectionRefs.current[cat] = el }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-[#1A1814] mb-4 pt-2">{cat}</h2>
              {products.filter((p) => p.category === cat).map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  vendorId={store.id}
                  vendorName={store.business_name}
                  onVendorMismatch={handleVendorMismatch}
                />
              ))}
            </section>
          ))}
          {categoriesInProducts.length === 0 && (
            <div className="text-center py-20 text-[#9C968E]">Products not available</div>
          )}
        </div>
      </div>

      <CartFloatingBar />

      {/* Clear cart modal */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setClearModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-[#1A1814] text-lg mb-2">Start a new cart?</h3>
            <p className="text-sm text-[#5C5750] mb-6">
              You already have items from another store. Adding from <strong>{store.business_name}</strong> will clear your current cart.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setClearModalOpen(false)} className="flex-1 py-2.5 border border-[#E4E0D5] rounded-xl text-sm text-[#5C5750] hover:bg-[#F7F5F0] transition-colors">Keep Current Cart</button>
              <button onClick={handleStartNewCart} className="flex-1 py-2.5 bg-[#C0392B] text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Start New Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
