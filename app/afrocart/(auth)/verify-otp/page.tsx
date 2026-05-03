'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { OtpForm } from '@/components/auth/OtpForm'

function OtpContent() {
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') ?? ''

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Verify your number
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-text-primary">{phone || 'your phone'}</span>
        </p>
      </div>
      <OtpForm phone={phone} />
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <OtpContent />
    </Suspense>
  )
}
