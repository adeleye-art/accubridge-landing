'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Truck,
  User,
  Phone,
  CreditCard,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Car,
  Bike,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

// ─── Vehicle types ────────────────────────────────────────────────────────────

const VEHICLE_TYPES = [
  { value: 'bicycle',    label: 'Bicycle',    icon: Bike },
  { value: 'motorcycle', label: 'Motorcycle', icon: Bike },
  { value: 'car',        label: 'Car',        icon: Car  },
  { value: 'van',        label: 'Van',        icon: Truck },
] as const

type VehicleType = typeof VEHICLE_TYPES[number]['value']

// ─── Required documents ───────────────────────────────────────────────────────

const REQUIRED_DOCS = [
  { key: 'driving_licence',    label: 'Driving Licence',    hint: 'Front and back of a valid UK driving licence' },
  { key: 'vehicle_insurance',  label: 'Vehicle Insurance',  hint: 'Current certificate of insurance' },
  { key: 'right_to_work',      label: 'Right to Work',      hint: 'Passport, visa, or BRP card' },
  { key: 'profile_photo',      label: 'Profile Photo',      hint: 'Clear, recent photo of your face' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DriverRegisterPage() {
  const router   = useRouter()
  const { user } = useAuth()

  // Form state
  const [fullName,       setFullName]       = useState(user?.name ?? '')
  const [phone,          setPhone]          = useState(user?.phone ?? '')
  const [vehicleType,    setVehicleType]    = useState<VehicleType | null>(null)
  const [vehiclePlate,   setVehiclePlate]   = useState('')
  const [licenceNumber,  setLicenceNumber]  = useState('')
  const [documents,      setDocuments]      = useState<Record<string, File>>({})
  const [draggingKey,    setDraggingKey]    = useState<string | null>(null)
  const [loading,        setLoading]        = useState(false)
  const [errors,         setErrors]         = useState<Record<string, string>>({})

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim())       e.fullName      = 'Full name is required'
    if (!phone.trim())          e.phone         = 'Phone number is required'
    if (!vehicleType)           e.vehicleType   = 'Please select a vehicle type'
    if (!vehiclePlate.trim())   e.vehiclePlate  = 'Vehicle registration plate is required'
    if (!licenceNumber.trim())  e.licenceNumber = 'Driving licence number is required'
    REQUIRED_DOCS.forEach(({ key, label }) => {
      if (!documents[key]) e[key] = `${label} is required`
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── File handling ──────────────────────────────────────────────────────────

  function handleFile(key: string, file: File) {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, or PDF files are accepted.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10 MB.')
      return
    }
    setDocuments(prev => ({ ...prev, [key]: file }))
    setErrors(prev => { const next = { ...prev }; delete next[key]; return next })
  }

  function removeFile(key: string) {
    setDocuments(prev => { const next = { ...prev }; delete next[key]; return next })
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please complete all required fields.')
      return
    }
    setLoading(true)
    // Mock submission delay — replace with real API call
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Application submitted! We\'ll review it within 1–3 business days.')
    router.push('/afrocart/driver/pending')
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function fieldError(key: string) {
    return errors[key] ? (
      <p className="text-xs text-danger mt-1">{errors[key]}</p>
    ) : null
  }

  const inputCls = (key: string) =>
    cn(
      'w-full h-11 px-4 rounded-xl border text-sm text-text-primary bg-white outline-none transition-colors',
      errors[key]
        ? 'border-danger focus:border-danger'
        : 'border-surface-dark focus:border-gold'
    )

  return (
    <div className="min-h-screen bg-background">

      {/* Top bar */}
      <header className="h-14 bg-white border-b border-surface-dark px-6 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#2C5F8A] flex items-center justify-center shrink-0">
          <Truck size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">AfroCart Drivers</p>
          <p className="text-[11px] text-text-muted leading-tight">Driver Application</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-1">
            Set up your driver profile
          </h1>
          <p className="text-sm text-text-secondary">
            Complete your details and upload the required documents. Our team will review your
            application within 1–3 business days.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">

          {/* ── Personal details ───────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  <User size={13} className="inline mr-1.5 opacity-60" />
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })) }}
                  placeholder="Your full legal name"
                  className={inputCls('fullName')}
                />
                {fieldError('fullName')}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  <Phone size={13} className="inline mr-1.5 opacity-60" />
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: '' })) }}
                  placeholder="+44 7700 000000"
                  className={inputCls('phone')}
                />
                {fieldError('phone')}
              </div>
            </div>
          </section>

          {/* ── Vehicle details ────────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Vehicle Details
            </h2>

            {/* Vehicle type selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Vehicle Type <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VEHICLE_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setVehicleType(value); setErrors(p => ({ ...p, vehicleType: '' })) }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium',
                      vehicleType === value
                        ? 'border-[#2C5F8A] bg-blue-50 text-[#2C5F8A]'
                        : 'border-surface-dark bg-white text-text-secondary hover:border-[#2C5F8A]/40'
                    )}
                  >
                    <Icon size={22} />
                    {label}
                  </button>
                ))}
              </div>
              {fieldError('vehicleType')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  <CreditCard size={13} className="inline mr-1.5 opacity-60" />
                  Vehicle Registration <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={e => { setVehiclePlate(e.target.value.toUpperCase()); setErrors(p => ({ ...p, vehiclePlate: '' })) }}
                  placeholder="e.g. AB12 CDE"
                  className={inputCls('vehiclePlate')}
                />
                {fieldError('vehiclePlate')}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  <FileText size={13} className="inline mr-1.5 opacity-60" />
                  Driving Licence Number <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={licenceNumber}
                  onChange={e => { setLicenceNumber(e.target.value.toUpperCase()); setErrors(p => ({ ...p, licenceNumber: '' })) }}
                  placeholder="e.g. SMITH901157AB9IJ"
                  className={inputCls('licenceNumber')}
                />
                {fieldError('licenceNumber')}
              </div>
            </div>
          </section>

          {/* ── Document uploads ───────────────────────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-1">
              Required Documents
            </h2>
            <p className="text-xs text-text-muted mb-4">
              JPG, PNG, or PDF • Max 10 MB per file
            </p>

            <div className="space-y-3">
              {REQUIRED_DOCS.map(({ key, label, hint }) => (
                <div key={key}>
                  <div
                    onDragOver={ev => { ev.preventDefault(); setDraggingKey(key) }}
                    onDragLeave={() => setDraggingKey(null)}
                    onDrop={ev => {
                      ev.preventDefault()
                      setDraggingKey(null)
                      const file = ev.dataTransfer.files[0]
                      if (file) handleFile(key, file)
                    }}
                    className={cn(
                      'relative rounded-xl border-2 border-dashed transition-all',
                      documents[key]
                        ? 'border-[#2E7D52] bg-green-50'
                        : errors[key]
                        ? 'border-danger bg-red-50'
                        : draggingKey === key
                        ? 'border-[#2C5F8A] bg-blue-50'
                        : 'border-surface-dark bg-white hover:border-gold/60'
                    )}
                  >
                    <input
                      ref={el => { fileInputRefs.current[key] = el }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={ev => {
                        const file = ev.target.files?.[0]
                        if (file) handleFile(key, file)
                        ev.target.value = ''
                      }}
                    />

                    {documents[key] ? (
                      /* Uploaded state */
                      <div className="flex items-center gap-3 px-4 py-3">
                        <CheckCircle2 size={18} className="text-[#2E7D52] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {documents[key].name}
                          </p>
                          <p className="text-xs text-text-muted">{label}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(key)}
                          className="w-7 h-7 rounded-full bg-white border border-surface-dark flex items-center justify-center hover:border-danger hover:text-danger transition-colors shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      /* Upload prompt */
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[key]?.click()}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center shrink-0">
                          <Upload size={16} className="text-text-muted" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">
                            {label} <span className="text-danger">*</span>
                          </p>
                          <p className="text-xs text-text-muted truncate">{hint}</p>
                        </div>
                        <span className="text-xs font-medium text-[#2C5F8A] shrink-0">
                          Browse
                        </span>
                      </button>
                    )}
                  </div>
                  {fieldError(key)}
                </div>
              ))}
            </div>
          </section>

          {/* ── Notice ─────────────────────────────────────────────────────── */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-[#5C5750]">
            <p className="font-semibold text-[#1A1814] mb-1">What happens next?</p>
            <p>
              Once you submit, our team will verify your documents and run a background check.
              You&apos;ll receive an email at{' '}
              <span className="font-medium text-[#1A1814]">{user?.email}</span> with the
              outcome within 1–3 business days.
            </p>
          </div>

          {/* ── Actions ────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-10">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-[#2C5F8A] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#245078] transition-colors"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting…</>
              ) : (
                'Submit Application'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/portal')}
              className="sm:w-40 h-12 rounded-xl border border-surface-dark text-text-secondary text-sm font-medium hover:bg-surface transition-colors"
            >
              Save & Exit
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
