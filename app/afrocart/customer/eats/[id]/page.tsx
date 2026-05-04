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
import type { Restaurant, MenuItem, MenuCategory } from '@/types'
import type { AppDispatch } from '@/store'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_STORE: Record<string, Restaurant & { menu_categories: MenuCategory[] }> = {
  r1: {
    id: 'r1', business_name: "Mama's Kitchen", business_type: 'restaurant',
    address: '12 Peckham Rd, London SE15', rating: 4.8, total_reviews: 312,
    delivery_time_min: 25, delivery_time_max: 35, delivery_fee: 199, min_order: 1000,
    is_open: true, cuisine_tags: ['Nigerian', 'West African', 'Halal'],
    description: 'Authentic Nigerian home cooking. Established in Peckham since 2012.',
    distance_miles: 0.4,
    menu_categories: [
      { id: 'c1', name: 'Rice Dishes',  item_count: 4 },
      { id: 'c2', name: 'Soups',        item_count: 3 },
      { id: 'c3', name: 'Grills',       item_count: 3 },
      { id: 'c4', name: 'Sides',        item_count: 4 },
      { id: 'c5', name: 'Drinks',       item_count: 2 },
    ],
  },
}

const MOCK_MENU: MenuItem[] = [
  { id: 'm1',  vendor_id: 'r1', name: 'Jollof Rice with Chicken',    description: 'Classic party jollof rice with grilled chicken thigh.',  price: 1150, category: 'Rice Dishes',  image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm2',  vendor_id: 'r1', name: 'Fried Rice with Beef',        description: 'Nigerian fried rice with mixed vegetables and spiced beef.', price: 1050, category: 'Rice Dishes', image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm3',  vendor_id: 'r1', name: 'White Rice & Stew',           description: 'Fluffy white rice with rich tomato beef stew.',           price: 950,  category: 'Rice Dishes',  image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm4',  vendor_id: 'r1', name: 'Ofada Rice & Ayamase',        description: 'Local unprocessed rice with signature green pepper stew.', price: 1050, category: 'Rice Dishes', image_url: '', availability: false, created_at: '', updated_at: '' },
  { id: 'm5',  vendor_id: 'r1', name: 'Egusi Soup + Eba',            description: 'Ground melon seed soup with assorted meat and stockfish.',  price: 1200, category: 'Soups',       image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm6',  vendor_id: 'r1', name: 'Pepper Soup (Goat Meat)',     description: 'Spicy aromatic broth with tender goat meat pieces.',       price: 1350, category: 'Soups',       image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm7',  vendor_id: 'r1', name: 'Edikaikong Soup',             description: 'Vegetable soup with assorted meat and periwinkle.',        price: 1100, category: 'Soups',       image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm8',  vendor_id: 'r1', name: 'Suya Skewers (3 sticks)',     description: 'Perfectly grilled beef suya with house spice blend.',      price: 800,  category: 'Grills',      image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm9',  vendor_id: 'r1', name: 'Grilled Chicken (Half)',      description: 'Half chicken marinated in house spices and charcoal grilled.', price: 1400, category: 'Grills', image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm10', vendor_id: 'r1', name: 'Grilled Fish (Tilapia)',      description: 'Whole tilapia seasoned and charcoal grilled to perfection.', price: 1600, category: 'Grills',  image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm11', vendor_id: 'r1', name: 'Fried Plantain',              description: 'Sweet ripe plantain slices, golden fried.',                price: 350,  category: 'Sides',       image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm12', vendor_id: 'r1', name: 'Moi Moi',                    description: 'Steamed bean pudding with egg, fish and peppers.',          price: 450,  category: 'Sides',       image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm13', vendor_id: 'r1', name: 'Puff Puff (6 pcs)',          description: 'Soft, pillowy deep-fried dough balls lightly sweetened.',  price: 300,  category: 'Sides',       image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm14', vendor_id: 'r1', name: 'Coleslaw',                   description: 'Freshly prepared coleslaw with carrots and light mayo.',    price: 300,  category: 'Sides',       image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm15', vendor_id: 'r1', name: 'Chapman',                    description: 'Classic Nigerian cocktail with citrus and grenadine.',      price: 400,  category: 'Drinks',      image_url: '', availability: true,  created_at: '', updated_at: '' },
  { id: 'm16', vendor_id: 'r1', name: 'Zobo (Cold)',                description: 'Chilled hibiscus tea with ginger and pineapple.',           price: 300,  category: 'Drinks',      image_url: '', availability: true,  created_at: '', updated_at: '' },
]

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

function getFallbackRestaurant(id: string): Restaurant & { menu_categories: MenuCategory[] } {
  return {
    id, business_name: 'Restaurant', business_type: 'restaurant', address: 'London',
    rating: 4.5, total_reviews: 100, delivery_time_min: 25, delivery_time_max: 35,
    delivery_fee: 199, min_order: 1000, is_open: true, cuisine_tags: [],
    menu_categories: [],
  }
}

export default function RestaurantDetailPage() {
  const params  = useParams()
  const router  = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const id      = params.id as string

  const restaurant = MOCK_STORE[id] ?? getFallbackRestaurant(id)
  const menu       = id === 'r1' ? MOCK_MENU : []
  const categories = restaurant.menu_categories

  const cartVendorId = useSelector(selectCartVendorId)
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name ?? '')
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [pendingItem, setPendingItem]       = useState<MenuItem | null>(null)

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // Scrollspy
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

  function handleVendorMismatch(existingVendor: string, item: MenuItem) {
    setPendingItem(item)
    setClearModalOpen(true)
    void existingVendor
  }

  function handleStartNewCart() {
    dispatch(clearCart())
    dispatch(setVendor({ vendor_id: restaurant.id, vendor_name: restaurant.business_name }))
    if (pendingItem) {
      // Re-trigger add after clearing
      dispatch({ type: 'cart/addItem', payload: { id: `ci_${pendingItem.id}`, menu_item_id: pendingItem.id, vendor_id: restaurant.id, vendor_name: restaurant.business_name, name: pendingItem.name, description: pendingItem.description, price: pendingItem.price, quantity: 1, category: pendingItem.category } })
    }
    setClearModalOpen(false)
    setPendingItem(null)
    toast.success('Cart cleared — starting fresh')
  }

  const categoriesInMenu = [...new Set(menu.map((i) => i.category))]

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="relative h-56 bg-[#E4E0D5]">
        <div className="w-full h-full flex items-center justify-center text-7xl">🍛</div>
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
            {restaurant.business_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#1A1814]">{restaurant.business_name}</h1>
            <div className="flex flex-wrap gap-2 mt-1">
              {restaurant.cuisine_tags.map((t) => (
                <span key={t} className="text-xs bg-[#E8D5A3] text-[#B8962E] px-2.5 py-0.5 rounded-full font-medium">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-[#5C5750]">
              <span className="flex items-center gap-1"><Star size={13} fill="#B8962E" stroke="none" /> {restaurant.rating.toFixed(1)} ({restaurant.total_reviews} reviews)</span>
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', restaurant.is_open ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600')}>{restaurant.is_open ? 'Open' : 'Closed'}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#5C5750] flex-shrink-0">
            <span className="flex items-center gap-1.5"><Clock size={14} /> {restaurant.delivery_time_min}–{restaurant.delivery_time_max} min</span>
            <span className="flex items-center gap-1.5"><Bike size={14} /> {restaurant.delivery_fee === 0 ? 'Free delivery' : `${gbp(restaurant.delivery_fee)} delivery`}</span>
            <span className="flex items-center gap-1.5"><ShoppingBag size={14} /> {gbp(restaurant.min_order)} min order</span>
            {restaurant.distance_miles && <span className="flex items-center gap-1.5"><MapPin size={14} /> {restaurant.distance_miles} miles</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex max-w-[1400px] mx-auto px-8 py-6 gap-8">
        {/* Category nav */}
        <nav className="w-[200px] flex-shrink-0 sticky top-20 self-start">
          <ul className="space-y-0.5">
            {categoriesInMenu.map((cat) => (
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

        {/* Menu */}
        <div className="flex-1 min-w-0">
          {categoriesInMenu.map((cat) => (
            <section
              key={cat}
              data-category={cat}
              ref={(el) => { sectionRefs.current[cat] = el }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-[#1A1814] mb-4 pt-2">{cat}</h2>
              {menu.filter((i) => i.category === cat).map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  vendorId={restaurant.id}
                  vendorName={restaurant.business_name}
                  onVendorMismatch={handleVendorMismatch}
                />
              ))}
            </section>
          ))}
          {categoriesInMenu.length === 0 && (
            <div className="text-center py-20 text-[#9C968E]">Menu not available</div>
          )}
        </div>
      </div>

      {/* Cart bar */}
      <CartFloatingBar />

      {/* Clear cart modal */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setClearModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-[#1A1814] text-lg mb-2">Start a new cart?</h3>
            <p className="text-sm text-[#5C5750] mb-6">
              You already have items from <strong>{cartVendorId}</strong>. Adding from <strong>{restaurant.business_name}</strong> will clear your current cart.
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
