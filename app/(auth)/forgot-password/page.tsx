export const metadata = { title: "Reset Password — AccuBridge" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A2463] to-[#0D0D0D]">
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.03] backdrop-blur-md shadow-2xl p-8 flex flex-col items-center border border-white/10">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-4 shadow-lg">
          <span className="text-[#D4AF37] font-bold text-lg tracking-tight">A</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">Reset password</h2>
        <p className="text-[#6B7280] text-sm mb-6 text-center">Coming soon</p>
        <a href="/login" className="text-sm text-[#D4AF37] hover:text-white underline transition">Back to sign in</a>
      </div>
    </div>
  );
}
