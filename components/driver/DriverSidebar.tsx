'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, Navigation, Clock, BarChart2, User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { selectDriverIsOnline, selectHasActiveDelivery } from '@/store/driverSlice'
import { OnlineStatusToggle } from './OnlineStatusToggle'

const NAV_ITEMS = [
  { href: '/afrocart/driver/dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/afrocart/driver/jobs',      label: 'Jobs',       Icon: Briefcase       },
  { href: '/afrocart/driver/active',    label: 'Active',     Icon: Navigation      },
  { href: '/afrocart/driver/history',   label: 'History',    Icon: Clock           },
  { href: '/afrocart/driver/earnings',  label: 'Earnings',   Icon: BarChart2       },
  { href: '/afrocart/driver/profile',   label: 'Profile',    Icon: User            },
]

export function DriverSidebar() {
  const pathname         = usePathname()
  const isOnline         = useSelector(selectDriverIsOnline)
  const hasActiveDelivery = useSelector(selectHasActiveDelivery)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#1E1B16] flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <span className="text-lg font-bold text-white">
          Afro<span className="text-[#B8962E]">Cart</span>
          <span className="text-xs font-normal text-[#9C968E] ml-2">Driver</span>
        </span>
      </div>

      {/* Online toggle */}
      <div className="px-4 py-4 border-b border-white/10">
        <OnlineStatusToggle hasActiveDelivery={hasActiveDelivery} size="lg" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#B8962E]/20 text-[#B8962E]'
                      : 'text-[#9C968E] hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon size={18} />
                  {label}
                  {label === 'Active' && hasActiveDelivery && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[#2E7D52] animate-pulse" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Status pill at bottom */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-2.5 h-2.5 rounded-full',
            isOnline ? 'bg-[#2E7D52] animate-pulse' : 'bg-[#5C5750]'
          )} />
          <span className="text-xs text-[#9C968E]">
            {isOnline ? 'Online — accepting jobs' : 'Offline'}
          </span>
        </div>
      </div>
    </aside>
  )
}
