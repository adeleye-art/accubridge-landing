'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { logout } from '@/store/swidexAuthSlice'
import type { AppDispatch } from '@/store'
import type { AfroCartRole, VerifyBridgeRole } from '@/types/swidex'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Receipt,
  ShoppingBasket,
  Bell,
  ArrowRight,
  TrendingUp,
  FileText,
  Briefcase,
  LogOut,
  ChevronRight,
} from 'lucide-react'

// ─── Routing helpers ──────────────────────────────────────────────────────────
const AFROCART_DASHBOARDS: Record<AfroCartRole, string> = {
  admin:    '/afrocart/admin/dashboard',
  vendor:   '/afrocart/vendor/dashboard',
  driver:   '/afrocart/driver/dashboard',
  customer: '/afrocart/customer/home',
}
const VB_DASHBOARDS: Record<VerifyBridgeRole, string> = {
  admin:  '/accubridge/admin/dashboard',
  staff:  '/accubridge/staff/dashboard',
  client: '/accubridge/client/dashboard',
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const RECENT_TRANSACTIONS = [
  { date: '12 Aug', description: 'Transfer to UK',      amount: '₦200,000', status: 'Completed',  statusColor: '#10B981' },
  { date: '10 Aug', description: 'AfroCart Order',      amount: '₦8,500',   status: 'Delivered',  statusColor: '#F97316' },
  { date: '08 Aug', description: 'VAT Payment',         amount: '₦45,000',  status: 'Paid',       statusColor: '#10B981' },
  { date: '05 Aug', description: 'Payroll Disbursement', amount: '₦120,000', status: 'Processed',  statusColor: '#8B5CF6' },
]

const QUICK_STATS = [
  { label: 'Active Orders',          count: 5,  icon: ShoppingBasket, accent: '#3B6EE8' },
  { label: 'Pending VAT Returns',    count: 2,  icon: FileText,        accent: '#F97316' },
  { label: 'Funding Applications',   count: 1,  icon: Briefcase,       accent: '#8B5CF6' },
]

const SIDEBAR_NAV = [
  { label: 'Dashboard', href: '/portal',           icon: LayoutDashboard },
  { label: 'Accounting', href: '/accubridge/enroll', icon: BookOpen },
  { label: 'Payroll',    href: '/portal',           icon: Users },
  { label: 'VAT / Tax',  href: '/portal',           icon: Receipt },
  { label: 'AfroCart',   href: '/afrocart/onboard', icon: ShoppingBasket },
]

const TOP_NAV = [
  { label: 'Dashboard',      href: '/portal' },
  { label: 'Business Tools', href: '/portal' },
  { label: 'Marketplace',    href: '/afrocart/onboard' },
  { label: 'Payments',       href: '/portal' },
  { label: 'Funding Access', href: '/portal' },
]

export default function PortalPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const { afrocartRole, verifybrigeRole } = useRole()
  const [activeTop, setActiveTop] = useState('Dashboard')

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const fullName  = user?.name ?? 'User'
  const initials  = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const afroHref = afrocartRole ? AFROCART_DASHBOARDS[afrocartRole] : '/afrocart/onboard'
  const vbHref   = verifybrigeRole ? VB_DASHBOARDS[verifybrigeRole] : '/accubridge/enroll'

  const APP_CARDS = [
    {
      label:       'Business Tools',
      sub:         'Manage Finances & Taxes',
      href:        vbHref,
      gradient:    'linear-gradient(135deg, #3B6EE8 0%, #1A3A9A 100%)',
      icon:        '💼',
      enrolled:    !!verifybrigeRole,
    },
    {
      label:       'AfroCart Marketplace',
      sub:         'Order Food & Groceries',
      href:        afroHref,
      gradient:    'linear-gradient(135deg, #FF8C42 0%, #D4500A 100%)',
      icon:        '🛒',
      enrolled:    !!afrocartRole,
    },
    {
      label:       'Global Transfers',
      sub:         'Send Money Internationally',
      href:        '/portal',
      gradient:    'linear-gradient(135deg, #7B8FF0 0%, #4338CA 100%)',
      icon:        '₦→£',
      enrolled:    true,
    },
  ]

  function handleLogout() {
    dispatch(logout())
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col h-screen bg-[#F2F4F8] overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex items-center h-[60px] bg-white border-b border-[#E5E7EB] px-6 shrink-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 w-[200px] shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B6EE8, #1A3A9A)' }}>
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-[#1A1A2E] text-base tracking-tight">Swidex Pay</span>
        </div>

        {/* Top nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {TOP_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setActiveTop(item.label)}
              className="px-4 py-2 text-sm font-medium transition-colors relative"
              style={{ color: activeTop === item.label ? '#3B6EE8' : '#6B7280' }}
            >
              {item.label}
              {activeTop === item.label && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#3B6EE8]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right: notifications + user */}
        <div className="flex items-center gap-4">
          <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#F2F4F8] transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #3B6EE8, #7B8FF0)' }}>
              {initials}
            </div>
            <span className="text-sm font-medium text-[#1A1A2E]">{fullName}</span>
          </div>
        </div>
      </header>

      {/* ── BODY (sidebar + main) ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="w-[200px] shrink-0 flex flex-col overflow-y-auto"
          style={{ background: 'linear-gradient(180deg, #1A1F6E 0%, #12175A 100%)' }}>

          {/* Nav items */}
          <nav className="flex-1 px-3 pt-5 space-y-0.5">
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon
              const isActive = item.label === 'Dashboard'
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={13} className="ml-auto opacity-60" />}
                </Link>
              )
            })}
          </nav>

          {/* Transfer Funds widget */}
          <div className="mx-3 mb-4 rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
              Transfer Funds
            </p>
            <p className="text-[11px] text-white/50 mb-0.5">Wallet Balance</p>
            <p className="text-xl font-bold text-white mb-4">₦50,254.00</p>
            <button className="w-full h-9 rounded-lg text-sm font-semibold text-white mb-2 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              Send Money
            </button>
            <button className="w-full h-9 rounded-lg text-sm font-semibold text-white/80 transition-colors hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.25)' }}>
              Convert Currency
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 mx-3 mb-4 px-3 py-2.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <LogOut size={15} />
            <span className="text-sm">Sign out</span>
          </button>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Welcome */}
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">
            Welcome Back, {firstName}!
          </h1>

          {/* App cards row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {APP_CARDS.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="relative rounded-2xl p-6 text-white overflow-hidden group transition-transform hover:scale-[1.02] hover:shadow-xl"
                style={{ background: card.gradient, minHeight: '140px' }}
              >
                {/* Decorative circle */}
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                <div className="absolute -right-2 bottom-4 w-16 h-16 rounded-full bg-white/8" />

                {/* Icon */}
                <div className="relative mb-4">
                  {card.icon === '₦→£' ? (
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold text-lg tracking-tight">₦→£</span>
                    </div>
                  ) : card.icon === '💼' ? (
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Briefcase size={26} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                      <ShoppingBasket size={26} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <p className="font-bold text-base leading-tight">{card.label}</p>
                  <p className="text-sm text-white/75 mt-0.5">{card.sub}</p>
                </div>

                {!card.enrolled && (
                  <span className="absolute top-4 right-4 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    Set up
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Bottom two-col grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#1A1A2E] mb-4">Quick Stats</h2>
              <div className="space-y-3">
                {QUICK_STATS.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: '#F8F9FF' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${stat.accent}18` }}>
                        <Icon size={16} style={{ color: stat.accent }} />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[#374151]">{stat.label}</span>
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: stat.accent }}>
                        {stat.count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[#1A1A2E]">Recent Transactions</h2>
                <button className="flex items-center gap-1 text-sm font-medium text-[#3B6EE8] hover:underline">
                  View All <ArrowRight size={13} />
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider pb-2 pr-3">Date</th>
                    <th className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider pb-2 pr-3">Description</th>
                    <th className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider pb-2 pr-3">Amount</th>
                    <th className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {RECENT_TRANSACTIONS.map((tx, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-3 text-sm text-[#6B7280] whitespace-nowrap">{tx.date}</td>
                      <td className="py-2.5 pr-3 text-sm font-medium text-[#111827] whitespace-nowrap">{tx.description}</td>
                      <td className="py-2.5 pr-3 text-sm font-semibold text-[#111827] whitespace-nowrap">{tx.amount}</td>
                      <td className="py-2.5 text-sm font-semibold whitespace-nowrap"
                        style={{ color: tx.statusColor }}>{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-4">

            {/* Referral Rewards */}
            <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="flex-1">
                <h2 className="text-base font-bold text-[#1A1A2E] mb-1">Referral Rewards</h2>
                <p className="text-sm text-[#6B7280] mb-4">Refer &amp; Earn ₦5,000 Credit</p>
                <button
                  className="h-9 px-5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7B5CF6, #4338CA)' }}>
                  Invite Friends
                </button>
              </div>
              {/* Illustration placeholder */}
              <div className="shrink-0 w-20 h-16 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)' }}>
                <span className="text-3xl">🛍️</span>
              </div>
            </div>

            {/* Funding Readiness Score */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#1A1A2E] mb-1">Funding Readiness Score</h2>
              <div className="flex items-end gap-3 mb-4">
                <p className="text-sm text-[#6B7280]">Score:</p>
                <p className="text-4xl font-black text-[#1A1A2E] leading-none">72</p>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F3F4F6] mb-4">
                <div className="h-2 rounded-full" style={{ width: '72%', background: 'linear-gradient(90deg, #3B6EE8, #7B8FF0)' }} />
              </div>
              <button
                className="h-9 px-5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3B6EE8, #1A3A9A)' }}>
                Get Funding Ready
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
