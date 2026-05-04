'use client'

import { useState } from 'react'
import { User, MapPin, Bell, Shield, LogOut, Plus, Trash2, ChevronRight, Loader2, Check } from 'lucide-react'
import { WalletBalanceCard } from '@/components/customer/WalletBalanceCard'
import { TransactionRow } from '@/components/customer/TransactionRow'
import { ReferralCodeBox } from '@/components/customer/ReferralCodeBox'
import { ReferralFriendRow } from '@/components/customer/ReferralFriendRow'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Address, WalletTransaction, ReferralStatus } from '@/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROFILE = {
  full_name:   'Adeyemi Okonkwo',
  email:       'adeyemi@example.com',
  phone:       '+44 7700 900123',
  avatar_url:  '',
}

const MOCK_ADDRESSES: Address[] = [
  { id: 'a1', label: 'Home', full_address: '42 Peckham High Street, London SE15 5EB', postcode: 'SE15 5EB', is_default: true },
  { id: 'a2', label: 'Work', full_address: '10 Canada Square, Canary Wharf, London E14 5AB', postcode: 'E14 5AB', is_default: false },
]

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  { id: 't1', amount:  200, type: 'earned',   reason: 'Referral reward — Funmilayo joined',      created_at: new Date(Date.now() - 3  * 24 * 3600000).toISOString() },
  { id: 't2', amount:  200, type: 'deducted',  reason: 'Used on order #AC-00398',                 created_at: new Date(Date.now() - 2  * 24 * 3600000).toISOString() },
  { id: 't3', amount:  500, type: 'earned',   reason: 'Referral reward — Chukwuemeka joined',    created_at: new Date(Date.now() - 5  * 24 * 3600000).toISOString() },
  { id: 't4', amount:  150, type: 'refunded',  reason: 'Refund for cancelled order #AC-00390',   created_at: new Date(Date.now() - 5  * 24 * 3600000 + 10 * 60000).toISOString() },
  { id: 't5', amount: 1000, type: 'earned',   reason: 'Welcome bonus',                           created_at: new Date(Date.now() - 14 * 24 * 3600000).toISOString() },
]

const MOCK_REFERRAL: ReferralStatus = {
  my_code:        'ADEYEMI10',
  total_referred:  2,
  total_earned:    700,
  referrals: [
    { name: 'Funmilayo A.', orders_completed: 3, reward_status: 'paid',    joined_at: new Date(Date.now() - 3  * 24 * 3600000).toISOString() },
    { name: 'Chukwuemeka B.', orders_completed: 1, reward_status: 'pending', joined_at: new Date(Date.now() - 5  * 24 * 3600000).toISOString() },
  ],
}

const WALLET_BALANCE = 1650 // pence

type Section = 'profile' | 'wallet' | 'referral' | 'addresses' | 'notifications' | 'security'

const NAV_ITEMS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: 'profile',       label: 'Profile',         icon: User },
  { key: 'wallet',        label: 'Wallet',          icon: ({ size }: { size: number }) => <span className="text-base leading-none">🪙</span> },
  { key: 'referral',      label: 'Refer & Earn',    icon: ({ size }: { size: number }) => <span className="text-base leading-none">🎁</span> },
  { key: 'addresses',     label: 'Saved Addresses', icon: MapPin },
  { key: 'notifications', label: 'Notifications',   icon: Bell },
  { key: 'security',      label: 'Security',        icon: Shield },
]

function gbp(pence: number) { return `£${(pence / 100).toFixed(2)}` }

