'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCart, Bell, MapPin, ChevronDown, User, Package, Wallet, Gift, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { selectCartCount } from '@/store/cartSlice'
import { logout } from '@/store/swidexAuthSlice'
import { useAuth } from '@/hooks/useAuth'
import { LocationModal } from './LocationModal'
import type { AppDispatch } from '@/store'

const NAV_LINKS = [
  { label: 'Home',     href: '/afrocart/customer/home' },
  { label: 'Eats',     href: '/afrocart/customer/eats' },
  { label: 'Market',   href: '/afrocart/customer/market' },
  { label: 'Delivery', href: '/afrocart/customer/delivery' },
]

export function CustomerTopnav() {
  const pathname = usePathname()
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const cartCount = useSelector(selectCartCount)

  const [locationOpen, setLocationOpen] = useState(false)
  const [location, setLocation]         = useState('Peckham, London')
  const [accountOpen, setAccountOpen]   = useState(false)

  function handleLogout() {
    dispatch(logout())
    router.push('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-[#EFECE5] border-b border-[#E4E0D5] flex items-center px-6 gap-6">

        {/* Logo */}
        <Link href="/afrocart/customer/home" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#B8962E] flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-[#1A1814] text-base tracking-tight">AfroCart</span>
        </Link>

        {/* Centre nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                  active
                    ? 'text-[#B8962E] border-[#B8962E]'
                    : 'text-[#5C5750] border-transparent hover:text-[#1A1814]'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-auto">

          {/* Location */}
          <button
            onClick={() => setLocationOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-sm text-[#5C5750] hover:text-[#1A1814] transition-colors"
          >
            <MapPin size={15} className="text-[#B8962E]" />
            <span className="max-w-[140px] truncate">{location}</span>
            <ChevronDown size={13} />
          </button>

          {/* Cart */}
          <Link href="/afrocart/customer/cart" className="relative p-2 hover:bg-[#E4E0D5] rounded-lg transition-colors">
            <ShoppingCart size={20} className="text-[#1A1814]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#B8962E] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Bell */}
          <button className="relative p-2 hover:bg-[#E4E0D5] rounded-lg transition-colors">
            <Bell size={20} className="text-[#1A1814]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setAccountOpen((o) => !o)}
              className="w-9 h-9 rounded-full bg-[#B8962E] flex items-center justify-center text-white font-semibold text-sm hover:bg-[#A07828] transition-colors"
            >
              {initials}
            </button>

            {accountOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                <div className="absolute right-0 top-11 z-20 w-52 bg-white border border-[#E4E0D5] rounded-xl shadow-lg py-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E4E0D5]">
                    <p className="text-sm font-semibold text-[#1A1814] truncate">{user?.name}</p>
                    <p className="text-xs text-[#9C968E] truncate">{user?.email}</p>
                  </div>
                  {[
                    { icon: Package,  label: 'My Orders', href: '/afrocart/customer/orders' },
                    { icon: Wallet,   label: 'Wallet',    href: '/afrocart/customer/account?tab=wallet' },
                    { icon: Gift,     label: 'Referral',  href: '/afrocart/customer/account?tab=referral' },
                    { icon: User,     label: 'Account',   href: '/afrocart/customer/account' },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5C5750] hover:bg-[#F7F5F0] hover:text-[#1A1814] transition-colors"
                    >
                      <Icon size={15} />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-[#E4E0D5] mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <LocationModal
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onConfirm={(loc) => setLocation(loc)}
      />
    </>
  )
}
