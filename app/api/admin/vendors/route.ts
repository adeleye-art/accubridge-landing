import { NextRequest, NextResponse } from 'next/server'
import { MOCK_VENDORS } from '@/lib/mockData'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const vendors = status
    ? MOCK_VENDORS.filter((v) => v.status === status)
    : MOCK_VENDORS

  return NextResponse.json(vendors)
}
