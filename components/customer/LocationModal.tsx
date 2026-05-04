'use client'

import { useState } from 'react'
import { MapPin, Crosshair, X } from 'lucide-react'
import type { Address } from '@/types'

interface LocationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (location: string) => void
  savedAddresses?: Address[]
}

export function LocationModal({ open, onClose, onConfirm, savedAddresses = [] }: LocationModalProps) {
  const [input, setInput] = useState('')

  if (!open) return null

  function handleConfirm() {
    if (!input.trim()) return
    onConfirm(input.trim())
    onClose()
  }

  function handleUseAddress(address: Address) {
    onConfirm(address.full_address)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#1A1814]">Set your delivery location</h2>
          <button onClick={onClose} className="text-[#9C968E] hover:text-[#1A1814] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8962E]" />
          <input
            type="text"
            placeholder="Enter your postcode or address..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            className="w-full pl-10 pr-4 py-3 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] text-[#1A1814] placeholder:text-[#9C968E]"
            autoFocus
          />
        </div>

        {/* Detect location */}
        <button
          onClick={() => {
            onConfirm('Current location')
            onClose()
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E4E0D5] rounded-xl text-sm text-[#5C5750] hover:bg-[#EFECE5] hover:text-[#1A1814] transition-colors mb-4"
        >
          <Crosshair size={15} className="text-[#B8962E]" />
          Use my current location
        </button>

        {/* Saved addresses */}
        {savedAddresses.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-[#9C968E] mb-2">Saved addresses</p>
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => handleUseAddress(addr)}
                  className="w-full flex items-start gap-3 p-3 border border-[#E4E0D5] rounded-xl text-left hover:bg-[#EFECE5] transition-colors"
                >
                  <MapPin size={14} className="text-[#9C968E] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#1A1814]">{addr.label}</p>
                    <p className="text-xs text-[#5C5750] mt-0.5">{addr.full_address}</p>
                  </div>
                  <span className="ml-auto text-xs text-[#B8962E] font-medium self-center">Use this</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!input.trim()}
          className="w-full bg-[#B8962E] text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#A07828] transition-colors"
        >
          Set Location
        </button>
      </div>
    </div>
  )
}
