'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { useVerifyOtpMutation } from '@/store/api/authApi'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import type { AfroCartRole } from '@/types/swidex'

const ROLE_REDIRECTS: Record<AfroCartRole, string> = {
  admin:    '/afrocart/admin/dashboard',
  vendor:   '/afrocart/vendor/dashboard',
  driver:   '/afrocart/driver/dashboard',
  customer: '/afrocart/customer/home',
}

interface OtpFormProps {
  phone: string
}

export function OtpForm({ phone }: OtpFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { afrocartRole } = useRole()
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const submitOtp = useCallback(
    async (code: string) => {
      try {
        await verifyOtp({ phone, code }).unwrap()
        toast.success('Phone number verified!')
        router.push(afrocartRole ? ROLE_REDIRECTS[afrocartRole] : '/portal')
      } catch {
        toast.error('Invalid code. Please try again.')
        setDigits(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    },
    [phone, verifyOtp, router, user]
  )

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newDigits.every((d) => d !== '')) {
      submitOtp(newDigits.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newDigits = paste.split('').concat(Array(6).fill('')).slice(0, 6)
    setDigits(newDigits)
    if (newDigits.filter(Boolean).length === 6) {
      submitOtp(newDigits.join(''))
    } else {
      const nextEmpty = newDigits.findIndex((d) => !d)
      inputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus()
    }
  }

  function handleResend() {
    setCountdown(60)
    setCanResend(false)
    toast.success('Code resent!')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              'w-12 h-14 text-center text-xl font-semibold border rounded-lg bg-white text-text-primary',
              'focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors',
              digit ? 'border-gold' : 'border-surface-dark'
            )}
          />
        ))}
      </div>

      <div className="text-center">
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-gold hover:underline"
          >
            Resend code
          </button>
        ) : (
          <p className="text-sm text-text-muted">
            Resend code in{' '}
            <span className="text-text-secondary font-medium">
              0:{countdown.toString().padStart(2, '0')}
            </span>
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        loading={isLoading}
        className="w-full"
        onClick={() => {
          const code = digits.join('')
          if (code.length === 6) submitOtp(code)
        }}
        disabled={digits.join('').length < 6}
      >
        Verify &amp; Continue
      </Button>

      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mx-auto"
      >
        <ArrowLeft size={14} />
        Change phone number
      </button>
    </div>
  )
}
