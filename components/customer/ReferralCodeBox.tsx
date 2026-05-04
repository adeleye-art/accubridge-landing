'use client'

import { useState } from 'react'
import { Copy, Share2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReferralCodeBoxProps {
  code: string
}

export function ReferralCodeBox({ code }: ReferralCodeBoxProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    const url  = `${typeof window !== 'undefined' ? window.location.origin : ''}/afrocart/register?ref=${code}`
    const text = `Join AfroCart with my referral code ${code} and get £5 off your first order! ${url}`
    if (navigator.share) {
      navigator.share({ title: 'Join AfroCart', text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Referral link copied!')
    }
  }

  return (
    <div className="bg-[#EFECE5] rounded-xl p-4">
      <p className="text-xs uppercase tracking-widest text-[#9C968E] mb-2">Your referral code</p>
      <p className="font-mono text-2xl font-bold text-[#B8962E] tracking-widest mb-4">{code}</p>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#B8962E] text-[#B8962E] rounded-lg text-sm font-medium hover:bg-[#E8D5A3]/30 transition-colors"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied! ✓' : 'Copy Code'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#B8962E] text-white rounded-lg text-sm font-medium hover:bg-[#A07828] transition-colors"
        >
          <Share2 size={15} />
          Share
        </button>
      </div>
    </div>
  )
}
