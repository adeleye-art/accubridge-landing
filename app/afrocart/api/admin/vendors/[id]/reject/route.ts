import { NextRequest, NextResponse } from 'next/server'
import { MOCK_VENDORS } from '@/lib/mockData'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const vendor = MOCK_VENDORS.find((v) => v.id === params.id)
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  vendor.status = 'rejected'
  return NextResponse.json(vendor)
}
