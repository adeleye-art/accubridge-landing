"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSignInMutation } from "@/lib/api/authApi";

function deriveRole(apiRole: unknown): { role: string; country: string; dest: string } {
  const s = String(apiRole ?? "").toLowerCase();
  if (s === "admin" || s === "superadmin") return { role: "admin",  country: "both",    dest: "/admin/dashboard"  };
  if (s === "staff" || s === "accountant") return { role: "staff",  country: "both",    dest: "/staff/dashboard"  };
  return                                          { role: "client", country: "uk",      dest: "/client/dashboard" };
}

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

  const [signIn, { isLoading }] = useSignInMutation();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSignIn = async () => {
    if (!email || !password) { setError("Please enter both email and password."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    setError("");

    try {
      const data = await signIn({ email, password }).unwrap();
      localStorage.setItem("auth_token", data.token);
      if (data.refreshToken) localStorage.setItem("refresh_token", data.refreshToken);
      if (data.email) localStorage.setItem("auth_user_email", data.email);

      // API returns roles as an array; fall back to legacy scalar fields
      const roleRaw = data.roles?.[0] ?? data.role ?? data.userRole ?? "";
      const { role, country, dest } = deriveRole(roleRaw);
      document.cookie = `accubridge_role=${role}; path=/; max-age=86400`;
      document.cookie = `accubridge_country=${country}; path=/; max-age=86400`;
      router.push(dest);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as { error?: string })?.error ??
        "Invalid email or password. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A2463] to-[#0D0D0D] relative overflow-hidden w-full">

      {/* Ambient brand glows */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#3E92CC]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#D4AF37]/6 rounded-full blur-3xl pointer-events-none" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.03] backdrop-blur-md shadow-2xl p-8 flex flex-col items-center border border-white/10">

        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-4 shadow-lg">
          <span className="text-[#D4AF37] font-bold text-lg tracking-tight">A</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">
          Welcome back
        </h2>
        <p className="text-[#6B7280] text-sm mb-6 text-center">
          Sign in to your AccuBridge account
        </p>

        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-col gap-3">

            <input
              placeholder="Email address"
              type="email"
              value={email}
              autoComplete="email"
              className="w-full px-5 py-3 rounded-xl bg-white/8 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 border border-white/10 transition"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />

            <div className="relative">
              <input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                className="w-full px-5 py-3 rounded-xl bg-white/8 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 border border-white/10 transition pr-12"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="text-right">
              <a href="/forgot-password" className="text-xs text-[#3E92CC] hover:text-white transition">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}
          </div>

          <hr className="border-white/10" />

          <div className="flex flex-col gap-2">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-[#D4AF37] text-[#0A2463] font-bold px-5 py-3 rounded-full shadow-lg hover:bg-[#D4AF37]/90 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? <><Loader2 size={16} className="animate-spin" />Signing in...</>
                : "Sign in"}
            </button>

            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#1a2a4a] to-[#0f1e3a] border border-white/10 rounded-full px-5 py-3 font-medium text-white shadow hover:brightness-110 transition text-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="w-full text-center mt-2">
              <span className="text-xs text-[#6B7280]">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="underline text-[#D4AF37] hover:text-white transition">
                  Create one free
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div className="relative z-10 mt-6 flex flex-col items-center text-center">
        <p className="text-[#6B7280] text-xs mb-3">
          Trusted by <span className="text-white font-semibold">500+ SMEs</span> across the UK &amp; Nigeria
        </p>
        <div className="flex -space-x-2 mb-4">
          {[
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/44.jpg",
            "https://randomuser.me/api/portraits/men/54.jpg",
            "https://randomuser.me/api/portraits/women/68.jpg",
          ].map((src, i) => (
            <img key={i} src={src} alt="user" className="w-8 h-8 rounded-full border-2 border-[#0A2463] object-cover" />
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {["🔒 FCA Compliant", "✅ FIRS Registered", "🏦 Bank-Grade Security"].map((badge) => (
            <span key={badge} className="text-xs text-[#6B7280] border border-white/10 rounded-full px-3 py-1 bg-white/5">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export { SignIn };
export default SignIn;
