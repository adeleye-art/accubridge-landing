import { NextRequest, NextResponse } from 'next/server'
import { MOCK_USERS } from '@/lib/mockData'
import { createMockToken, getRoleFromEmail } from '@/lib/mockJwt'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  const role = getRoleFromEmail(email)
  const user = MOCK_USERS.find((u) => u.role === role) ?? MOCK_USERS[0]
  const token = createMockToken({ id: user.id, role: user.role, email: user.email })

  const response = NextResponse.json({
    user,
    token,
    message: 'Login successful',
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
