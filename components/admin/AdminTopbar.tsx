'use client'

import { usePathname } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/store/swidexAuthSlice'
import type { AppDispatch } from '@/store'

const PAGE_TITLES: Record<string, string> = {
  '/afrocart/admin/dashboard': 'Overview',
  '/afrocart/admin/vendors':   'Vendor Management',
  '/afrocart/admin/orders':    'Order Monitor',
  '/afrocart/admin/drivers':   'Driver Management',
  '/afrocart/admin/referrals': 'Referrals & Credits',
  '/afrocart/admin/settings':  'Settings',
}

export function AdminTopbar() {
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const router   = useRouter()
  const { user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const title = PAGE_TITLES[pathname] ?? 'Admin'

  function handleLogout() {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-[240px] right-0 h-16 bg-surface border-b border-surface-dark z-10 flex items-center px-8 gap-4">
      <h1 className="text-lg font-semibold text-text-primary tracking-tight flex-1">{title}</h1>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-8 pr-4 py-2 text-sm bg-white border border-surface-dark rounded-lg w-52 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-text-primary placeholder:text-text-muted"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-surface-dark transition-colors">
        <Bell size={18} className="text-text-secondary" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full" />
      </button>

      {/* Avatar dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg hover:bg-surface-dark px-2 py-1.5 transition-colors"
        >
          <Avatar name={user?.name ?? 'Admin'} size="sm" />
          <ChevronDown size={14} className="text-text-muted" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-surface-dark shadow-lg z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-dark">
                <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
