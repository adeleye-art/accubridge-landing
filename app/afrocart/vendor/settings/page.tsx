'use client'

import { useState, useRef } from 'react'
import { Store, CreditCard, Bell, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'info' | 'hours' | 'bank' | 'notifications'

interface DayHours {
  closed: boolean
  open: string
  close: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_HOURS: Record<string, DayHours> = Object.fromEntries(
  DAYS.map((d) => [d, { closed: false, open: '11:00', close: '22:00' }])
)

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'info',          label: 'Store Information', icon: <Store size={15} /> },
  { key: 'hours',         label: 'Opening Hours',     icon: <Clock size={15} /> },
  { key: 'bank',          label: 'Bank & Payout',     icon: <CreditCard size={15} /> },
  { key: 'notifications', label: 'Notifications',     icon: <Bell size={15} /> },
]

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        'relative inline-flex w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none',
        value ? 'bg-[#2E7D52]' : 'bg-[#9C968E]'
      )}
    >
      <span className={cn(
        'absolute left-[3px] top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
        value ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<Section>('info')

  // Store info state
  const [businessName, setBusinessName] = useState("Mama's Kitchen")
  const [description,  setDescription]  = useState('Authentic West African cuisine in the heart of Brixton.')
  const [phone,        setPhone]        = useState('+447700900001')
  const [address,      setAddress]      = useState('42 Brixton Road, London SW9 8PD')
  const [logoPreview,  setLogoPreview]  = useState<string | null>(null)
  const [bannerPreview,setBannerPreview]= useState<string | null>(null)
  const [saving,       setSaving]       = useState(false)
  const logoRef   = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  // Hours state
  const [hours, setHours] = useState<Record<string, DayHours>>(DEFAULT_HOURS)

  // Bank state
  const [bankHolder,  setBankHolder]  = useState('')
  const [bankName,    setBankName]    = useState('')
  const [accountNum,  setAccountNum]  = useState('')
  const [sortCode,    setSortCode]    = useState('')
  const [bankSaving,  setBankSaving]  = useState(false)

  // Notifications state
  const [notifs, setNotifs] = useState({
    new_orders:      true,
    order_reminders: true,
    driver_pickup:   true,
    weekly_summary:  true,
    promotional:     false,
  })
  const [notifSaving, setNotifSaving] = useState(false)

  async function handleSaveInfo() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast.success('Store information updated ✓')
  }

  async function handleSaveBank() {
    if (!bankHolder || !bankName || accountNum.length !== 8) {
      toast.error('Please fill in all bank details correctly')
      return
    }
    setBankSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setBankSaving(false)
    toast.success('Bank details submitted for review')
  }

  async function handleSaveNotifs() {
    setNotifSaving(true)
    await new Promise((r) => setTimeout(r, 400))
    setNotifSaving(false)
    toast.success('Notification preferences saved')
  }

  function handleLogoFile(f: File) {
    if (f.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return }
    setLogoPreview(URL.createObjectURL(f))
  }

  function handleBannerFile(f: File) {
    if (f.size > 5 * 1024 * 1024) { toast.error('Banner must be under 5MB'); return }
    setBannerPreview(URL.createObjectURL(f))
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Left nav */}
      <div className="col-span-1">
        <div className="bg-white rounded-xl border border-[#E4E0D5] overflow-hidden">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left border-b border-[#E4E0D5] last:border-0 transition-colors',
                active === item.key
                  ? 'bg-[#B8962E]/10 text-[#B8962E] font-medium border-l-2 border-l-[#B8962E]'
                  : 'text-[#5C5750] hover:bg-[#F7F5F0]'
              )}
            >
              <span className={active === item.key ? 'text-[#B8962E]' : 'text-[#9C968E]'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right content */}
      <div className="col-span-3 space-y-6">

        {/* ── STORE INFORMATION ── */}
        {active === 'info' && (
          <div className="bg-white rounded-xl border border-[#E4E0D5] p-8">
            <h2 className="text-base font-semibold text-[#1A1814] mb-1">Store Information</h2>
            <p className="text-sm text-[#9C968E] mb-6">Update how your store appears on AfroCart</p>

            <div className="space-y-6">
              {/* Logo */}
              <div>
                <p className="text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-3">Store Logo</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#E4E0D5] overflow-hidden flex items-center justify-center flex-shrink-0">
                    {logoPreview
                      ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      : <span className="text-2xl font-bold text-[#B8962E]">M</span>
                    }
                  </div>
                  <div>
                    <button
                      onClick={() => logoRef.current?.click()}
                      className="text-sm text-[#B8962E] hover:underline font-medium"
                    >
                      Change Logo
                    </button>
                    <p className="text-xs text-[#9C968E] mt-0.5">JPG or PNG, max 2MB</p>
                  </div>
                </div>
                <input ref={logoRef} type="file" accept=".jpg,.jpeg,.png" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f) }} />
              </div>

              {/* Banner */}
              <div>
                <p className="text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-3">Store Banner</p>
                <div
                  className="h-36 bg-[#E4E0D5] rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => bannerRef.current?.click()}
                >
                  {bannerPreview
                    ? <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                    : <p className="text-xs text-[#9C968E]">Click to upload banner (JPG/PNG, max 5MB)</p>
                  }
                </div>
                <input ref={bannerRef} type="file" accept=".jpg,.jpeg,.png" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerFile(f) }} />
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">Business Name *</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-[#1A1814] bg-white" />
              </div>

              {/* Business Type (read-only) */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">Business Type</label>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-amber-100 text-amber-800">
                    Restaurant
                  </span>
                  <p className="text-xs text-[#9C968E]">Contact support to change business type</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">
                  Business Description
                  <span className="float-right font-normal normal-case text-[#9C968E]">{description.length}/500</span>
                </label>
                <textarea rows={4} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your store, specialties, and what makes you unique"
                  className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-[#1A1814] bg-white resize-none" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-[#1A1814] bg-white" />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">Business Address</label>
                <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-[#1A1814] bg-white resize-none" />
              </div>

              <Button variant="primary" size="md" className="w-full" loading={saving} onClick={handleSaveInfo}>
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* ── OPENING HOURS ── */}
        {active === 'hours' && (
          <div className="bg-white rounded-xl border border-[#E4E0D5] p-8">
            <h2 className="text-base font-semibold text-[#1A1814] mb-1">Operating Hours</h2>
            <p className="text-sm text-[#9C968E] mb-6">Set when your store accepts orders each day</p>

            <div className="space-y-3">
              {DAYS.map((day) => {
                const h = hours[day]
                return (
                  <div key={day} className="flex items-center gap-4 py-2 border-b border-[#F7F5F0] last:border-0">
                    <span className="w-24 text-sm font-medium text-[#1A1814] flex-shrink-0">{day}</span>

                    <div className="flex items-center gap-2">
                      <Toggle
                        value={!h.closed}
                        onChange={(v) => setHours((prev) => ({ ...prev, [day]: { ...prev[day], closed: !v } }))}
                      />
                      <span className="text-xs text-[#9C968E] w-12">{h.closed ? 'Closed' : 'Open'}</span>
                    </div>

                    <div className={cn('flex items-center gap-2 transition-opacity', h.closed && 'opacity-30 pointer-events-none')}>
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) => setHours((prev) => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                        className="border border-[#E4E0D5] rounded-lg px-2 py-1.5 text-sm text-[#1A1814] focus:outline-none focus:border-gold"
                      />
                      <span className="text-xs text-[#9C968E]">to</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => setHours((prev) => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                        className="border border-[#E4E0D5] rounded-lg px-2 py-1.5 text-sm text-[#1A1814] focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <Button variant="primary" size="md" className="w-full mt-6" loading={saving} onClick={async () => {
              setSaving(true)
              await new Promise((r) => setTimeout(r, 500))
              setSaving(false)
              toast.success('Opening hours updated ✓')
            }}>
              Save Hours
            </Button>
          </div>
        )}

        {/* ── BANK & PAYOUT ── */}
        {active === 'bank' && (
          <div className="space-y-5">
            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800">
              Your payouts are processed every Friday. Changes take effect from the next payout cycle.
            </div>

            <div className="bg-white rounded-xl border border-[#E4E0D5] p-8">
              <h2 className="text-base font-semibold text-[#1A1814] mb-1">Bank & Payout Details</h2>
              <p className="text-sm text-[#9C968E] mb-5">Current account on file</p>

              {/* Current masked */}
              <div className="bg-[#F7F5F0] rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9C968E]">Bank</span>
                  <span className="text-[#1A1814] font-medium">Barclays Bank</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9C968E]">Account</span>
                  <span className="text-[#1A1814] font-medium">****1234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9C968E]">Sort Code</span>
                  <span className="text-[#1A1814] font-medium">**-**-**</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">Account Holder Name</label>
                  <input value={bankHolder} onChange={(e) => setBankHolder(e.target.value)}
                    placeholder="As it appears on your bank account"
                    className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold text-[#1A1814] bg-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">Bank Name</label>
                  <input value={bankName} onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Barclays, NatWest, Monzo"
                    className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold text-[#1A1814] bg-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">Account Number (8 digits)</label>
                  <input value={accountNum} maxLength={8} onChange={(e) => setAccountNum(e.target.value.replace(/\D/g, ''))}
                    placeholder="12345678"
                    className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold text-[#1A1814] bg-white" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9C968E] font-medium mb-1.5">Sort Code (XX-XX-XX)</label>
                  <input value={sortCode} maxLength={8} onChange={(e) => setSortCode(e.target.value)}
                    placeholder="12-34-56"
                    className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold text-[#1A1814] bg-white" />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
                  For security, bank detail changes are reviewed by our team within 24 hours before taking effect.
                </div>

                <Button variant="outline" size="md" className="w-full" loading={bankSaving} onClick={handleSaveBank}>
                  Update Bank Details
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {active === 'notifications' && (
          <div className="bg-white rounded-xl border border-[#E4E0D5] p-8">
            <h2 className="text-base font-semibold text-[#1A1814] mb-1">Notification Preferences</h2>
            <p className="text-sm text-[#9C968E] mb-6">Control how and when AfroCart contacts you</p>

            <div className="space-y-5">
              {([
                { key: 'new_orders',      label: 'New Order Alerts',       sub: 'Get notified immediately when a new order arrives' },
                { key: 'order_reminders', label: 'Order Reminders',        sub: "Reminders if an order hasn't been accepted in 5 min" },
                { key: 'driver_pickup',   label: 'Driver Pickup Alert',    sub: 'When a driver is on the way to collect an order' },
                { key: 'weekly_summary',  label: 'Weekly Earnings Summary',sub: 'Email summary of your weekly performance' },
                { key: 'promotional',     label: 'Promotional Emails',     sub: 'AfroCart updates, feature releases, and tips' },
              ] as { key: keyof typeof notifs; label: string; sub: string }[]).map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-[#F7F5F0] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#1A1814]">{item.label}</p>
                    <p className="text-xs text-[#9C968E] mt-0.5">{item.sub}</p>
                  </div>
                  <Toggle
                    value={notifs[item.key]}
                    onChange={(v) => setNotifs((prev) => ({ ...prev, [item.key]: v }))}
                  />
                </div>
              ))}
            </div>

            <Button variant="primary" size="md" className="w-full mt-6" loading={notifSaving} onClick={handleSaveNotifs}>
              Save Preferences
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
