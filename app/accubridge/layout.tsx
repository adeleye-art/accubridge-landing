import { AccuBridgeProvider } from '@/components/accubridge/providers/AccuBridgeProvider'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'AccuBridge — Finance & Compliance',
}

export default function AccuBridgeRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AccuBridgeProvider>
      {children}
    </AccuBridgeProvider>
  )
}
