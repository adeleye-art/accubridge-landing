import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from 'react-hot-toast'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'AfroCart — African & Caribbean Marketplace',
  description: 'Order food and groceries from local African & Caribbean businesses.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
        <ReduxProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#EFECE5',
                color: '#1A1814',
                border: '1px solid #E4E0D5',
                borderRadius: '10px',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
              success: {
                iconTheme: { primary: '#2E7D52', secondary: '#EFECE5' },
              },
              error: {
                iconTheme: { primary: '#C0392B', secondary: '#EFECE5' },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  )
}
