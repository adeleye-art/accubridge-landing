'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Save, Camera } from 'lucide-react'
import { DriverTopbar } from '@/components/driver/DriverTopbar'
import { DriverProfileCard } from '@/components/driver/DriverProfileCard'

const MOCK_STATS = {
  today: 4250,
  this_week: 22800,
  this_month: 89500,
  all_time: 412000,
  deliveries_today: 6,
  deliveries_week: 34,
  daily_earnings: [],
}

const MOCK_DRIVER = {
  name: 'Leye Alarape',
  phone: '+44 7700 900000',
  vehiclePlate: 'LD24 XAF',
  rating: 4.8,
  totalDeliveries: 248,
  memberSince: '2024-03-01T00:00:00Z',
}

interface DocStatus {
  label: string
  status: 'verified' | 'pending' | 'required'
}

const DOCS: DocStatus[] = [
  { label: 'Driving Licence',    status: 'verified' },
  { label: 'MOT Certificate',    status: 'verified' },
  { label: 'Insurance',          status: 'pending'  },
  { label: 'DBS Check',          status: 'verified' },
  { label: 'Right to Work',      status: 'required' },
]

const STATUS_STYLE: Record<DocStatus['status'], string> = {
  verified: 'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
  required: 'bg-red-100   text-red-700',
}

export default function DriverProfilePage() {
  const [form, setForm] = useState({
    name:         MOCK_DRIVER.name,
    phone:        MOCK_DRIVER.phone,
    vehiclePlate: MOCK_DRIVER.vehiclePlate,
  })
  const [saving, setSaving] = useState(false)

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 900))
    setSaving(false)
    toast.success('Profile updated successfully')
  }

  return (
    <>
      <DriverTopbar title="My Profile" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: profile card */}
            <div className="lg:col-span-1 space-y-4">
              <DriverProfileCard
                name={form.name}
                phone={form.phone}
                vehiclePlate={form.vehiclePlate}
                rating={MOCK_DRIVER.rating}
                totalDeliveries={MOCK_DRIVER.totalDeliveries}
                memberSince={MOCK_DRIVER.memberSince}
                stats={MOCK_STATS}
              />

              {/* Photo upload placeholder */}
              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-5">
                <p className="text-sm font-semibold text-[#1A1814] mb-3">Profile Photo</p>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#1E1B16] flex items-center justify-center text-2xl font-bold text-[#B8962E]">
                    {form.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => toast('Photo upload coming soon')}
                    className="flex items-center gap-2 px-4 py-2 border border-[#E4E0D5] rounded-xl text-sm text-[#5C5750] hover:bg-[#F7F5F0] transition-colors"
                  >
                    <Camera size={14} />
                    Change Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Right: form + docs */}
            <div className="lg:col-span-2 space-y-5">

              {/* Edit profile form */}
              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                <h3 className="font-semibold text-[#1A1814] mb-5">Personal Details</h3>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5C5750] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange('name')}
                      className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm text-[#1A1814] bg-[#F7F5F0] focus:outline-none focus:border-[#B8962E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C5750] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={handleChange('phone')}
                      className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm text-[#1A1814] bg-[#F7F5F0] focus:outline-none focus:border-[#B8962E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C5750] mb-1">Vehicle Registration Plate</label>
                    <input
                      type="text"
                      value={form.vehiclePlate}
                      onChange={handleChange('vehiclePlate')}
                      className="w-full px-3 py-2.5 border border-[#E4E0D5] rounded-xl text-sm text-[#1A1814] bg-[#F7F5F0] focus:outline-none focus:border-[#B8962E] uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#B8962E] text-white rounded-xl font-semibold hover:bg-[#8A6F22] transition-colors disabled:opacity-60"
                  >
                    {saving ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                      <><Save size={16} /> Save Changes</>
                    )}
                  </button>
                </form>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                <h3 className="font-semibold text-[#1A1814] mb-4">Documents &amp; Compliance</h3>
                <div className="space-y-3">
                  {DOCS.map((doc) => (
                    <div key={doc.label} className="flex items-center justify-between py-2 border-b border-[#E4E0D5] last:border-0">
                      <span className="text-sm text-[#1A1814]">{doc.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLE[doc.status]}`}>
                          {doc.status}
                        </span>
                        {doc.status !== 'verified' && (
                          <button
                            onClick={() => toast('Document upload coming soon')}
                            className="text-xs text-[#B8962E] hover:underline"
                          >
                            Upload
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account settings */}
              <div className="bg-white rounded-2xl border border-[#E4E0D5] p-6">
                <h3 className="font-semibold text-[#1A1814] mb-4">Account Settings</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => toast('Password change email sent')}
                    className="w-full text-left px-4 py-3 border border-[#E4E0D5] rounded-xl text-sm text-[#5C5750] hover:bg-[#F7F5F0] transition-colors"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => toast('Notifications settings coming soon')}
                    className="w-full text-left px-4 py-3 border border-[#E4E0D5] rounded-xl text-sm text-[#5C5750] hover:bg-[#F7F5F0] transition-colors"
                  >
                    Notification Preferences
                  </button>
                  <button
                    onClick={() => toast('Please contact support to close your account')}
                    className="w-full text-left px-4 py-3 border border-red-100 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Close Account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
