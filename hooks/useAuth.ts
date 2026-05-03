'use client'

import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { logout } from '@/store/swidexAuthSlice'

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, token, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.swidexAuth
  )

  const handleLogout = () => {
    dispatch(logout())
  }

  return { user, token, isAuthenticated, isLoading, logout: handleLogout }
}
