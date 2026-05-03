'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { MenuItem } from '@/types'

interface DeleteMenuItemModalProps {
  item: MenuItem | null
  onClose: () => void
  onConfirm: (item: MenuItem) => Promise<void>
}

export function DeleteMenuItemModal({ item, onClose, onConfirm }: DeleteMenuItemModalProps) {
  const [loading, setLoading] = useState(false)

  if (!item) return null

  async function handleDelete() {
    setLoading(true)
    await onConfirm(item!)
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={!!item} onClose={onClose} title="Delete Menu Item" size="sm">
      <p className="text-sm text-text-secondary mb-6">
        Are you sure you want to delete{' '}
        <span className="font-semibold text-text-primary">&ldquo;{item.name}&rdquo;</span>?
        This cannot be undone.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" size="md" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="danger" size="md" loading={loading} onClick={handleDelete} className="flex-1">
          Delete
        </Button>
      </div>
    </Modal>
  )
}
