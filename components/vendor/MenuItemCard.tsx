'use client'

import { useState } from 'react'
import { UtensilsCrossed, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { MenuItem } from '@/types'

interface MenuItemCardProps {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  onToggleAvailability: (item: MenuItem, next: boolean) => void
}

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability }: MenuItemCardProps) {
  const [available, setAvailable] = useState(item.availability)
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    const next = !available
    setAvailable(next)
    setToggling(true)
    await new Promise((r) => setTimeout(r, 300))
    setToggling(false)
    onToggleAvailability(item, next)
    toast.success(next ? `${item.name} is now available` : `${item.name} marked unavailable`)
  }

  return (
    <div className="bg-[#EFECE5] rounded-xl border border-[#E4E0D5] overflow-hidden flex flex-col">
      {/* Image */}
      <div className="h-40 bg-[#E4E0D5] relative flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <UtensilsCrossed size={36} className="text-[#9C968E]" />
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1">
        <span className="text-xs bg-[#E8D5A3] text-[#B8962E] rounded-full px-2 py-0.5 inline-block mb-2">
          {item.category}
        </span>
        <p className="font-semibold text-[#1A1814] text-sm mb-1">{item.name}</p>
        {item.description && (
          <p className="text-xs text-[#9C968E] line-clamp-2 mb-3">{item.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#1A1814] text-sm">
            £{(item.price / 100).toFixed(2)}
          </span>
          {/* Availability toggle */}
          <div className="flex items-center gap-2">
            <span className={`text-xs ${available ? 'text-[#2E7D52]' : 'text-[#9C968E]'}`}>
              {available ? 'Available' : 'Unavailable'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              disabled={toggling}
              onClick={handleToggle}
              className={`relative inline-flex w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
                available ? 'bg-[#2E7D52]' : 'bg-[#5C5750]'
              }`}
            >
              <span className={`absolute left-[3px] top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow transition-transform duration-200 ${
                available ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E4E0D5] px-4 py-2 flex items-center justify-end gap-3">
        <button
          onClick={() => onEdit(item)}
          className="flex items-center gap-1 text-xs text-[#5C5750] hover:text-[#B8962E] transition-colors"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          className="flex items-center gap-1 text-xs text-[#9C968E] hover:text-danger transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}
