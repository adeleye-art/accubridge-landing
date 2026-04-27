'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Truck,
  Gift,
  Percent,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { useGetOrdersQuery, useGetDriversQuery } from '@/store/api/adminApi'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Vendor Management', href: '/admin/vendors', icon: Store },
  { label: 'Order Monitor', href: '/admin/orders', icon: ShoppingBag, badge: true },
  { label: 'Driver Management', href: '/admin/drivers', icon: Truck, driverBadge: true },
  { label: 'Referrals & Credits', href: '/admin/referrals', icon: Gift },
  { label: 'Commissions', href: '/admin/settings', icon: Percent },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { data: pendingOrders } = useGetOrdersQuery({ status: 'pending' })
  const { data: pendingDrivers } = useGetDriversQuery({ approval_status: 'pending' })

  const pendingCount = pendingOrders?.length ?? 0
  const pendingDriverCount = pendingDrivers?.length ?? 0

  function handleLogout() {
    logout()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-sidebar flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center flex-shrink-0">
            <span className="text-sidebar font-bold text-sm">A</span>
          </div>
          <span className="text-gold-light font-semibold text-lg tracking-tight">AfroCart</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-[#5C5750] ml-[42px]">Admin Portal</p>
      </div>

      <div className="mx-4 border-t border-white/10 mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/settings' && pathname.startsWith(item.href))
          const badgeCount = item.badge ? pendingCount : item.driverBadge ? pendingDriverCount : 0

          return (
            <Link
              key={item.label + item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                isActive
                  ? 'bg-gold text-sidebar font-medium'
                  : 'text-[#9C968E] hover:text-gold-light hover:bg-white/5'
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span
                  className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    isActive ? 'bg-sidebar text-gold' : 'bg-gold text-sidebar'
                  )}
                >
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mx-4 border-t border-white/10 my-3" />

      {/* Profile + Logout */}
      <div className="px-4 pb-5 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <Avatar name={user?.name ?? 'Admin'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-gold-light text-xs font-semibold truncate">
              {user?.name ?? 'Super Admin'}
            </p>
            <p className="text-[#5C5750] text-xs truncate">{user?.email}</p>
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
