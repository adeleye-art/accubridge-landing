import { NextRequest, NextResponse } from 'next/server'
import { MOCK_ORDERS } from '@/lib/mockData'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const order = MOCK_ORDERS.find((o) => o.id === params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  order.status = 'cancelled'
  return NextResponse.json(order)
}
