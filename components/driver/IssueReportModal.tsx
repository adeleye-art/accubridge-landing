'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface IssueReportModalProps {
  onClose: () => void
}

const ISSUE_OPTIONS = [
  'Customer not answering',
  'Wrong address',
  'Item damaged',
  'Unable to complete delivery',
  'Other',
]

export function IssueReportModal({ onClose }: IssueReportModalProps) {
  const [selected,    setSelected]    = useState('')
  const [description, setDescription] = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  async function handleSubmit() {
    if (!selected) { toast.error('Please select an issue type'); return }
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    toast.success('Issue reported — our team will follow up')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[#1A1814] text-lg">Report a Problem</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-[#9C968E] hover:text-[#5C5750]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {ISSUE_OPTIONS.map((opt) => (
            <label
              key={opt}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
                selected === opt
                  ? 'border-[#B8962E] bg-[#E8D5A3]/20'
                  : 'border-[#E4E0D5] hover:border-[#B8962E]/50'
              )}
            >
              <input
                type="radio"
                name="issue"
                value={opt}
                checked={selected === opt}
                onChange={() => setSelected(opt)}
                className="accent-[#B8962E]"
              />
              <span className="text-sm text-[#1A1814]">{opt}</span>
            </label>
          ))}
        </div>

        {selected === 'Other' && (
          <textarea
            placeholder="Please describe the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 400))}
            rows={3}
            className="w-full px-3 py-2 border border-[#E4E0D5] rounded-xl text-sm focus:outline-none focus:border-[#B8962E] resize-none bg-[#F7F5F0] text-[#1A1814] placeholder:text-[#9C968E] mb-4"
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E4E0D5] text-[#5C5750] rounded-xl text-sm font-medium hover:bg-[#F7F5F0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selected}
            className="flex-1 py-2.5 border border-[#B8962E] text-[#B8962E] rounded-xl text-sm font-semibold hover:bg-[#E8D5A3]/30 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
