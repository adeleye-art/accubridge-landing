'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  TrendingUp,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { StoreStatusToggle } from './StoreStatusToggle'
import { logout } from '@/store/swidexAuthSlice'
import { useAuth } from '@/hooks/useAuth'
import type { AppDispatch } from '@/store'
import type { VendorProfile, VendorOrder } from '@/types'

const NAV_ITEMS = [
  { label: 'Dashboard',       href: '/afrocart/vendor/dashboard', icon: LayoutDashboard },
  { label: 'Orders',          href: '/afrocart/vendor/orders',    icon: ShoppingBag, hasBadge: true },
  { label: 'Menu & Products', href: '/afrocart/vendor/menu',      icon: UtensilsCrossed },
  { label: 'Earnings',        href: '/afrocart/vendor/earnings',  icon: TrendingUp },
  { label: 'Store Settings',  href: '/afrocart/vendor/settings',  icon: Settings },
]

interface VendorSidebarProps {
  store: VendorProfile
  incomingOrders: VendorOrder[]
  isOpen: boolean
  onStoreToggle: (val: boolean) => void
}

export function VendorSidebar({ store, incomingOrders, isOpen, onStoreToggle }: VendorSidebarProps) {
  const pathname  = usePathname()
  const dispatch  = useDispatch<AppDispatch>()
  const router    = useRouter()
  const { user }  = useAuth()
  const incomingCount = incomingOrders.length

  function handleLogout() {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#1E1B16] flex flex-col z-20">
      {/* Store identity */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#B8962E] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.business_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#1E1B16] font-bold text-base">
                {store.business_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[#C9A84C] font-semibold text-sm truncate">{store.business_name}</p>
            <span className="text-xs bg-[#B8962E]/20 text-[#C9A84C] rounded-full px-2 py-0.5 capitalize">
              {store.business_type === 'restaurant' ? 'Restaurant' : 'Store'}
            </span>
          </div>
        </div>

        {/* Open/Closed toggle */}
        <div className="flex items-center gap-3 px-1 py-1">
          <span className="text-[#9C968E] text-xs w-8">Store</span>
          <StoreStatusToggle isOpen={isOpen} onChange={onStoreToggle} />
          <span className={cn('text-xs font-medium', isOpen ? 'text-[#2E7D52]' : 'text-[#9C968E]')}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="mx-4 border-t border-white/10 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const badge = item.hasbadge && incomingCount > 0 ? incomingCount : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#B8962E] text-[#1E1B16] font-medium'
                  : 'text-[#9C968E] hover:text-[#C9A84C] hover:bg-white/5'
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.hasBadge && incomingCount > 0 && (
                <span className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  isActive ? 'bg-[#1E1B16] text-[#B8962E]' : 'bg-red-500 text-white'
                )}>
                  {incomingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mx-4 border-t border-white/10 my-3" />

      {/* Profile */}
      <div className="px-4 pb-5 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <Avatar name={user?.name ?? store.business_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-[#C9A84C] text-xs font-semibold truncate">{user?.name ?? 'Vendor'}</p>
            <p className="text-[#5C5750] text-xs truncate">{store.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#9C968E] hover:text-red-400 hover:bg-white/5 transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  )
}
