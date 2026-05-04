'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/hooks/useAuth'
import { updateUser } from '@/store/swidexAuthSlice'
import type { AppDispatch } from '@/store'
import type { BusinessType } from '@/types'
import {
  ShoppingBasket,
  Store,
  UtensilsCrossed,
  MapPin,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// ─── Business type options ────────────────────────────────────────────────────

const BUSINESS_TYPES: { type: BusinessType; label: string; description: string; icon: React.ElementType }[] = [
  {
    type: 'restaurant',
    label: 'Restaurant / Food Vendor',
    description: 'Serve cooked meals, takeaways, or street food to customers.',
    icon: UtensilsCrossed,
  },
  {
    type: 'store',
    label: 'Grocery Store',
    description: 'Sell African & Caribbean groceries, produce, or packaged goods.',
    icon: Store,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorRegisterPage() {
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useAuth()

  // Form state
  const [businessName,    setBusinessName]    = useState('')
  const [businessType,    setBusinessType]    = useState<BusinessType | null>(null)
  const [businessAddress, setBusinessAddress] = useState('')
  const [documents,       setDocuments]       = useState<File[]>([])
  const [dragging,        setDragging]        = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [errors,          setErrors]          = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate() {
    const e: Record<string, string> = {}
    if (!businessName.trim())    e.businessName    = 'Business name is required'
    if (!businessType)            e.businessType    = 'Please select a business type'
    if (!businessAddress.trim())  e.businessAddress = 'Business address is required'
    if (documents.length === 0)   e.documents       = 'Please upload at least one document'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── File handling ───────────────────────────────────────────────────────────

  function addFiles(files: FileList | null) {
    if (!files) return
    const allowed = Array.from(files).filter((f) => {
      const ok = f.size <= 10 * 1024 * 1024 // 10 MB
      if (!ok) toast.error(`${f.name} exceeds 10 MB limit`)
      return ok
    })
    setDocuments((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...allowed.filter((f) => !names.has(f.name))]
    })
    if (errors.documents) setErrors((e) => ({ ...e, documents: '' }))
  }

  function removeFile(index: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setDragging(false), [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors.documents])

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (!user) { toast.error('Session expired — please log in again'); return }

    setLoading(true)
    try {
      // In production this would upload documents and submit business details.
      // Mock: simulate API call then redirect to pending.
      await new Promise((r) => setTimeout(r, 1200))

      // Mock a token update that sets approval_status to 'pending'
      // In production, the API response would include the updated token.
      toast.success('Application submitted! We\'ll review your details within 24–48 hours.')
      router.push('/afrocart/vendor/pending')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex items-start justify-center p-6 pt-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#E8732A] flex items-center justify-center shrink-0">
            <ShoppingBasket size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1814] text-sm leading-tight">AfroCart</p>
            <p className="text-[#9C968E] text-xs leading-tight">Vendor Registration — Step 2 of 2</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-[#2E7D52]" />
            <span className="text-xs text-[#2E7D52] font-medium">Account created</span>
          </div>
          <div className="flex-1 h-px bg-[#E4E0D5]" />
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#B8962E] flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">2</span>
            </div>
            <span className="text-xs text-[#B8962E] font-medium">Business details</span>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[#1A1814] mb-1 tracking-tight">
          Tell us about your business
        </h1>
        <p className="text-sm text-[#5C5750] mb-8">
          We'll review your application and get back to you within 24–48 hours.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mama's Kitchen"
              value={businessName}
              onChange={(e) => { setBusinessName(e.target.value); if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: '' })) }}
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#1A1814] placeholder:text-[#9C968E] focus:outline-none transition-colors',
                errors.businessName
                  ? 'border-red-300 focus:border-red-400'
                  : 'border-[#E4E0D5] focus:border-[#B8962E]'
              )}
            />
            {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-[#1A1814] mb-2">
              Business Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_TYPES.map(({ type, label, description, icon: Icon }) => {
                const active = businessType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setBusinessType(type); if (errors.businessType) setErrors((prev) => ({ ...prev, businessType: '' })) }}
                    className={cn(
                      'text-left p-4 rounded-xl border-2 transition-all',
                      active
                        ? 'border-[#B8962E] bg-[#E8D5A3]/30'
                        : 'border-[#E4E0D5] bg-white hover:border-[#C9A84C]'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center mb-3',
                      active ? 'bg-[#B8962E]/15' : 'bg-[#EFECE5]'
                    )}>
                      <Icon size={18} className={active ? 'text-[#B8962E]' : 'text-[#5C5750]'} />
                    </div>
                    <p className={cn('text-sm font-semibold mb-0.5', active ? 'text-[#B8962E]' : 'text-[#1A1814]')}>
                      {label}
                    </p>
                    <p className="text-xs text-[#9C968E] leading-snug">{description}</p>
                  </button>
                )
              })}
            </div>
            {errors.businessType && <p className="text-xs text-red-500 mt-1">{errors.businessType}</p>}
          </div>

          {/* Business Address */}
          <div>
            <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
              Business Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-3.5 text-[#9C968E] pointer-events-none" />
              <textarea
                placeholder="Full address including postcode…"
                value={businessAddress}
                onChange={(e) => { setBusinessAddress(e.target.value); if (errors.businessAddress) setErrors((prev) => ({ ...prev, businessAddress: '' })) }}
                rows={3}
                className={cn(
                  'w-full pl-9 pr-4 pt-3 pb-3 rounded-xl border bg-white text-sm text-[#1A1814] placeholder:text-[#9C968E] focus:outline-none resize-none transition-colors',
                  errors.businessAddress
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-[#E4E0D5] focus:border-[#B8962E]'
                )}
              />
            </div>
            {errors.businessAddress && <p className="text-xs text-red-500 mt-1">{errors.businessAddress}</p>}
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-[#1A1814] mb-1.5">
              Verification Documents <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-[#9C968E] mb-2">
              Upload your business registration certificate, food hygiene certificate, or any official document that verifies your business identity.
            </p>

            {/* Drop zone */}
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
                dragging
                  ? 'border-[#B8962E] bg-[#E8D5A3]/20'
                  : errors.documents
                  ? 'border-red-300 bg-red-50 hover:border-red-400'
                  : 'border-[#E4E0D5] bg-white hover:border-[#C9A84C] hover:bg-[#EFECE5]/50'
              )}
            >
              <Upload size={28} className={cn('mx-auto mb-2', dragging ? 'text-[#B8962E]' : 'text-[#9C968E]')} />
              <p className="text-sm font-medium text-[#1A1814] mb-0.5">
                {dragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-[#9C968E]">
                or <span className="text-[#B8962E] font-medium">browse</span> — PDF, JPG, PNG up to 10 MB each
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>
            {errors.documents && <p className="text-xs text-red-500 mt-1">{errors.documents}</p>}

            {/* Uploaded files list */}
            {documents.length > 0 && (
              <ul className="mt-3 space-y-2">
                {documents.map((file, i) => (
                  <li key={i} className="flex items-center gap-3 bg-white border border-[#E4E0D5] rounded-lg px-3 py-2">
                    <FileText size={15} className="text-[#B8962E] flex-shrink-0" />
                    <span className="flex-1 text-xs text-[#1A1814] truncate">{file.name}</span>
                    <span className="text-xs text-[#9C968E] flex-shrink-0">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-[#9C968E] hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Amber notice */}
          <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <p className="font-semibold mb-0.5">Application Review Notice</p>
              <p>
                Your application will be manually reviewed by our team. This typically takes <strong>24–48 hours</strong> on business days.
                You'll receive an email notification once a decision has been made. You won't be able to accept orders until your account is approved.
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm bg-[#B8962E] text-white disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#A07828] transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting application…
              </>
            ) : (
              'Submit for Approval'
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/portal')}
            className="w-full text-center text-sm text-[#9C968E] hover:text-[#5C5750] transition-colors pb-6"
          >
            Save and continue later
          </button>
        </form>
      </div>
    </div>
  )
}
