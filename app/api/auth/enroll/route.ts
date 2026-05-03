import { NextRequest, NextResponse } from 'next/server'
import { MOCK_USERS, createMockJWT } from '../_mockDb'
import type { SwidexAppAccess, AfroCartRole } from '@/types/swidex'

// Called when a user self-enrolls into an app (AfroCart role selection, VB auto-enroll)
export async function POST(req: NextRequest) {
  const { email, app, role } = await req.json()

  await new Promise((r) => setTimeout(r, 300))

  const record = MOCK_USERS[email?.toLowerCase()]
  if (!record) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 })
  }

  // Build the app access to add
  let appAccess: Partial<SwidexAppAccess> = {}

  if (app === 'afrocart') {
    const afroRole = role as AfroCartRole
    appAccess = {
      afrocart: {
        role: afroRole,
        permissions: getAfroCartPermissions(afroRole),
        approval_status: afroRole === 'driver' ? 'pending' : 'approved',
      },
    }
  } else if (app === 'verifybrige') {
    appAccess = {
      verifybrige: {
        role: 'client',
        permissions: ['view_own_dashboard', 'manage_own_transactions', 'view_own_reports'],
      },
    }
  }

  // Update mock DB
  record.user.apps = { ...record.user.apps, ...appAccess }

  const token = createMockJWT(record.user)

  return NextResponse.json({
    token,
    user: record.user,
    message: `Enrolled as ${role ?? 'client'} successfully`,
  })
}

function getAfroCartPermissions(role: AfroCartRole): string[] {
  switch (role) {
    case 'vendor':   return ['manage_own_products', 'view_own_orders', 'update_order_status']
    case 'driver':   return ['view_assigned_orders', 'update_delivery_status']
    case 'customer': return ['place_orders', 'view_own_orders', 'track_delivery']
    case 'admin':    return ['manage_orders', 'manage_vendors', 'manage_drivers', 'view_reports']
    default:         return []
  }
}
