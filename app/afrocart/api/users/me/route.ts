import { NextRequest, NextResponse } from 'next/server'
import { MOCK_USERS } from '@/lib/mockData'

function decodeToken(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const padded = parts[1] + '='.repeat((4 - (parts[1].length % 4)) % 4)
    return JSON.parse(Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = auth.replace('Bearer ', '')
  const payload = decodeToken(token)
  const user = MOCK_USERS.find((u) => u.id === payload?.id) ?? MOCK_USERS[0]

  return NextResponse.json(user)
}
