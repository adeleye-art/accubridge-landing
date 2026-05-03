"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useSendPasswordTokenMutation, useResetPasswordMutation } from "@/lib/accubridge/api/authApi";

const inputCls =
  "w-full px-5 py-3 rounded-xl bg-white/8 text-white placeholder-[#6B7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/50 border border-white/10 transition";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1); // 1=email, 2=reset form, 3=success
  const [email, setEmail] = React.useState("");
  const [userId, setUserId] = React.useState<number | null>(null);
  const [token, setToken] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [error, setError] = React.useState("");

  const [sendToken, { isLoading: isSending }] = useSendPasswordTokenMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendToken = async () => {
    setError("");
    if (!email)               { setError("Please enter your email address."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }

    try {
      const result = await sendToken({ email }).unwrap();
      setUserId(result?.data?.userId ?? null);
      setStep(2);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Could not send reset code. Please check your email and try again.";
      setError(msg);
    }
  };

  const handleReset = async () => {
    setError("");
    if (!token)                         { setError("Please enter the reset code from your email."); return; }
    if (!newPassword)                   { setError("Please enter a new password."); return; }
    if (newPassword.length < 8)        { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

    try {
      await resetPassword({ userId: userId!, token, newPassword }).unwrap();
      setStep(3);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Reset failed. The code may be invalid or expired.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A2463] to-[#0D0D0D] relative overflow-hidden w-full px-4">

      {/* Ambient glows */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#3E92CC]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#D4AF37]/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-br from-white/10 to-white/[0.03] backdrop-blur-md shadow-2xl p-8 flex flex-col items-center border border-white/10">

        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 mb-4 shadow-lg">
          <span className="text-[#D4AF37] font-bold text-lg tracking-tight">A</span>
        </div>

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center gap-4 w-full">
            <div className="w-16 h-16 rounded-full bg-[#06D6A0]/15 border border-[#06D6A0]/30 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-[#06D6A0]" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Password reset!</h2>
            <p className="text-[#6B7280] text-sm">Your password has been updated. Redirecting you to sign in…</p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#06D6A0] rounded-full animate-[shrink_2.5s_linear_forwards]" style={{ animation: "width 2.5s linear forwards", width: "100%" }} />
            </div>
          </div>
        )}

        {/* ── STEP 1: Enter email ── */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">Reset password</h2>
            <p className="text-[#6B7280] text-sm mb-6 text-center">
              Enter your email and we&apos;ll send you a reset code.
            </p>

            <div className="flex flex-col w-full gap-4">
              <input
                placeholder="Email address"
                type="email"
                value={email}
                autoComplete="email"
                className={inputCls}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendToken()}
              />

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendToken}
                disabled={isSending}
                className="w-full bg-[#D4AF37] text-[#0A2463] font-bold px-5 py-3 rounded-full shadow-lg hover:bg-[#D4AF37]/90 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending
                  ? <><Loader2 size={16} className="animate-spin" />Sending code...</>
                  : "Send reset code"}
              </button>

              <a href="/login" className="w-full flex items-center justify-center gap-1.5 text-sm text-[#6B7280] hover:text-white transition">
                <ArrowLeft size={14} /> Back to sign in
              </a>
            </div>
          </>
        )}

        {/* ── STEP 2: Enter token + new password ── */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">Enter new password</h2>
            <p className="text-[#6B7280] text-sm mb-1 text-center">
              We sent a reset code to
            </p>
            <p className="text-white text-sm font-medium mb-6 text-center">{email}</p>

            <div className="flex flex-col w-full gap-3">

              <input
                placeholder="Reset code from email"
                type="text"
                value={token}
                autoComplete="one-time-code"
                className={inputCls}
                onChange={(e) => setToken(e.target.value)}
              />

              <div className="relative">
                <input
                  placeholder="New password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  autoComplete="new-password"
                  className={`${inputCls} pr-12`}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <input
                  placeholder="Confirm new password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  autoComplete="new-password"
                  className={`${inputCls} pr-12`}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <button
                onClick={handleReset}
                disabled={isResetting}
                className="w-full bg-[#D4AF37] text-[#0A2463] font-bold px-5 py-3 rounded-full shadow-lg hover:bg-[#D4AF37]/90 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting
                  ? <><Loader2 size={16} className="animate-spin" />Resetting...</>
                  : "Reset password"}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(""); setToken(""); setNewPassword(""); setConfirmPassword(""); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-[#6B7280] hover:text-white transition"
              >
                <ArrowLeft size={14} /> Use a different email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
