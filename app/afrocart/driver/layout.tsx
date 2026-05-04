'use client'

import { DriverSidebar } from '@/components/driver/DriverSidebar'

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <DriverSidebar />
      <div className="pl-64 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
