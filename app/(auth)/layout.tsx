import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Swidex — Sign In',
}

const SUITE_APPS = [
  { name: 'AfroCart',    dot: 'bg-[#E8732A]', desc: 'Marketplace & logistics' },
  { name: 'AccuBridge',  dot: 'bg-[#3B6EE8]', desc: 'Finance & compliance' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-sidebar flex-col justify-between p-10 relative overflow-hidden">

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #C9A84C 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-[#E8732A]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -left-10 w-56 h-56 rounded-full bg-[#3B6EE8]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Swidex wordmark */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shrink-0">
              <span className="text-sidebar font-bold text-xl leading-none">S</span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg leading-tight tracking-tight">Swidex</p>
              <p className="text-white/30 text-xs leading-tight">Your business platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-[2rem] font-semibold text-white leading-tight tracking-tight">
              One login.
              <span className="block text-gold-light">Every tool.</span>
            </h2>
            <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-xs">
              Access all your business applications from a single, secure account.
            </p>
          </div>

          {/* App list */}
          <div className="space-y-4">
            {SUITE_APPS.map((app) => (
              <div key={app.name} className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${app.dot} shrink-0`} />
                <div>
                  <p className="text-white/80 text-sm font-medium leading-tight">{app.name}</p>
                  <p className="text-white/30 text-xs leading-tight">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Swidex. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="flex-1 bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-[460px]">

          {/* Mobile wordmark */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-sidebar flex items-center justify-center shrink-0">
              <span className="text-gold font-bold text-base leading-none">S</span>
            </div>
            <div>
              <p className="text-text-primary font-semibold text-sm leading-tight">Swidex</p>
              <p className="text-text-muted text-xs leading-tight">Your business platform</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-surface-dark shadow-sm">
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}
