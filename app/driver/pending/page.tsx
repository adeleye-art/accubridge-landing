'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, FileText, LogOut, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetDriverApprovalStatusQuery } from '@/store/api/authApi'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'

const DOC_LABELS: Record<string, string> = {
  driving_licence: 'Driving Licence',
  vehicle_insurance: 'Vehicle Insurance',
  right_to_work: 'Right to Work',
  profile_photo: 'Profile Photo',
}

const REQUIRED_DOCS = ['driving_licence', 'vehicle_insurance', 'right_to_work', 'profile_photo']

export default function DriverPendingPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const { data, isLoading } = useGetDriverApprovalStatusQuery(undefined, {
    pollingInterval: 30000,
  })

  // Redirect to dashboard when approved
  useEffect(() => {
    if (data?.approval_status === 'approved') {
      toast.success('🎉 Your account has been approved!')
      const timer = setTimeout(() => {
        document.cookie = `driver_approval_status=approved; path=/; max-age=${60 * 60 * 24 * 7}`
        router.push('/driver/dashboard')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [data?.approval_status, router])

  function handleLogout() {
    logout()
    router.push('/login')
  }

  const submittedDate = user?.created_at ? formatDate(user.created_at) : 'Recently'

  const submittedDocs = data?.documents ?? []
  const missingDocs = data?.missing_documents ?? []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-surface-dark bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-text-primary tracking-tight">AfroCart</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-danger transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </header>

      {/* Centred content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[560px]">
          {isLoading ? (
            <div className="bg-[#EFECE5] rounded-2xl p-10 animate-pulse h-80" />
          ) : data?.approval_status === 'rejected' ? (
            /* ─── Rejected state ─────────────────────────────────────────── */
            <div className="bg-[#EFECE5] rounded-2xl p-10 space-y-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={32} className="text-danger" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-[#1A1814]">Application Rejected</h1>
                  <p className="text-[#5C5750] mt-1 text-sm">
                    Unfortunately your driver application was not approved.
                  </p>
                </div>
              </div>

              {data.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-danger">
                  <p className="font-medium mb-0.5">Reason:</p>
                  <p>{data.rejection_reason}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <a
                  href="mailto:driversupport@afrocart.co.uk"
                  className="w-full py-2.5 px-4 rounded-xl border border-surface-dark text-sm font-medium text-text-primary bg-white text-center hover:bg-surface transition"
                >
                  Contact Support
                </a>
                <a
                  href="/register"
                  className="w-full py-2.5 px-4 rounded-xl bg-gold text-white text-sm font-medium text-center hover:opacity-90 transition"
                >
                  Resubmit Application
                </a>
              </div>

              <div className="border-t border-[#D6D0C6] pt-4 text-center">
                <p className="text-xs text-[#5C5750]">
                  Questions?{' '}
                  <a
                    href="mailto:driversupport@afrocart.co.uk"
                    className="text-gold hover:underline"
                  >
                    driversupport@afrocart.co.uk
                  </a>
                </p>
              </div>
            </div>
          ) : (
            /* ─── Pending / under review state ──────────────────────────── */
            <div className="bg-[#EFECE5] rounded-2xl p-10 space-y-8">
              {/* Icon + Title */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#E8D5A3]/60 flex items-center justify-center">
                  <Clock size={40} className="text-[#B8962E]" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-[#1A1814]">
                    Application Under Review
                  </h1>
                  <p className="text-[#5C5750] mt-2 text-sm max-w-sm mx-auto">
                    Our team is reviewing your driver application. This usually takes 1–3 business
                    days.
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                <TimelineStep
                  label="Application Submitted"
                  subLabel={submittedDate}
                  state="done"
                />
                <TimelineStep
                  label="Documents Under Review"
                  subLabel="In progress"
                  state="current"
                />
                <TimelineStep label="Background Check" state="upcoming" />
                <TimelineStep label="Account Activated" state="upcoming" isLast />
              </div>

              {/* Document checklist */}
              {(submittedDocs.length > 0 || missingDocs.length > 0) && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#5C5750] font-medium mb-3">
                    Submitted Documents
                  </p>
                  <div className="space-y-2">
                    {submittedDocs.map((doc) => (
                      <div
                        key={doc.type}
                        className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText size={14} className="text-text-muted flex-shrink-0" />
                          <span className="text-sm text-text-primary">
                            {DOC_LABELS[doc.type] ?? doc.type}
                          </span>
                        </div>
                        {doc.verified ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Under Review
                          </span>
                        )}
                      </div>
                    ))}
                    {REQUIRED_DOCS.filter(
                      (key) =>
                        !submittedDocs.find((d) => d.type === key) && missingDocs.includes(key)
                    ).map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText size={14} className="text-text-muted flex-shrink-0" />
                          <span className="text-sm text-text-primary">
                            {DOC_LABELS[key] ?? key}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            Missing
                          </span>
                          <a
                            href="/register"
                            className="text-xs text-gold hover:underline"
                          >
                            Upload Now
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-[#D6D0C6] pt-4 text-center">
                <p className="text-xs text-[#5C5750]">
                  Have questions? Contact our driver support team
                </p>
                <a
                  href="mailto:driversupport@afrocart.co.uk"
                  className="text-sm font-medium text-[#B8962E] hover:underline"
                >
                  driversupport@afrocart.co.uk
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineStep({
  label,
  subLabel,
  state,
  isLast,
}: {
  label: string
  subLabel?: string
  state: 'done' | 'current' | 'upcoming'
  isLast?: boolean
}) {
  return (
    <div className="flex gap-3">
      {/* Indicator + connector */}
      <div className="flex flex-col items-center">
        <div className="mt-0.5">
          {state === 'done' ? (
            <CheckCircle2 size={20} className="text-[#B8962E] fill-[#B8962E]" />
          ) : state === 'current' ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#B8962E] flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 rounded-full bg-[#B8962E]" />
            </div>
          ) : (
            <Circle size={20} className="text-[#D6D0C6]" />
          )}
        </div>
        {!isLast && <div className="w-px flex-1 bg-[#D6D0C6] my-1 min-h-[20px]" />}
      </div>

      {/* Text */}
      <div className="pb-4">
        <p
          className={
            state === 'done'
              ? 'text-sm text-[#5C5750] line-through'
              : state === 'current'
              ? 'text-sm font-semibold text-[#1A1814]'
              : 'text-sm text-[#9C968E]'
          }
        >
          {label}
        </p>
        {subLabel && (
          <p className="text-xs text-[#9C968E] mt-0.5">{subLabel}</p>
        )}
      </div>
    </div>
  )
}
