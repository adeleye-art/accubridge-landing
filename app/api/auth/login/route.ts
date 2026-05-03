import { NextRequest, NextResponse } from 'next/server'
import { MOCK_USERS, createMockJWT } from '../_mockDb'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 400))

  const record = MOCK_USERS[email?.toLowerCase()]

  if (!record || record.password !== password) {
    return NextResponse.json(
      { message: 'Invalid email or password.' },
      { status: 401 }
    )
  }

  const token = createMockJWT(record.user)

  return NextResponse.json({
    token,
    user: record.user,
    message: 'Login successful',
  })
}
