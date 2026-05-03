import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { SwidexAuthState, SwidexUser } from '@/types/swidex'

const STORAGE_KEY = 'swidex_auth'

function loadFromStorage(): Pick<SwidexAuthState, 'user' | 'token' | 'isAuthenticated'> {
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

const initialState: SwidexAuthState = {
  user: persisted.user,
  token: persisted.token,
  isAuthenticated: persisted.isAuthenticated,
  isLoading: false,
}

const swidexAuthSlice = createSlice({
  name: 'swidexAuth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: SwidexUser; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: action.payload.user, token: action.payload.token })
        )
        // Set cookie for middleware (7 days)
        document.cookie = `swidex_token=${action.payload.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }
    },

    // Called after enrolling into an app — refreshes user + token without full re-login
    updateUser(state, action: PayloadAction<{ user: SwidexUser; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user: action.payload.user, token: action.payload.token })
        )
        document.cookie = `swidex_token=${action.payload.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }
    },

    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false

      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
        document.cookie = 'swidex_token=; Max-Age=0; path=/'
      }
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, updateUser, logout, setLoading } = swidexAuthSlice.actions
export default swidexAuthSlice.reducer
