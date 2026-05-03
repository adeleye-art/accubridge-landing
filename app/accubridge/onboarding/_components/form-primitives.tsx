"use client";

import React from "react";

const focusStyle = {
  borderColor: "rgba(62,146,204,0.6)",
  boxShadow: "0 0 0 3px rgba(62,146,204,0.12)",
};
const blurStyle = {
  borderColor: "rgba(255,255,255,0.1)",
  boxShadow: "none",
};

// ─── FormField ────────────────────────────────────────────────────────────────

export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "#6B7280" }}
      >
        {label}
        {required && <span style={{ color: "#D4AF37" }}> *</span>}
      </label>
      {children}
      {hint && !error && (
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          {hint}
        </span>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

// ─── FormInput ────────────────────────────────────────────────────────────────

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full h-11 px-4 rounded-xl text-sm text-white border outline-none transition-all duration-200 placeholder-[#6B7280]"
      style={{
        backgroundColor: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.1)",
        colorScheme: "dark",
      }}
      onFocus={(e) => { Object.assign(e.target.style, focusStyle); props.onFocus?.(e); }}
      onBlur={(e)  => { Object.assign(e.target.style, blurStyle);  props.onBlur?.(e);  }}
      {...props}
    />
  );
}

// ─── FormSelect ───────────────────────────────────────────────────────────────

export function FormSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="w-full h-11 px-4 rounded-xl text-sm text-white border outline-none appearance-none cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.1)",
        colorScheme: "dark",
      }}
      onFocus={(e) => { Object.assign(e.target.style, focusStyle); props.onFocus?.(e); }}
      onBlur={(e)  => { Object.assign(e.target.style, blurStyle);  props.onBlur?.(e);  }}
      {...props}
    >
      {children}
    </select>
  );
}

// ─── FormToggle ───────────────────────────────────────────────────────────────

export function FormToggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none"
      style={{
        backgroundColor: checked ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.04)",
        borderColor: checked ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.1)",
      }}
      onClick={() => onChange(!checked)}
    >
      <div>
        <div className="text-sm text-white font-medium">{label}</div>
        {hint && (
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            {hint}
          </div>
        )}
      </div>
      <div
        className="w-11 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ml-4"
        style={{ backgroundColor: checked ? "#D4AF37" : "rgba(255,255,255,0.12)" }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
          style={{ left: checked ? "calc(100% - 22px)" : "2px" }}
        />
      </div>
    </div>
  );
}

// ─── StepNav ──────────────────────────────────────────────────────────────────

export function StepNav({
  onBack,
  onContinue,
  continueLabel = "Continue →",
  isFirstStep = false,
  isLoading = false,
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  isFirstStep?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between pt-8 mt-8 border-t"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      {!isFirstStep ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-medium border transition-all duration-200"
          style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          ← Back
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={isLoading}
        className="flex items-center gap-2 px-7 h-11 rounded-xl text-sm font-bold transition-all duration-200"
        style={{
          backgroundColor: "#D4AF37",
          color: "#0A2463",
          opacity: isLoading ? 0.7 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#c49b30"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4AF37"; }}
      >
        {isLoading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {continueLabel}
      </button>
    </div>
  );
}
