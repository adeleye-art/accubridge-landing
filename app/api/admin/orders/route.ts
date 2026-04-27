import { NextRequest, NextResponse } from 'next/server'
import { MOCK_ORDERS } from '@/lib/mockData'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const vendor_id = searchParams.get('vendor_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const search = searchParams.get('search')

  let orders = [...MOCK_ORDERS]

  if (status) orders = orders.filter((o) => o.status === status)
  if (vendor_id) orders = orders.filter((o) => o.vendor_id === vendor_id)
  if (from) orders = orders.filter((o) => new Date(o.created_at) >= new Date(from))
  if (to) orders = orders.filter((o) => new Date(o.created_at) <= new Date(to + 'T23:59:59Z'))
  if (search) {
    const q = search.toLowerCase()
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q)
    )
  }

  return NextResponse.json(orders)
}
