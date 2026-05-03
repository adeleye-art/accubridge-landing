'use client'

import { useAuth } from '@/hooks/useAuth'

export default function CustomerHome() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-surface rounded-2xl border border-surface-dark shadow-sm p-10 max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-gold mx-auto flex items-center justify-center">
          <span className="text-sidebar font-bold text-2xl">A</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Customer App</p>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Welcome, {user?.name ?? 'Customer'}
          </h1>
        </div>
        <div className="bg-background rounded-xl p-6 border border-surface-dark">
          <p className="text-3xl mb-3">🍛</p>
          <p className="font-semibold text-text-primary">Coming Soon</p>
          <p className="text-sm text-text-secondary mt-1">
            The customer app is under construction. Full implementation coming in the next phase.
          </p>
        </div>
      </div>
    </div>
  )
}
