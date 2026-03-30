"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, ChevronDown } from "lucide-react";
import { UserRole, SignUpFormData } from "@/types/auth";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_ICONS } from "@/lib/roles";

const SignUp = () => {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [form, setForm] = React.useState<SignUpFormData>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "client",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const validateStep1 = () => {
    if (!form.full_name.trim()) { setError("Please enter your full name."); return false; }
    if (!form.email) { setError("Please enter your email."); return false; }
    if (!validateEmail(form.email)) { setError("Please enter a valid email address."); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!form.password) { setError("Please create a password."); return false; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return false; }
    if (form.password !== form.confirm_password) { setError("Passwords do not match."); return false; }
    if (!agreed) { setError("Please agree to the Terms of Service and Privacy Policy."); return false; }
    return true;
  };

  const handleNext = () => { setError(""); if (validateStep1()) setStep(2); };

  const handleSignUp = async () => {
    setError("");
    if (!validateStep2()) return;
    setLoading(true);
    try {
      // TODO: replace with real auth
      // await supabase.auth.signUp({ email, password, options: { data: { full_name, role } } });
      await new Promise((res) => setTimeout(res, 1500)); // MOCK — remove in production
      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const pwdStrength = passwordStrength(form.password);
  const strengthLabel     = ["", "Weak",        "Fair",          "Good",          "Strong"       ];
  const strengthBarColor  = ["", "bg-red-500",   "bg-[#D4AF37]",  "bg-[#3E92CC]",  "bg-[#06D6A0]"];
  const strengthTextColor = ["", "text-red-400", "text-[#D4AF37]","text-[#3E92CC]","text-[#06D6A0]"];
  const roles: UserRole[] = ["client", "staff", "admin"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A2463] to-[#0D0D0D] relative overflow-hidden w-full">

      {/* Ambient brand glows */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[#3E92CC]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-[#D4AF37]/6 rounded-full blur-3xl pointer-events-none" />

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.03] backdrop-blur-md shadow-2xl p-8 flex flex-col items-center border border-white/10">

        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-4 shadow-lg">
          <span className="text-[#D4AF37] font-bold text-lg tracking-tight">A</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? "bg-[#D4AF37] w-6" : "bg-[#06D6A0] w-2"}`} />
          <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? "bg-[#D4AF37] w-6" : "bg-white/20 w-2"}`} />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">
          {step === 1 ? "Create your account" : "Secure your account"}
        </h2>
        <p className="text-[#6B7280] text-sm mb-6 text-center">
          {step === 1
            ? "Your world-class financial team starts here"
            : "Set a strong password to protect your business"}
        </p>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col w-full gap-3">

            <input
              placeholder="Full name"
              type="text"
              value={form.full_name}
              autoComplete="name"
              className="w-full px-5 py-3 rounded-xl bg-white/8 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 border border-white/10 transition"
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />

            <input
              placeholder="Email address"
              type="email"
              value={form.email}
              autoComplete="email"
              className="w-full px-5 py-3 rounded-xl bg-white/8 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 border border-white/10 transition"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            {/* Role dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-5 py-3 rounded-xl bg-white/8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 border border-white/10 transition flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span>{ROLE_ICONS[form.role!]}</span>
                  <span>{ROLE_LABELS[form.role!]}</span>
                </span>
                <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${showRoleDropdown ? "rotate-180" : ""}`} />
              </button>

              {showRoleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-[#0A2463] border border-white/10 overflow-hidden z-50 shadow-2xl">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => { setForm({ ...form, role }); setShowRoleDropdown(false); }}
                      className="w-full px-5 py-3 text-left hover:bg-white/10 transition flex items-start gap-3 border-b border-white/5 last:border-0"
                    >
                      <span className="text-lg mt-0.5">{ROLE_ICONS[role]}</span>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium flex items-center gap-2">
                          {ROLE_LABELS[role]}
                          {form.role === role && <Check size={14} className="text-[#D4AF37]" />}
                        </div>
                        <div className="text-[#6B7280] text-xs mt-0.5">{ROLE_DESCRIPTIONS[role]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role warning */}
            {form.role !== "client" && (
              <div className="text-xs text-[#D4AF37]/80 bg-[#D4AF37]/10 px-3 py-2 rounded-lg border border-[#D4AF37]/20">
                {form.role === "admin"
                  ? "⚠️ Admin accounts require approval from the platform owner."
                  : "⚠️ Staff accounts must be authorised by an admin before access is granted."}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <hr className="border-white/10 my-1" />

            <button
              onClick={handleNext}
              className="w-full bg-[#D4AF37] text-[#0A2463] font-bold px-5 py-3 rounded-full shadow-lg hover:bg-[#D4AF37]/90 transition text-sm"
            >
              Continue →
            </button>

            <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#1a2a4a] to-[#0f1e3a] border border-white/10 rounded-full px-5 py-3 font-medium text-white shadow hover:brightness-110 transition text-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>

            <div className="w-full text-center mt-1">
              <span className="text-xs text-[#6B7280]">
                Already have an account?{" "}
                <a href="/login" className="underline text-[#D4AF37] hover:text-white transition">Sign in</a>
              </span>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col w-full gap-3">

            {/* Step 1 summary */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-sm font-bold flex-shrink-0">
                {form.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{form.full_name}</div>
                <div className="text-[#6B7280] text-xs truncate">{form.email}</div>
              </div>
              <button
                onClick={() => { setStep(1); setError(""); }}
                className="text-[#3E92CC] hover:text-white text-xs underline transition flex-shrink-0"
              >
                Edit
              </button>
            </div>

            <div className="relative">
              <input
                placeholder="Create password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                autoComplete="new-password"
                className="w-full px-5 py-3 rounded-xl bg-white/8 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 border border-white/10 transition pr-12"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength ? strengthBarColor[pwdStrength] : "bg-white/10"}`} />
                  ))}
                </div>
                <span className={`text-xs ${strengthTextColor[pwdStrength]}`}>
                  {strengthLabel[pwdStrength]} password
                </span>
              </div>
            )}

            <div className="relative">
              <input
                placeholder="Confirm password"
                type={showConfirm ? "text" : "password"}
                value={form.confirm_password}
                autoComplete="new-password"
                className="w-full px-5 py-3 rounded-xl bg-white/8 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 border border-white/10 transition pr-12"
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Match indicator */}
            {form.confirm_password && (
              <div className={`text-xs flex items-center gap-1.5 ${form.password === form.confirm_password ? "text-[#06D6A0]" : "text-red-400"}`}>
                {form.password === form.confirm_password
                  ? <><Check size={12} />Passwords match</>
                  : <>✗ Passwords do not match</>}
              </div>
            )}

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer ${agreed ? "bg-[#D4AF37] border-[#D4AF37]" : "border-white/30 bg-white/5 group-hover:border-[#D4AF37]/50"}`}
              >
                {agreed && <Check size={12} className="text-[#0A2463]" />}
              </div>
              <span className="text-xs text-[#6B7280] leading-relaxed">
                I agree to AccuBridge&apos;s{" "}
                <a href="/terms" className="underline text-[#3E92CC] hover:text-white transition">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="underline text-[#3E92CC] hover:text-white transition">Privacy Policy</a>
              </span>
            </label>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <hr className="border-white/10 my-1" />

            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-[#D4AF37] text-[#0A2463] font-bold px-5 py-3 rounded-full shadow-lg hover:bg-[#D4AF37]/90 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin text-[#0A2463]" />Creating account...</>
                : "Create Account →"}
            </button>

            <div className="w-full text-center">
              <span className="text-xs text-[#6B7280]">
                Already have an account?{" "}
                <a href="/login" className="underline text-[#D4AF37] hover:text-white transition">Sign in</a>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Social proof */}
      <div className="relative z-10 mt-10 flex flex-col items-center text-center">
        <p className="text-[#6B7280] text-xs mb-3">
          Trusted by <span className="text-white font-semibold">500+ SMEs</span> across the UK &amp; Nigeria
        </p>
        <div className="flex -space-x-2 mb-4">
          {[
            "https://randomuser.me/api/portraits/women/1.jpg",
            "https://randomuser.me/api/portraits/men/2.jpg",
            "https://randomuser.me/api/portraits/women/3.jpg",
            "https://randomuser.me/api/portraits/men/4.jpg",
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

export { SignUp };
export default SignUp;
