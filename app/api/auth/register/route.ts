import { NextRequest, NextResponse } from 'next/server'
import { MOCK_USERS, createMockJWT } from '../_mockDb'
import type { SwidexUser } from '@/types/swidex'

export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json()

  await new Promise((r) => setTimeout(r, 500))

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Name, email and password are required.' }, { status: 400 })
  }

  if (MOCK_USERS[email.toLowerCase()]) {
    return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 })
  }

  // Create new user with no app access — they'll onboard per app
  const newUser: SwidexUser = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone: phone ?? '',
    apps: {},
    created_at: new Date().toISOString(),
  }

  // In production this would persist to the DB
  MOCK_USERS[email.toLowerCase()] = { password, user: newUser }

  const token = createMockJWT(newUser)

  return NextResponse.json({
    token,
    user: newUser,
    message: 'Account created successfully',
  })
}
