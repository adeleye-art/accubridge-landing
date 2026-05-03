'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface StoreStatusToggleProps {
  isOpen: boolean
  onChange?: (next: boolean) => void
  size?: 'sm' | 'md'
}

export function StoreStatusToggle({ isOpen, onChange, size = 'md' }: StoreStatusToggleProps) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    const next = !isOpen
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    setLoading(false)
    onChange?.(next)
    toast.success(next ? 'Store is now Open' : 'Store is now Closed')
  }

  const trackCls = size === 'sm'
    ? 'w-9 h-5'
    : 'w-11 h-6'

  const thumbCls = size === 'sm'
    ? 'w-3.5 h-3.5 top-[3px]'
    : 'w-4.5 h-4.5 top-[3px]'

  const translateOn = size === 'sm' ? 'translate-x-4' : 'translate-x-5'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOpen}
      disabled={loading}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex flex-shrink-0 rounded-full cursor-pointer transition-colors duration-200 focus:outline-none disabled:opacity-60',
        trackCls,
        isOpen ? 'bg-[#2E7D52]' : 'bg-[#5C5750]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute left-[3px] bg-white rounded-full shadow transition-transform duration-200',
          thumbCls,
          isOpen ? translateOn : 'translate-x-0',
          loading && 'opacity-60'
        )}
      />
    </button>
  )
}
