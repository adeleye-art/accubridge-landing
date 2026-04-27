import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AfroCart — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-sidebar flex-col justify-between p-10 relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #C9A84C 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <span className="text-sidebar font-bold text-xl">A</span>
            </div>
            <span className="text-gold-light font-semibold text-xl tracking-tight">AfroCart</span>
          </div>

          {/* Tagline */}
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-white leading-tight tracking-tight">
              Your African &amp; Caribbean
              <span className="block text-gold-light">Marketplace</span>
            </h2>
            <p className="mt-3 text-[#9C968E] text-sm">
              Connecting communities through food and culture.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-5">
            {[
              { icon: '🍛', text: 'Order food from local African restaurants' },
              { icon: '🛒', text: 'Shop African & Caribbean groceries' },
              { icon: '🚚', text: 'Fast local delivery to your door' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-[#C9A84C] text-sm pt-0.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[#5C5750] text-xs">
            © 2024 AfroCart. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-[480px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
              <span className="text-sidebar font-bold text-base">A</span>
            </div>
            <span className="text-text-primary font-semibold text-lg">AfroCart</span>
          </div>
          <div className="bg-surface rounded-2xl p-8 border border-surface-dark shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
