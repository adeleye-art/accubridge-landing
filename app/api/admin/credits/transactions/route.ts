import { NextResponse } from 'next/server'
import { MOCK_CREDIT_TRANSACTIONS } from '@/lib/mockData'

export async function GET() {
  return NextResponse.json(MOCK_CREDIT_TRANSACTIONS)
}
