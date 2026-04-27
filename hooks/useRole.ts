'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export function useRole() {
  const user = useSelector((state: RootState) => state.auth.user)
  const role = user?.role ?? null

  return {
    role,
    isAdmin: role === 'admin',
    isVendor: role === 'vendor',
    isDriver: role === 'driver',
    isCustomer: role === 'customer',
  }
}
