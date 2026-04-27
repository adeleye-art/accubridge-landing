'use client'

import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { logout } from '@/store/authSlice'

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, token, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  )

  const handleLogout = () => {
    dispatch(logout())
  }

  return { user, token, isAuthenticated, isLoading, logout: handleLogout }
}