export default function AccountPage() {
  const [section,   setSection]   = useState<Section>('profile')
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES)

  // Profile form
  const [profile,  setProfile]  = useState(MOCK_PROFILE)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  // Add address
  const [showAddAddr, setShowAddAddr] = useState(false)
  const [newAddr, setNewAddr] = useState({ label: 'Home', full_address: '', postcode: '', is_default: false })

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    order_updates:   true,
    promotions:      true,
    referral_alerts: true,
    delivery_alerts: true,
  })

  async function handleSaveProfile() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    toast.success('Profile updated')
    setTimeout(() => setSaved(false), 2000)
  }

  function handleSaveAddress() {
    if (!newAddr.full_address.trim() || !newAddr.postcode.trim()) return
    const addr: Address = { id: `a${Date.now()}`, ...newAddr }
    setAddresses((prev) => [...prev, addr])
    setShowAddAddr(false)
    setNewAddr({ label: 'Home', full_address: '', postcode: '', is_default: false })
    toast.success('Address saved')
  }

  function handleRemoveAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    toast.success('Address removed')
  }

  function handleSetDefault(id: string) {
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })))
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-[#1A1814] mb-6">My Account</h1>

      <div className="flex gap-8 items-start">
        {/* LEFT — sidebar nav */}
        <aside className="w-[240px] flex-shrink-0 sticky top-24">
          {/* Avatar */}
          <div className="flex flex-col items-center py-6 bg-white rounded-2xl border border-[#E4E0D5] mb-3">
            <div className="w-16 h-16 rounded-full bg-[#B8962E]/20 flex items-center justify-center font-bold text-[#B8962E] text-2xl mb-3">
              {profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <p className="font-semibold text-[#1A1814] text-sm">{profile.full_name}</p>
            <p className="text-xs text-[#9C968E]">{profile.email}</p>
          </div>

          <nav className="bg-white rounded-2xl border border-[#E4E0D5] overflow-hidden">
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-[#E4E0D5] last:border-b-0',
                  section === key
                    ? 'bg-[#E8D5A3]/30 text-[#B8962E] font-medium'
                    : 'text-[#5C5750] hover:bg-[#F7F5F0] hover:text-[#1A1814]'
                )}
              >
                <Icon size={16} />
                <span>{label}</span>
                <ChevronRight size={13} className="ml-auto opacity-40" />
              </button>
            ))}

            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C0392B] hover:bg-red-50 transition-colors">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* RIGHT — section content */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ─────────────────────────────────────────────────── */}
          {section === 'profile' && (
            <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6 space-y-5">
              <h2 className="font-semibold text-[#1A1814]">Personal Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] text-[#1A1814] bg-[#F7F5F0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] text-[#1A1814] bg-[#F7F5F0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] text-[#1A1814] bg-[#F7F5F0]"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2.5 bg-[#B8962E] text-white rounded-xl font-semibold text-sm hover:bg-[#A07828] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving  ? <><Loader2 size={15} className="animate-spin" /> Saving...</> :
                 saved   ? <><Check size={15} /> Saved!</> :
                           'Save Changes'}
              </button>

              <div className="border-t border-[#E4E0D5] pt-5">
                <h3 className="font-semibold text-[#1A1814] mb-1">Delete Account</h3>
                <p className="text-sm text-[#9C968E] mb-3">Once deleted, your account and all data will be permanently removed.</p>
                <button className="px-4 py-2 border border-red-200 text-[#C0392B] rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                  Delete my account
                </button>
              </div>
            </div>
          )}

          {/* ── Wallet ──────────────────────────────────────────────────── */}
          {section === 'wallet' && (
            <div className="space-y-5">
              <WalletBalanceCard balance={WALLET_BALANCE} />

              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                <h2 className="font-semibold text-[#1A1814] mb-4">Transaction History</h2>
                {MOCK_TRANSACTIONS.length === 0 ? (
                  <p className="text-sm text-[#9C968E] py-6 text-center">No transactions yet</p>
                ) : (
                  <div className="divide-y divide-[#E4E0D5]">
                    {MOCK_TRANSACTIONS.map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#F7F5F0] rounded-2xl border border-[#E4E0D5] p-5">
                <h3 className="font-semibold text-[#1A1814] mb-2 text-sm">How to earn credits</h3>
                <ul className="space-y-2 text-sm text-[#5C5750]">
                  <li className="flex items-start gap-2"><span className="text-[#B8962E]">•</span> Refer friends — earn £5 each time they place their 1st order</li>
                  <li className="flex items-start gap-2"><span className="text-[#B8962E]">•</span> Complete challenges in the app for bonus credits</li>
                  <li className="flex items-start gap-2"><span className="text-[#B8962E]">•</span> Credits are automatically applied at checkout</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Referral ─────────────────────────────────────────────────── */}
          {section === 'referral' && (
            <div className="space-y-5">
              {/* Hero */}
              <div className="bg-[#1E1B16] rounded-2xl p-6 text-white">
                <p className="text-lg font-bold mb-1">Refer friends, earn credits 🎁</p>
                <p className="text-sm text-[#C9A84C]/80 mb-5">
                  Share your code. When a friend signs up and places their first order, you both earn £5 in credits.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#C9A84C]">{MOCK_REFERRAL.total_referred}</p>
                    <p className="text-xs text-[#C9A84C]/60 mt-0.5">Friends referred</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#C9A84C]">{gbp(MOCK_REFERRAL.total_earned)}</p>
                    <p className="text-xs text-[#C9A84C]/60 mt-0.5">Total earned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#C9A84C]">{gbp(WALLET_BALANCE)}</p>
                    <p className="text-xs text-[#C9A84C]/60 mt-0.5">Current balance</p>
                  </div>
                </div>
              </div>

              <ReferralCodeBox code={MOCK_REFERRAL.my_code} />

              {MOCK_REFERRAL.referrals.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                  <h2 className="font-semibold text-[#1A1814] mb-4">Your Referrals</h2>
                  <div className="space-y-4">
                    {MOCK_REFERRAL.referrals.map((ref, i) => (
                      <ReferralFriendRow key={i} friend={ref} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Addresses ──────────────────────────────────────────────── */}
          {section === 'addresses' && (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-2xl border border-[#E4E0D5] p-5">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-[#B8962E] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-[#1A1814] text-sm">{addr.label}</p>
                        {addr.is_default && (
                          <span className="text-xs bg-[#E8D5A3] text-[#B8962E] px-2 py-0.5 rounded-full font-medium">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-[#5C5750]">{addr.full_address}</p>
                      <p className="text-xs text-[#9C968E] mt-0.5">{addr.postcode}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!addr.is_default && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs text-[#B8962E] hover:underline"
                        >
                          Set default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAddress(addr.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[#9C968E] hover:text-[#C0392B] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add address */}
              {!showAddAddr ? (
                <button
                  onClick={() => setShowAddAddr(true)}
                  className="w-full py-3 border-2 border-dashed border-[#E4E0D5] rounded-2xl text-sm text-[#9C968E] hover:border-[#B8962E] hover:text-[#B8962E] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add New Address
                </button>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5 space-y-3">
                  <p className="font-semibold text-[#1A1814] text-sm">New Address</p>
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setNewAddr((a) => ({ ...a, label: l }))}
                        className={cn(
                          'px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
                          newAddr.label === l
                            ? 'bg-[#B8962E] text-white border-[#B8962E]'
                            : 'border-[#E4E0D5] text-[#5C5750] hover:border-[#B8962E]'
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Full address"
                    value={newAddr.full_address}
                    onChange={(e) => setNewAddr((a) => ({ ...a, full_address: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E4E0D5] rounded-lg text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0]"
                  />
                  <input
                    type="text"
                    placeholder="Postcode"
                    value={newAddr.postcode}
                    onChange={(e) => setNewAddr((a) => ({ ...a, postcode: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E4E0D5] rounded-lg text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0]"
                  />
                  <label className="flex items-center gap-2 text-sm text-[#5C5750] cursor-pointer">
                    <input type="checkbox" checked={newAddr.is_default} onChange={(e) => setNewAddr((a) => ({ ...a, is_default: e.target.checked }))} className="accent-[#B8962E]" />
                    Set as default address
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddAddr(false)} className="px-4 py-2 border border-[#E4E0D5] text-[#5C5750] rounded-lg text-sm hover:bg-[#F7F5F0] transition-colors">Cancel</button>
                    <button onClick={handleSaveAddress} className="px-4 py-2 bg-[#B8962E] text-white rounded-lg text-sm font-semibold hover:bg-[#A07828] transition-colors">Save Address</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Notifications ──────────────────────────────────────────── */}
          {section === 'notifications' && (
            <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6 space-y-0 divide-y divide-[#E4E0D5]">
              <h2 className="font-semibold text-[#1A1814] pb-4">Notification Preferences</h2>
              {([
                ['order_updates',   'Order Updates',    'Status changes, delivery confirmations'],
                ['promotions',      'Promotions',       'Deals, offers, and new restaurants'],
                ['referral_alerts', 'Referral Alerts',  'When a referred friend joins or orders'],
                ['delivery_alerts', 'Delivery Alerts',  'Real-time delivery and driver updates'],
              ] as const).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-[#1A1814] text-sm">{label}</p>
                    <p className="text-xs text-[#9C968E]">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                      notifPrefs[key] ? 'bg-[#B8962E]' : 'bg-[#E4E0D5]'
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                      notifPrefs[key] ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Security ─────────────────────────────────────────────────── */}
          {section === 'security' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6 space-y-4">
                <h2 className="font-semibold text-[#1A1814]">Change Password</h2>
                <div>
                  <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9C968E] uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] bg-[#F7F5F0]" />
                </div>
                <button
                  onClick={() => toast.success('Password updated')}
                  className="px-6 py-2.5 bg-[#B8962E] text-white rounded-xl font-semibold text-sm hover:bg-[#A07828] transition-colors"
                >
                  Update Password
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                <h2 className="font-semibold text-[#1A1814] mb-1">Two-Factor Authentication</h2>
                <p className="text-sm text-[#9C968E] mb-4">Add an extra layer of security to your account.</p>
                <button
                  onClick={() => toast('2FA setup coming soon!')}
                  className="px-4 py-2 border border-[#B8962E] text-[#B8962E] rounded-lg text-sm font-medium hover:bg-[#E8D5A3]/30 transition-colors"
                >
                  Enable 2FA
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                <h2 className="font-semibold text-[#1A1814] mb-1">Active Sessions</h2>
                <p className="text-sm text-[#9C968E] mb-4">You're currently logged in on these devices.</p>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on macOS', location: 'London, UK', current: true },
                    { device: 'Safari on iPhone', location: 'London, UK', current: false },
                  ].map(({ device, location, current }) => (
                    <div key={device} className="flex items-center justify-between py-2 border-b border-[#E4E0D5] last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-[#1A1814]">{device} {current && <span className="text-xs text-[#B8962E] ml-1">(current)</span>}</p>
                        <p className="text-xs text-[#9C968E]">{location}</p>
                      </div>
                      {!current && (
                        <button className="text-xs text-[#C0392B] hover:underline">Sign out</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
