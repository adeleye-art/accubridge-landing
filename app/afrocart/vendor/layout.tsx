'use client'

import { useState } from 'react'
import { VendorSidebar } from '@/components/vendor/VendorSidebar'
import { VendorTopbar } from '@/components/vendor/VendorTopbar'
import type { VendorProfile, VendorOrder } from '@/types'

const MOCK_STORE: VendorProfile = {
  id: 'v1',
  user_id: 'u1',
  business_name: "Mama's Kitchen",
  business_type: 'restaurant',
  address: '42 Brixton Road, London SW9 8PD',
  phone: '+447700900001',
  email: 'mama@kitchen.co.uk',
  description: 'Authentic West African cuisine in the heart of Brixton.',
  is_open: true,
  commission_rate: 20,
  approval_status: 'approved',
  rating: 4.7,
  total_orders: 284,
  created_at: '2026-01-05T09:00:00Z',
}

const MOCK_INCOMING: VendorOrder[] = []

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(MOCK_STORE.is_open)

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <VendorSidebar
        store={MOCK_STORE}
        incomingOrders={MOCK_INCOMING}
        isOpen={isOpen}
        onStoreToggle={setIsOpen}
      />
      <VendorTopbar isStoreOpen={isOpen} onStoreToggle={setIsOpen} />
      <main className="ml-[240px] pt-16 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
