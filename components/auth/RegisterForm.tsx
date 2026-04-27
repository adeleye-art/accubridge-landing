'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Bike,
  Car,
  Truck,
  FileText,
  Check,
  X,
  AlertTriangle,
  ChevronLeft,
  Upload,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RoleSelector } from './RoleSelector'
import { useRegisterMutation, useUploadDriverDocumentMutation } from '@/store/api/authApi'
import { setCredentials } from '@/store/authSlice'
import { cn } from '@/lib/utils'
import type { Role, VehicleType } from '@/types'
import type { AppDispatch } from '@/store'

// ─── Step 1 schema (unchanged) ────────────────────────────────────────────────
const step1Schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['customer', 'vendor', 'driver'] as const),
    terms: z.boolean().refine((v) => v, 'You must accept the terms'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type Step1Data = z.infer<typeof step1Schema>

// ─── Step 2 schema ─────────────────────────────────────────────────────────────
const step2Schema = z.object({
  vehicle_plate: z.string().min(4, 'Min 4 characters').max(10, 'Max 10 characters'),
  licence_number: z.string().min(5, 'Min 5 characters'),
  dbs_check_acknowledged: z
    .boolean()
    .refine((v) => v, 'You must acknowledge the DBS check consent'),
})

type Step2Data = z.infer<typeof step2Schema>

// ─── Vehicle type config ───────────────────────────────────────────────────────
const VEHICLE_TYPES: { value: VehicleType; label: string; note: string; icon: React.ReactNode }[] =
  [
    {
      value: 'bicycle',
      label: 'Bicycle',
      note: 'Small orders only',
      icon: <Bike size={20} />,
    },
    {
      value: 'moped',
      label: 'Moped',
      note: 'Standard orders',
      icon: <Bike size={20} />,
    },
    {
      value: 'motorcycle',
      label: 'Motorcycle',
      note: 'Standard orders',
      icon: <Bike size={20} />,
    },
    {
      value: 'car',
      label: 'Car',
      note: 'All order sizes',
      icon: <Car size={20} />,
    },
    {
      value: 'van',
      label: 'Van',
      note: 'All order sizes',
      icon: <Truck size={20} />,
    },
  ]

// ─── Document upload config ───────────────────────────────────────────────────
type DocKey = 'driving_licence' | 'vehicle_insurance' | 'right_to_work' | 'profile_photo'

const DOCUMENTS: { key: DocKey; label: string }[] = [
  { key: 'driving_licence', label: 'Driving Licence (front)' },
  { key: 'vehicle_insurance', label: 'Vehicle Insurance Certificate' },
  { key: 'right_to_work', label: 'Proof of Right to Work (UK)' },
  { key: 'profile_photo', label: 'Profile Photo' },
]

export function RegisterForm() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // ─── Shared state ──────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2>(1)

  // ─── Driver step 2 state ───────────────────────────────────────────────────
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [vehicleTypeError, setVehicleTypeError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Record<DocKey, File | null>>({
    driving_licence: null,
    vehicle_insurance: null,
    right_to_work: null,
    profile_photo: null,
  })
  const [docErrors, setDocErrors] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<DocKey, HTMLInputElement | null>>({
    driving_licence: null,
    vehicle_insurance: null,
    right_to_work: null,
    profile_photo: null,
  })

  // ─── API hooks ─────────────────────────────────────────────────────────────
  const [register, { isLoading: registering }] = useRegisterMutation()
  const [uploadDocument, { isLoading: uploading }] = useUploadDriverDocumentMutation()

  // ─── Step 1 form ──────────────────────────────────────────────────────────
  const {
    register: reg,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })

  const selectedRole = watch('role')

  // ─── Step 2 form ──────────────────────────────────────────────────────────
  const {
    register: reg2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
  } = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  // ─── Step 1 "Continue / Create Account" handler ───────────────────────────
  async function onStep1Submit(data: Step1Data) {
    if (data.role !== 'driver') {
      setApiError(null)
      try {
        const result = await register({
          name: data.name,
          email: data.email,
          phone: `+44${data.phone.replace(/^0/, '')}`,
          password: data.password,
          role: data.role,
        }).unwrap()
        dispatch(setCredentials({ user: result.user, token: result.token }))
        document.cookie = `afrocart_token=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}`
        toast.success('Account created!')
        router.push(`/verify-otp?phone=${encodeURIComponent(data.phone)}`)
      } catch {
        setApiError('Registration failed. Please try again.')
      }
      return
    }

    // Driver — validate step 1, then proceed to step 2
    const valid = await trigger([
      'name',
      'email',
      'phone',
      'password',
      'confirmPassword',
      'role',
      'terms',
    ])
    if (valid) {
      setApiError(null)
      setStep(2)
    }
  }

  // ─── Step 2 "Submit Driver Application" handler ───────────────────────────
  async function onStep2Submit(data: Step2Data) {
    // Validate vehicle type
    if (!vehicleType) {
      setVehicleTypeError('Please select a vehicle type')
      return
    }
    setVehicleTypeError(null)

    // Validate all documents uploaded
    const missingDocs = DOCUMENTS.filter((d) => !uploadedFiles[d.key])
    if (missingDocs.length > 0) {
      setDocErrors(`Please upload: ${missingDocs.map((d) => d.label).join(', ')}`)
      return
    }
    setDocErrors(null)

    setApiError(null)
    const step1 = getValues()

    try {
      // 1. Register
      const result = await register({
        name: step1.name,
        email: step1.email,
        phone: `+44${step1.phone.replace(/^0/, '')}`,
        password: step1.password,
        role: 'driver',
        // Extra driver fields sent as part of body — backend will handle
        ...(vehicleType && { vehicle_type: vehicleType }),
        vehicle_plate: data.vehicle_plate,
        licence_number: data.licence_number,
        dbs_check_acknowledged: data.dbs_check_acknowledged,
      } as Parameters<typeof register>[0]).unwrap()

      // 2. Upload each document
      for (const doc of DOCUMENTS) {
        const file = uploadedFiles[doc.key]
        if (!file) continue
        const formData = new FormData()
        formData.append('file', file)
        formData.append('document_type', doc.key)
        await uploadDocument(formData).unwrap()
      }

      // 3. Set credentials + cookies
      dispatch(setCredentials({ user: result.user, token: result.token }))
      document.cookie = `afrocart_token=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}`
      document.cookie = `driver_approval_status=pending; path=/; max-age=${60 * 60 * 24 * 7}`

      toast.success('Application submitted!')
      router.push('/driver/pending')
    } catch {
      setApiError('Submission failed. Please try again.')
    }
  }

  const isSubmitting = registering || uploading

  // ─── Step 2 UI ─────────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <form onSubmit={handleSubmit2(onStep2Submit)} className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gold/30 text-gold text-xs flex items-center justify-center font-semibold">1</span>
            <span className="w-12 h-0.5 bg-gold" />
            <span className="w-5 h-5 rounded-full bg-gold text-white text-xs flex items-center justify-center font-semibold">2</span>
          </div>
          <span className="text-xs font-medium text-text-secondary ml-1">Step 2 of 2: Driver Details</span>
        </div>

        {/* Vehicle Information */}
        <div>
          <p className="text-sm font-semibold text-text-primary mb-3">Vehicle Information</p>

          <div className="mb-1">
            <p className="text-xs uppercase tracking-wider text-text-secondary mb-2 font-medium">
              Vehicle Type
            </p>
            <div className="flex gap-2 flex-wrap">
              {VEHICLE_TYPES.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => {
                    setVehicleType(v.value)
                    setVehicleTypeError(null)
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-center transition-all flex-1 min-w-[72px]',
                    vehicleType === v.value
                      ? 'border-2 border-gold bg-gold-subtle/30 text-text-primary'
                      : 'border border-surface-dark bg-white text-text-secondary hover:border-gold/50 hover:bg-surface'
                  )}
                >
                  <span className={vehicleType === v.value ? 'text-gold' : 'text-text-muted'}>
                    {v.icon}
                  </span>
                  <p className="text-xs font-semibold leading-tight">{v.label}</p>
                  <p className="text-[10px] text-text-muted leading-tight">{v.note}</p>
                </button>
              ))}
            </div>
            {vehicleTypeError && (
              <p className="mt-1 text-xs text-danger">{vehicleTypeError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input
              label="Vehicle Registration Plate"
              placeholder="e.g. LB21 ABC"
              error={errors2.vehicle_plate?.message}
              {...reg2('vehicle_plate')}
            />
            <Input
              label="Driving Licence Number"
              placeholder="e.g. JONES710244AB9CD"
              error={errors2.licence_number?.message}
              {...reg2('licence_number')}
            />
          </div>
        </div>

        {/* Required Documents */}
        <div>
          <p className="text-sm font-semibold text-text-primary mb-1">Required Documents</p>
          <p className="text-xs text-text-secondary mb-3">
            Upload the following. These are reviewed by our team before your account is activated.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {DOCUMENTS.map((doc) => {
              const file = uploadedFiles[doc.key]
              return (
                <div
                  key={doc.key}
                  onClick={() => fileInputRefs.current[doc.key]?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all',
                    file
                      ? 'border-[#2E7D52] bg-green-50'
                      : 'border-[#E4E0D5] bg-white hover:border-[#B8962E] hover:bg-[#E8D5A3]/20'
                  )}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[doc.key] = el }}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      setUploadedFiles((prev) => ({ ...prev, [doc.key]: f }))
                      if (f) setDocErrors(null)
                    }}
                  />
                  {file ? (
                    <div className="space-y-1.5">
                      <Check size={20} className="mx-auto text-[#2E7D52]" />
                      <p className="text-xs font-medium text-[#2E7D52] truncate px-1">{file.name}</p>
                      <p className="text-[10px] text-text-muted">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setUploadedFiles((prev) => ({ ...prev, [doc.key]: null }))
                          if (fileInputRefs.current[doc.key]) {
                            fileInputRefs.current[doc.key]!.value = ''
                          }
                        }}
                        className="text-[10px] text-danger hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload size={18} className="mx-auto text-text-muted" />
                      <p className="text-xs text-text-secondary font-medium leading-tight">
                        {doc.label}
                      </p>
                      <p className="text-[10px] text-gold font-medium">Upload</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {docErrors && <p className="mt-2 text-xs text-danger">{docErrors}</p>}
        </div>

        {/* DBS Check */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 accent-gold flex-shrink-0"
            {...reg2('dbs_check_acknowledged')}
          />
          <span className="text-xs text-text-secondary">
            I confirm I consent to a background (DBS) check being conducted as part of my driver
            application. I understand AfroCart will verify my details with a third-party provider.
          </span>
        </label>
        {errors2.dbs_check_acknowledged && (
          <p className="text-xs text-danger -mt-4">{errors2.dbs_check_acknowledged.message}</p>
        )}

        {/* Info notice */}
        <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Your application will be reviewed within 1–3 business days. You will receive an email
            once your account has been approved.
          </p>
        </div>

        {apiError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
            {apiError}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
          Submit Driver Application
        </Button>

        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mx-auto"
        >
          <ChevronLeft size={14} />
          Back to account details
        </button>
      </form>
    )
  }

  // ─── Step 1 UI ─────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="Amara Okafor"
        leftIcon={<User size={16} />}
        error={errors.name?.message}
        {...reg('name')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...reg('email')}
      />
      <div>
        <label className="block text-xs uppercase tracking-wider text-text-secondary mb-1.5 font-medium">
          Phone Number
        </label>
        <div className="flex gap-2">
          <div className="flex items-center bg-white border border-surface-dark rounded-lg px-3 text-sm text-text-secondary whitespace-nowrap">
            🇬🇧 +44
          </div>
          <Input
            type="tel"
            placeholder="7700 900000"
            leftIcon={<Phone size={16} />}
            error={errors.phone?.message}
            className="flex-1"
            {...reg('phone')}
          />
        </div>
      </div>
      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        leftIcon={<Lock size={16} />}
        error={errors.password?.message}
        rightIcon={
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...reg('password')}
      />
      <Input
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="••••••••"
        leftIcon={<Lock size={16} />}
        error={errors.confirmPassword?.message}
        rightIcon={
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...reg('confirmPassword')}
      />

      <RoleSelector
        value={selectedRole as Role | null}
        onChange={(role) =>
          setValue('role', role as 'customer' | 'vendor' | 'driver', { shouldValidate: true })
        }
        error={errors.role?.message}
      />

      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" className="mt-0.5 accent-gold" {...reg('terms')} />
        <span className="text-xs text-text-secondary">
          I agree to the{' '}
          <span className="text-gold underline cursor-pointer">Terms of Service</span> and{' '}
          <span className="text-gold underline cursor-pointer">Privacy Policy</span>
        </span>
      </label>
      {errors.terms && <p className="text-xs text-danger -mt-2">{errors.terms.message}</p>}

      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">
          {apiError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={registering}
        className="w-full"
      >
        {selectedRole === 'driver' ? 'Continue' : 'Create Account'}
      </Button>
    </form>
  )
}
