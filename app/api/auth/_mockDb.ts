import type { SwidexUser, SwidexAppAccess } from '@/types/swidex'

// ─── Mock user database ───────────────────────────────────────────────────────
// In production this is replaced by your real Swidex backend.

export interface MockDbUser {
  password: string
  user: SwidexUser
}

export const MOCK_USERS: Record<string, MockDbUser> = {
  'admin@swidex.com': {
    password: 'Admin123!',
    user: {
      id: 'usr_001',
      name: 'Admin User',
      email: 'admin@swidex.com',
      phone: '+44 7000 000001',
      apps: {
        afrocart: {
          role: 'admin',
          permissions: ['manage_orders', 'manage_vendors', 'manage_drivers', 'view_reports', 'manage_settings'],
          approval_status: 'approved',
        },
        verifybrige: {
          role: 'admin',
          permissions: ['manage_clients', 'manage_staff', 'view_all_reports', 'manage_compliance'],
        },
      },
    },
  },

  'vendor@swidex.com': {
    password: 'Vendor123!',
    user: {
      id: 'usr_002',
      name: 'Vendor User',
      email: 'vendor@swidex.com',
      phone: '+44 7000 000002',
      apps: {
        afrocart: {
          role: 'vendor',
          permissions: ['manage_own_products', 'view_own_orders', 'update_order_status'],
          approval_status: 'approved',
        },
      },
    },
  },

  'driver@swidex.com': {
    password: 'Driver123!',
    user: {
      id: 'usr_003',
      name: 'Driver User',
      email: 'driver@swidex.com',
      phone: '+44 7000 000003',
      apps: {
        afrocart: {
          role: 'driver',
          permissions: ['view_assigned_orders', 'update_delivery_status'],
          approval_status: 'pending', // Driver awaiting approval
        },
      },
    },
  },

  'customer@swidex.com': {
    password: 'Customer123!',
    user: {
      id: 'usr_004',
      name: 'Customer User',
      email: 'customer@swidex.com',
      phone: '+44 7000 000004',
      apps: {
        afrocart: {
          role: 'customer',
          permissions: ['place_orders', 'view_own_orders', 'track_delivery'],
          approval_status: 'approved',
        },
      },
    },
  },

  'staff@swidex.com': {
    password: 'Staff123!',
    user: {
      id: 'usr_005',
      name: 'Staff User',
      email: 'staff@swidex.com',
      phone: '+44 7000 000005',
      apps: {
        verifybrige: {
          role: 'staff',
          permissions: ['view_clients', 'manage_documents', 'add_internal_notes', 'view_reports'],
        },
      },
    },
  },

  // New user — no app access yet. Will go through onboarding.
  'newuser@swidex.com': {
    password: 'User123!',
    user: {
      id: 'usr_006',
      name: 'New User',
      email: 'newuser@swidex.com',
      phone: '+44 7000 000006',
      apps: {},
    },
  },
}

// ─── Mock JWT helpers ─────────────────────────────────────────────────────────

export function createMockJWT(user: SwidexUser): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      apps: user.apps,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  )
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${header}.${payload}.mock_sig_swidex`
}

// ─── Enroll user into an app (mock mutation) ──────────────────────────────────

export function enrollUser(user: SwidexUser, appAccess: Partial<SwidexAppAccess>): SwidexUser {
  return {
    ...user,
    apps: { ...user.apps, ...appAccess },
  }
}
