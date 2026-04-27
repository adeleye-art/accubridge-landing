'use client'

import { ShoppingCart, Store, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

const ROLES = [
  {
    value: 'customer' as Role,
    label: 'Customer',
    description: 'Order food & groceries',
    icon: ShoppingCart,
  },
  {
    value: 'vendor' as Role,
    label: 'Vendor',
    description: 'Sell your products',
    icon: Store,
  },
  {
    value: 'driver' as Role,
    label: 'Driver',
    description: 'Deliver orders',
    icon: Bike,
  },
]

interface RoleSelectorProps {
  value: Role | null
  onChange: (role: Role) => void
  error?: string
}

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
        Select your role
      </p>
      <div className="grid grid-cols-3 gap-3">
        {ROLES.map((role) => {
          const Icon = role.icon
          const isSelected = value === role.value
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all',
                isSelected
                  ? 'border-2 border-gold bg-gold-subtle/30 text-text-primary'
                  : 'border border-surface-dark bg-white text-text-secondary hover:border-gold/50 hover:bg-surface'
              )}
            >
              <Icon
                size={22}
                className={isSelected ? 'text-gold' : 'text-text-muted'}
              />
              <div>
                <p className="text-sm font-semibold">{role.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{role.description}</p>
              </div>
            </button>
          )
        })}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
