'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X as XIcon } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import type { MenuItem } from '@/types'

const CATEGORIES = ['Rice', 'Soups', 'Grills', 'Sides', 'Drinks', 'Snacks', 'Desserts']

interface MenuItemModalProps {
  open: boolean
  onClose: () => void
  editItem?: MenuItem | null
  onSave: (data: {
    name: string; description: string; price: number;
    category: string; availability: boolean; image?: File
  }) => Promise<void>
}

export function MenuItemModal({ open, onClose, editItem, onSave }: MenuItemModalProps) {
  const [name, setName]               = useState('')
  const [category, setCategory]       = useState('')
  const [customCat, setCustomCat]     = useState('')
  const [price, setPrice]             = useState('')
  const [description, setDescription] = useState('')
  const [available, setAvailable]     = useState(true)
  const [imageFile, setImageFile]     = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [showCustomCat, setShowCustomCat] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editItem) {
      setName(editItem.name)
      setCategory(editItem.category)
      setPrice((editItem.price / 100).toFixed(2))
      setDescription(editItem.description ?? '')
      setAvailable(editItem.availability)
      setImagePreview(editItem.image_url ?? null)
    } else {
      setName(''); setCategory(''); setPrice('')
      setDescription(''); setAvailable(true)
      setImageFile(null); setImagePreview(null)
    }
  }, [editItem, open])

  function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!name.trim() || name.length < 2) { toast.error('Item name is required (min 2 chars)'); return }
    const finalCat = showCustomCat ? customCat.trim() : category
    if (!finalCat) { toast.error('Please select a category'); return }
    const priceNum = parseFloat(price)
    if (!price || isNaN(priceNum) || priceNum <= 0) { toast.error('Enter a valid price'); return }
    if (description.length > 200) { toast.error('Description too long (max 200 chars)'); return }

    setLoading(true)
    await onSave({
      name: name.trim(),
      description: description.trim(),
      price: Math.round(priceNum * 100),
      category: finalCat,
      availability: available,
      image: imageFile ?? undefined,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editItem ? 'Edit Menu Item' : 'Add Menu Item'} size="md">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Image upload */}
        <div
          className="h-48 border-2 border-dashed border-[#E4E0D5] rounded-xl bg-white flex items-center justify-center cursor-pointer relative overflow-hidden"
          onClick={() => !imagePreview && fileRef.current?.click()}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null) }}
                className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow text-text-muted hover:text-danger"
              >
                <XIcon size={14} />
              </button>
            </>
          ) : (
            <div className="text-center">
              <Camera size={28} className="text-[#9C968E] mx-auto mb-2" />
              <p className="text-sm text-[#9C968E]">Upload item photo</p>
              <p className="text-xs text-[#9C968E]/70 mt-0.5">JPG, PNG — max 5MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />

        {/* Name */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">Item Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="e.g. Jollof Rice with Chicken"
            className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold bg-white text-text-primary"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">Category *</label>
          <select
            value={showCustomCat ? 'new' : category}
            onChange={(e) => {
              if (e.target.value === 'new') { setShowCustomCat(true); setCategory('') }
              else { setShowCustomCat(false); setCategory(e.target.value) }
            }}
            className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white text-text-primary"
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="new">+ Add new category</option>
          </select>
          {showCustomCat && (
            <input
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              placeholder="Enter new category name..."
              className="mt-2 w-full border border-[#E4E0D5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white text-text-primary"
            />
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">Price (£) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white text-text-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5">
            Description
            <span className="ml-auto float-right text-[#9C968E] font-normal normal-case">
              {description.length}/200
            </span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            placeholder="Describe your item, ingredients, portion size..."
            className="w-full border border-[#E4E0D5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white text-text-primary resize-none"
          />
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Available for ordering</p>
            <p className="text-xs text-text-muted">Customers can add this item to their cart</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={available}
            onClick={() => setAvailable(!available)}
            className={`relative inline-flex w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
              available ? 'bg-[#2E7D52]' : 'bg-[#5C5750]'
            }`}
          >
            <span className={`absolute left-[3px] top-[3px] w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${
              available ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-5 pt-4 border-t border-[#E4E0D5]">
        <Button variant="outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button
          variant="primary"
          size="md"
          loading={loading}
          onClick={handleSubmit}
          className="flex-1"
        >
          {editItem ? 'Save Changes' : 'Add Item'}
        </Button>
      </div>
    </Modal>
  )
}
