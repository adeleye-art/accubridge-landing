import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, User } from '@/types'
import { STORAGE_KEY } from '@/lib/constants'

function loadFromStorage(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  if (typeof window === 'undefined') return { user: null, token: null, isAuthenticated: false }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null, isAuthenticated: false }
    const parsed = JSON.parse(raw)
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
      isAuthenticated: !!parsed.token,
    }
  } catch {
    return { user: null, token: null, isAuthenticated: false }
  }
}

const persisted = loadFromStorage()

const initialState: AuthState = {
  user: persisted.user,
  token: persisted.token,
  isAuthenticated: persisted.isAuthenticated,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: action.payload.user, token: action.payload.token })
        )
      }
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
        document.cookie = 'afrocart_token=; Max-Age=0; path=/'
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, logout, setLoading } = authSlice.actions
export default authSlice.reducer
