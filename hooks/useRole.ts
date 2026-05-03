'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import type { AfroCartRole, VerifyBridgeRole } from '@/types/swidex'

export function useRole() {
  const user = useSelector((state: RootState) => state.swidexAuth.user)

  const afrocartRole: AfroCartRole | null = user?.apps?.afrocart?.role ?? null
  const verifybrigeRole: VerifyBridgeRole | null = user?.apps?.verifybrige?.role ?? null

  return {
    // AfroCart
    afrocartRole,
    isAfroAdmin: afrocartRole === 'admin',
    isVendor: afrocartRole === 'vendor',
    isDriver: afrocartRole === 'driver',
    isCustomer: afrocartRole === 'customer',
    hasAfroCart: !!afrocartRole,
    afroApprovalStatus: user?.apps?.afrocart?.approval_status ?? null,

    // VerifyBridge
    verifybrigeRole,
    isVBAdmin: verifybrigeRole === 'admin',
    isVBStaff: verifybrigeRole === 'staff',
    isVBClient: verifybrigeRole === 'client',
    hasVerifyBridge: !!verifybrigeRole,

    // Legacy alias (used in some afrocart components)
    role: afrocartRole,
    isAdmin: afrocartRole === 'admin',
  }
}
