"use client";

import React from "react";
import type { OnboardingStep } from "@/types/onboarding";
import { STEP_META } from "@/lib/onboarding";
import { StepIndicator } from "./step-indicator";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

interface Props {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  onSaveExit: () => void;
  onSkip: () => void;
  children: React.ReactNode;
}

export function OnboardingShell({ currentStep, completedSteps, onSaveExit, onSkip, children }: Props) {
  const progress  = Math.round((completedSteps.length / 5) * 100);
  const stepMeta  = STEP_META.find((s) => s.step === currentStep)!;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col w-[360px] flex-shrink-0 min-h-screen p-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, rgba(10,36,99,0.95), rgba(10,36,99,0.7))",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Ambient glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${BRAND.gold}07` }} />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${BRAND.accent}06` }} />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-12 relative z-10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border"
            style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}40` }}
          >
            <span className="font-bold text-base" style={{ color: BRAND.gold }}>A</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">AccuBridge</span>
        </div>

        {/* Heading */}
        <div className="mb-10 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Set up your business</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Complete all steps to unlock your full AccuBridge workspace.
          </p>
        </div>

        {/* Step list */}
        <div className="flex-1 relative z-10">
          <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
        </div>

        {/* Trust badges */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-8">
          {["🔒 FCA Compliant", "✅ FIRS Registered", "🏦 Bank-Grade Security"].map((b) => (
            <span key={b} className="text-[10px] px-2.5 py-1 rounded-full border"
              style={{ color: BRAND.muted, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)" }}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Progress bar */}
        <div className="w-full h-1 flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(to right, ${BRAND.gold}, ${BRAND.accent})`,
              transitionTimingFunction: "cubic-bezier(0.25,1.1,0.4,1)",
            }}
          />
        </div>

        {/* Mobile top bar */}
        <div
          className="flex lg:hidden items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center border flex-shrink-0"
              style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}40` }}
            >
              <span className="text-xs font-bold" style={{ color: BRAND.gold }}>A</span>
            </div>
            <span className="text-white font-bold text-sm">AccuBridge</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: BRAND.muted }}>Step {currentStep} of 5</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border"
              style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}40`, color: BRAND.gold }}
            >
              {currentStep}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 lg:py-12">

            {/* Step heading */}
            <div className="mb-8">
              <div
                className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{ backgroundColor: `${BRAND.gold}12`, borderColor: `${BRAND.gold}30`, color: BRAND.gold }}
              >
                Step {currentStep} of 5
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                {stepMeta.label}
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {stepMeta.description}
              </p>
            </div>

            {children}
          </div>
        </div>

        {/* Save & Exit / Skip footer */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 sm:px-8 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.01)" }}
        >
          <button
            type="button"
            onClick={onSaveExit}
            className="text-sm transition-colors duration-200"
            style={{ color: BRAND.accent }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.accent; }}
          >
            Save & Exit — continue later
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="text-sm transition-colors duration-200"
            style={{ color: BRAND.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.muted; }}
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
}
