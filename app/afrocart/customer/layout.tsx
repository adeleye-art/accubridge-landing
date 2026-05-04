import { CustomerTopnav } from '@/components/customer/CustomerTopnav'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerTopnav />
      <main className="pt-16 bg-[#F7F5F0] min-h-screen">
        {children}
      </main>
    </>
  )
}
