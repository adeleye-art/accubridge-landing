'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'
import { updateUser } from '@/store/swidexAuthSlice'
import type { AppDispatch } from '@/store'
import type { AfroCartRole } from '@/types/swidex'
import { ShoppingBasket, Store, Truck, User, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES: {
  role: AfroCartRole
  label: string
  description: string
  icon: React.ElementType
  color: string
  bg: string
}[] = [
  {
    role: 'customer',
    label: 'Customer',
    description: 'Browse and order food & groceries from local African & Caribbean businesses.',
    icon: User,
    color: '#2E7D52',
    bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
  },
  {
    role: 'vendor',
    label: 'Vendor',
    description: 'List your restaurant or store, manage products, and fulfil orders. Subject to approval after sign-up.',
    icon: Store,
    color: '#E8732A',
    bg: 'bg-orange-50 border-orange-200 hover:border-orange-400',
  },
  {
    role: 'driver',
    label: 'Driver',
    description: 'Deliver orders in your area. Subject to approval after sign-up.',
    icon: Truck,
    color: '#2C5F8A',
    bg: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  },
]

export default function AfroCartOnboardPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()
  const [selected, setSelected] = useState<AfroCartRole | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!selected || !user) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, app: 'afrocart', role: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      dispatch(updateUser({ user: data.user, token: data.token }))
      toast.success(`You're set up as a ${selected}!`)

      // Route to the right dashboard.
      // Use window.location.href (full navigation) so the browser sends the
      // freshly-written swidex_token cookie to the server, letting the
      // middleware see the new role. router.push() does a soft navigation
      // that can use a prefetch cache built before the cookie was updated.
      const dashboards: Record<AfroCartRole, string> = {
        admin:    '/afrocart/admin/dashboard',
        vendor:   '/afrocart/vendor/register',
        driver:   '/afrocart/driver/pending',
        customer: '/afrocart/customer/home',
      }
      window.location.href = dashboards[selected]
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#E8732A] flex items-center justify-center shrink-0">
            <ShoppingBasket size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm leading-tight">AfroCart</p>
            <p className="text-text-muted text-xs leading-tight">Set up your account</p>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-text-primary mb-1">
          How will you use AfroCart?
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Choose a role to get started. You can always contact support to change this later.
        </p>

        {/* Role cards */}
        <div className="space-y-3 mb-8">
          {ROLES.map(({ role, label, description, icon: Icon, color, bg }) => (
            <button
              key={role}
              onClick={() => setSelected(role)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${bg} ${
                selected === role ? 'ring-2 ring-offset-1' : ''
              }`}
              style={selected === role ? { borderColor: color } : {}}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary text-sm">{label}</p>
                    {(role === 'driver' || role === 'vendor') && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Requires approval
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center transition-colors`}
                  style={
                    selected === role
                      ? { borderColor: color, backgroundColor: color }
                      : { borderColor: '#D1CFC9' }
                  }
                >
                  {selected === role && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm bg-sidebar text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sidebar/90 transition-colors"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>Continue <ArrowRight size={15} /></>
          )}
        </button>

        <button
          onClick={() => router.push('/portal')}
          className="w-full mt-3 text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Maybe later — back to portal
        </button>
      </div>
    </div>
  )
}
