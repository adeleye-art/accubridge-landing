"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  loadOnboardingProgress,
  saveOnboardingProgress,
} from "@/lib/onboarding";
import { EMPTY_ONBOARDING } from "@/types/onboarding";
import type {
  OnboardingProgress,
  OnboardingStep,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from "@/types/onboarding";
import { OnboardingShell } from "./_components/onboarding-shell";
import { Step1BusinessInfo } from "./_components/step-1-business-info";
import { Step2TaxSetup } from "./_components/step-2-tax-setup";
import { Step3PlanSelection } from "./_components/step-3-plan-selection";
import { Step4FinancialSetup } from "./_components/step-4-financial-setup";
import { Step5Verification } from "./_components/step-5-verification";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC" };
const softSpring = "cubic-bezier(0.25, 1.1, 0.4, 1)";

export default function OnboardingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<OnboardingProgress>(EMPTY_ONBOARDING);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  /* ── Load saved progress on mount ── */
  useEffect(() => {
    const saved = loadOnboardingProgress();
    if (saved) {
      setProgress(saved);
    }
    setIsLoaded(true);
    // Trigger enter animation after mount
    setTimeout(() => setAnimateIn(true), 50);
  }, [router]);

  /* ── Persist on every change ── */
  const persist = useCallback((next: OnboardingProgress) => {
    setProgress(next);
    saveOnboardingProgress(next);
  }, []);

  /* ── Complete a step and advance ── */
  function markStepComplete<T>(step: OnboardingStep, data: T, stepKey: keyof OnboardingProgress) {
    const next: OnboardingProgress = {
      ...progress,
      [stepKey]: data,
      completed_steps: progress.completed_steps.includes(step)
        ? progress.completed_steps
        : ([...progress.completed_steps, step] as OnboardingStep[]),
      current_step: (step < 5 ? step + 1 : step) as OnboardingStep,
    };
    persist(next);
  }

  /* ── Go back ── */
  function goBack() {
    if (progress.current_step <= 1) return;
    const next: OnboardingProgress = {
      ...progress,
      current_step: (progress.current_step - 1) as OnboardingStep,
    };
    persist(next);
  }

  /* ── Save & Exit ── */
  function handleSaveExit() {
    saveOnboardingProgress(progress);
    router.push("/");
  }

  /* ── Skip onboarding ── */
  function handleSkip() {
    document.cookie = "accubridge_onboarding_done=1; path=/; max-age=31536000; SameSite=Lax";
    router.push("/client/dashboard");
  }

  /* ── Final submit ── */
  function handleFinish(step5: Step5Data) {
    const final: OnboardingProgress = {
      ...progress,
      step5,
      completed_steps: ([1, 2, 3, 4, 5] as OnboardingStep[]),
      current_step: 5,
      onboarding_complete: true,
    };
    saveOnboardingProgress(final);
    setProgress(final);
    // Set cookie so proxy.ts and OnboardingGuard both recognise completion.
    // In production the server sets this; here we set it client-side for the demo.
    document.cookie = "accubridge_onboarding_done=1; path=/; max-age=31536000; SameSite=Lax";
    setIsComplete(true);
  }

  /* ── Redirect after completion animation ── */
  useEffect(() => {
    if (!isComplete) return;
    const t = setTimeout(() => {
      router.push("/client/dashboard");
    }, 2800);
    return () => clearTimeout(t);
  }, [isComplete, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#07101f" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${BRAND.gold}60`, borderTopColor: "transparent" }} />
      </div>
    );
  }

  /* ── Completion screen ── */
  if (isComplete) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-8 px-6"
        style={{ background: "linear-gradient(135deg, #07101f 0%, #0A2463 100%)" }}
      >
        {/* Animated checkmark circle */}
        <div
          className="relative flex items-center justify-center"
          style={{
            animation: `popIn 0.5s ${softSpring} forwards`,
            opacity: 0,
          }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${BRAND.green}15`,
              border: `2px solid ${BRAND.green}40`,
              boxShadow: `0 0 48px ${BRAND.green}30`,
            }}
          >
            <CheckCircle2 size={44} style={{ color: BRAND.green }} />
          </div>
        </div>

        <div className="text-center max-w-md" style={{ animation: `fadeUp 0.5s 0.2s ${softSpring} both` }}>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            You&apos;re all set!
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
            Your business profile has been created. Our compliance team will review your documents within
            1 business day. Redirecting you to your dashboard…
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${BRAND.accent}60`, borderTopColor: "transparent" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Setting up your workspace…</span>
        </div>

        <style>{`
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.6); }
            to   { opacity: 1; transform: scale(1); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  /* ── Step content ── */
  const operatingCountry = (progress.step1.operating_country as string) ?? "";

  const stepContent = () => {
    switch (progress.current_step) {
      case 1:
        return (
          <Step1BusinessInfo
            data={progress.step1}
            onComplete={(d: Step1Data) => markStepComplete(1, d, "step1")}
          />
        );
      case 2:
        return (
          <Step2TaxSetup
            data={progress.step2}
            operatingCountry={operatingCountry}
            onComplete={(d: Step2Data) => markStepComplete(2, d, "step2")}
            onBack={goBack}
          />
        );
      case 3:
        return (
          <Step3PlanSelection
            data={progress.step3}
            onComplete={(d: Step3Data) => markStepComplete(3, d, "step3")}
            onBack={goBack}
          />
        );
      case 4:
        return (
          <Step4FinancialSetup
            data={progress.step4}
            operatingCountry={operatingCountry}
            onComplete={(d: Step4Data) => markStepComplete(4, d, "step4")}
            onBack={goBack}
          />
        );
      case 5:
        return (
          <Step5Verification
            data={progress.step5}
            onComplete={handleFinish}
            onBack={goBack}
          />
        );
    }
  };

  return (
    <div
      style={{
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "none" : "translateY(10px)",
        transition: `opacity 0.4s ${softSpring}, transform 0.4s ${softSpring}`,
      }}
    >
      <OnboardingShell
        currentStep={progress.current_step}
        completedSteps={progress.completed_steps}
        onSaveExit={handleSaveExit}
        onSkip={handleSkip}
      >
        {stepContent()}
      </OnboardingShell>
    </div>
  );
}
