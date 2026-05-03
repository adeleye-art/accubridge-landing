'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { Clock, XCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { logout } from '@/store/swidexAuthSlice'
import type { AppDispatch } from '@/store'

// Mock — replace with useGetMyStoreQuery when backend ready
const MOCK_APPROVAL_STATUS = 'pending' as 'pending' | 'rejected'
const MOCK_SUBMITTED_DATE = '2026-04-30T10:00:00Z'
const MOCK_EMAIL = 'mama@kitchen.co.uk'
const MOCK_REJECTION_REASON = 'Incomplete business registration documents submitted. Please resubmit with a valid Companies House certificate.'

export default function VendorPendingPage() {
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [status] = useState(MOCK_APPROVAL_STATUS)

  // Poll for approval (mock — in production this calls useGetMyStoreQuery every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      // In production: refetch and check approval_status === 'approved'
      // If approved: toast + redirect after 2s
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleLogout() {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Top bar */}
      <div className="h-14 bg-white border-b border-[#E4E0D5] px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#B8962E] flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-semibold text-[#1A1814] text-sm">AfroCart Vendors</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[#9C968E] hover:text-danger transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto pt-16 px-4">
        <div className="bg-[#EFECE5] rounded-2xl border border-[#E4E0D5] p-10 text-center space-y-6">

          {status === 'pending' ? (
            <>
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-[#E8D5A3] flex items-center justify-center">
                  <Clock size={40} className="text-[#B8962E]" />
                </div>
              </div>

              <div>
                <h1 className="text-xl font-semibold text-[#1A1814] mb-2">Application Under Review</h1>
                <p className="text-sm text-[#5C5750]">
                  Our team is reviewing your business details. This usually takes up to 24 hours.
                </p>
              </div>

              {/* Timeline */}
              <div className="flex items-center justify-center gap-2 py-4">
                {/* Step 1: Submitted */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#B8962E] flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <p className="text-xs text-[#5C5750] font-medium">Submitted</p>
                  <p className="text-[10px] text-[#9C968E]">
                    {new Date(MOCK_SUBMITTED_DATE).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </p>
                </div>

                <div className="w-12 h-px bg-[#B8962E] mb-5" />

                {/* Step 2: Under Review */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#B8962E]/20 border-2 border-[#B8962E] flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#B8962E] animate-pulse" />
                  </div>
                  <p className="text-xs text-[#B8962E] font-medium">Under Review</p>
                  <p className="text-[10px] text-[#9C968E]">In progress</p>
                </div>

                <div className="w-12 h-px bg-[#E4E0D5] mb-5" />

                {/* Step 3: Approved */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#E4E0D5] flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-[#9C968E]" />
                  </div>
                  <p className="text-xs text-[#9C968E]">Approved &amp; Live</p>
                  <p className="text-[10px] text-[#9C968E]">Pending</p>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-[#5C5750] text-left">
                You&apos;ll receive an email at{' '}
                <span className="font-semibold text-[#1A1814]">{MOCK_EMAIL}</span>{' '}
                once your application has been reviewed.
              </div>

              <Button variant="outline" size="md" className="w-full">
                Contact Support
              </Button>
            </>
          ) : (
            <>
              {/* Rejected */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle size={40} className="text-[#C0392B]" />
                </div>
              </div>

              <div>
                <h1 className="text-xl font-semibold text-[#1A1814] mb-2">Application Not Approved</h1>
                <p className="text-sm text-[#5C5750]">
                  Unfortunately your application didn&apos;t meet our requirements at this time.
                </p>
              </div>

              {/* Rejection reason */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                <p className="text-xs uppercase tracking-wider text-[#C0392B] font-medium mb-2">
                  Reason from our team:
                </p>
                <p className="text-sm text-[#1A1814]">{MOCK_REJECTION_REASON}</p>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" size="md" className="flex-1" onClick={() => router.push('/register')}>
                  Resubmit Application
                </Button>
                <Button variant="outline" size="md" className="flex-1">
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
