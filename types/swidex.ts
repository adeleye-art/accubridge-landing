// ─── Per-app role types ───────────────────────────────────────────────────────

export type AfroCartRole = 'admin' | 'vendor' | 'driver' | 'customer'
export type VerifyBridgeRole = 'admin' | 'staff' | 'client'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface AfroCartAccess {
  role: AfroCartRole
  permissions: string[]
  approval_status?: ApprovalStatus
}

export interface VerifyBridgeAccess {
  role: VerifyBridgeRole
  permissions: string[]
}

export interface SwidexAppAccess {
  afrocart?: AfroCartAccess
  verifybrige?: VerifyBridgeAccess
  // Future apps slot in here
}

// ─── Unified user ─────────────────────────────────────────────────────────────

export interface SwidexUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  apps: SwidexAppAccess
  created_at?: string
}

// ─── Auth state ───────────────────────────────────────────────────────────────

export interface SwidexAuthState {
  user: SwidexUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── API response shape ───────────────────────────────────────────────────────

export interface SwidexAuthResponse {
  token: string
  user: SwidexUser
  message?: string
}

// ─── JWT payload (what's encoded in swidex_token) ────────────────────────────

export interface SwidexTokenPayload {
  id: string
  email: string
  name: string
  apps: SwidexAppAccess
  iat: number
  exp: number
}
