import { NextRequest, NextResponse } from 'next/server'
import type { Role, User } from '@/types'
import { createMockToken } from '@/lib/mockJwt'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, phone, role } = body as { name: string; email: string; phone: string; role: Role }

  const newUser: User = {
    id: `u_${Date.now()}`,
    name,
    email,
    phone,
    role,
    referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    credit_balance: 5,
    created_at: new Date().toISOString(),
  }

  const token = createMockToken({ id: newUser.id, role: newUser.role, email: newUser.email })

  const response = NextResponse.json({
    user: newUser,
    token,
    message: 'Registration successful',
  })

  response.cookies.set('afrocart_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
