'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/swidexAuthSlice'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  ShoppingBasket,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    label: 'Portal',
    href: '/portal',
    icon: LayoutDashboard,
    description: 'App launcher',
  },
  {
    label: 'AfroCart',
    href: '/afrocart',
    icon: ShoppingBasket,
    description: 'Marketplace & logistics',
    accent: '#E8732A',
  },
  {
    label: 'AccuBridge',
    href: '/accubridge',
    icon: BarChart3,
    description: 'Finance & compliance',
    accent: '#3B6EE8',
  },
  {
    label: 'Settings',
    href: '/portal/settings',
    icon: Settings,
    description: 'Account & preferences',
  },
]

export function PortalSidebar() {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { user } = useAuth()

  const handleLogout = () => {
    dispatch(logout())
    window.location.href = '/login'
  }

  return (
    <aside className="w-64 flex flex-col bg-sidebar text-white shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center shrink-0">
            <span className="text-sidebar font-bold text-base leading-none">S</span>
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Swidex</p>
            <p className="text-xs text-white/50 leading-tight">by AfroCart</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/portal'
              ? pathname === '/portal'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{
                  backgroundColor: isActive && item.accent
                    ? `${item.accent}22`
                    : 'transparent',
                }}
              >
                <Icon
                  size={16}
                  style={{ color: isActive && item.accent ? item.accent : 'currentColor' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{item.label}</p>
                <p className="text-[11px] text-white/40 leading-tight mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
              {isActive && <ChevronRight size={14} className="text-white/40 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
            <span className="text-gold font-semibold text-sm uppercase">
              {user?.name?.[0] ?? user?.email?.[0] ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white leading-tight truncate">
              {user?.name ?? 'User'}
            </p>
            <p className="text-[11px] text-white/40 leading-tight truncate">
              {user?.email ?? ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all mt-1"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <LogOut size={16} />
          </div>
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
