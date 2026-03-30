"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Check, Loader2, ShieldCheck } from "lucide-react";

const BRAND = {
  primary: "#0A2463",
  accent: "#3E92CC",
  gold: "#D4AF37",
  green: "#06D6A0",
  muted: "#6B7280",
};

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

interface PasswordSectionProps {
  onSave: (current: string, next: string) => Promise<void>;
}

export function PasswordSection({ onSave }: PasswordSectionProps) {
  const [form, setForm] = useState<PasswordForm>({
    current: "",
    next: "",
    confirm: "",
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Partial<PasswordForm>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const strength = passwordStrength(form.next);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthBar = [
    "",
    "bg-red-500",
    "bg-[#D4AF37]",
    "bg-[#3E92CC]",
    "bg-[#06D6A0]",
  ];
  const strengthText = [
    "",
    "text-red-400",
    "text-[#D4AF37]",
    "text-[#3E92CC]",
    "text-[#06D6A0]",
  ];

  const validate = (): boolean => {
    const e: Partial<PasswordForm> = {};
    if (!form.current) e.current = "Current password is required";
    if (!form.next) e.next = "New password is required";
    if (form.next.length < 8) e.next = "Password must be at least 8 characters";
    if (form.next !== form.confirm) e.confirm = "Passwords do not match";
    if (form.next === form.current)
      e.next = "New password must be different from current password";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSave(form.current, form.next);
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setErrors({ current: "Current password is incorrect" });
    } finally {
      setIsSaving(false);
    }
  };

  const requirements = [
    { label: "At least 8 characters", passes: form.next.length >= 8 },
    { label: "One uppercase letter", passes: /[A-Z]/.test(form.next) },
    { label: "One number", passes: /[0-9]/.test(form.next) },
    { label: "One special character", passes: /[^A-Za-z0-9]/.test(form.next) },
  ];

  const inputBase =
    "w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 placeholder-[#6B7280] pr-12";
  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
  };

  function PasswordInput({
    field,
    placeholder,
    label,
  }: {
    field: keyof PasswordForm;
    placeholder: string;
    label: string;
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: BRAND.muted }}
        >
          {label}
        </label>
        <div className="relative">
          <input
            type={show[field] ? "text" : "password"}
            placeholder={placeholder}
            value={form[field]}
            onChange={(e) => {
              setForm((f) => ({ ...f, [field]: e.target.value }));
              if (errors[field])
                setErrors((err) => ({ ...err, [field]: undefined }));
            }}
            className={inputBase}
            style={{
              ...inputStyle,
              borderColor: errors[field]
                ? "rgba(239,68,68,0.5)"
                : "rgba(255,255,255,0.1)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(62,146,204,0.6)";
              e.target.style.boxShadow = "0 0 0 3px rgba(62,146,204,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors[field]
                ? "rgba(239,68,68,0.5)"
                : "rgba(255,255,255,0.1)";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="button"
            onClick={() =>
              setShow((s) => ({ ...s, [field]: !s[field] }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
            style={{ color: BRAND.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = BRAND.muted;
            }}
          >
            {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors[field] && (
          <span className="text-xs text-red-400">{errors[field]}</span>
        )}
      </div>
    );
  }

  const isDisabled = isSaving || !form.current || !form.next || !form.confirm;

  return (
    <div className="flex flex-col gap-5">
      {/* Success banner */}
      {success && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{
            backgroundColor: "rgba(6,214,160,0.12)",
            borderColor: "rgba(6,214,160,0.25)",
          }}
        >
          <ShieldCheck size={16} style={{ color: BRAND.green }} />
          <p className="text-sm font-medium" style={{ color: BRAND.green }}>
            Password updated successfully
          </p>
        </div>
      )}

      {/* Form */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-5"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: BRAND.accent }}
        >
          Update Password
        </div>

        <PasswordInput
          field="current"
          label="Current Password"
          placeholder="Enter current password"
        />

        <div
          className="w-full h-px"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        />

        <PasswordInput
          field="next"
          label="New Password"
          placeholder="Create a strong new password"
        />

        {/* Strength meter */}
        {form.next && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength ? strengthBar[strength] : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${strengthText[strength]}`}>
              {strengthLabel[strength]} password
            </span>
          </div>
        )}

        {/* Requirements checklist */}
        {form.next && (
          <div className="grid grid-cols-2 gap-2">
            {requirements.map((req) => (
              <div key={req.label} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-200"
                  style={{
                    backgroundColor: req.passes
                      ? `${BRAND.green}20`
                      : "transparent",
                    borderColor: req.passes
                      ? `${BRAND.green}50`
                      : "rgba(255,255,255,0.15)",
                  }}
                >
                  {req.passes && (
                    <Check size={9} style={{ color: BRAND.green }} />
                  )}
                </div>
                <span
                  className="text-xs"
                  style={{
                    color: req.passes
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(255,255,255,0.35)",
                  }}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <PasswordInput
          field="confirm"
          label="Confirm New Password"
          placeholder="Repeat new password"
        />

        {/* Match indicator */}
        {form.confirm && (
          <div
            className={`flex items-center gap-1.5 text-xs ${
              form.next === form.confirm ? "text-[#06D6A0]" : "text-red-400"
            }`}
          >
            {form.next === form.confirm ? (
              <>
                <Check size={12} />
                Passwords match
              </>
            ) : (
              <>✕ Passwords do not match</>
            )}
          </div>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isDisabled}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-bold transition-all duration-200 mt-2"
          style={{
            backgroundColor: isDisabled ? "rgba(255,255,255,0.06)" : BRAND.gold,
            color: isDisabled ? BRAND.muted : BRAND.primary,
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) e.currentTarget.style.backgroundColor = "#c49b30";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDisabled
              ? "rgba(255,255,255,0.06)"
              : BRAND.gold;
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Updating password...
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </div>

      {/* Security tip */}
      <div
        className="rounded-2xl border p-4 text-xs leading-relaxed"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        🔒 Your password is encrypted and never stored in plain text. AccuBridge
        staff will never ask for your password. If you suspect unauthorised
        access, change your password immediately and contact support.
      </div>
    </div>
  );
}
