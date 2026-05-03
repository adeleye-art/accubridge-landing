import { NextRequest, NextResponse } from 'next/server'
import { MOCK_ORDERS, MOCK_DRIVERS } from '@/lib/mockData'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const order = MOCK_ORDERS.find((o) => o.id === params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const driver = MOCK_DRIVERS.find((d) => d.id === body.driver_id)
  if (driver) {
    order.driver_id = driver.id
    order.driver_name = driver.name
    driver.active_deliveries += 1
  }

  return NextResponse.json(order)
}
