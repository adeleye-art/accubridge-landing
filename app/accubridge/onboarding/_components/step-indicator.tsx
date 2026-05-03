"use client";

import React from "react";
import { Check } from "lucide-react";
import type { OnboardingStep } from "@/types/accubridge/onboarding";
import { STEP_META } from "@/lib/accubridge/onboarding";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", muted: "#6B7280" };

export function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
}) {
  return (
    <div className="flex flex-col gap-0">
      {STEP_META.map((meta, index) => {
        const isCompleted = completedSteps.includes(meta.step);
        const isActive    = currentStep === meta.step;

        return (
          <div key={meta.step} className="flex items-start gap-3">
            {/* Circle + connector */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300"
                style={{
                  backgroundColor: isCompleted
                    ? `${BRAND.green}20`
                    : isActive
                    ? BRAND.gold
                    : "rgba(255,255,255,0.06)",
                  borderColor: isCompleted
                    ? `${BRAND.green}50`
                    : isActive
                    ? BRAND.gold
                    : "rgba(255,255,255,0.12)",
                  color: isCompleted
                    ? BRAND.green
                    : isActive
                    ? BRAND.primary
                    : BRAND.muted,
                }}
              >
                {isCompleted ? <Check size={14} /> : meta.step}
              </div>

              {index < STEP_META.length - 1 && (
                <div
                  className="w-px mt-1 mb-1 min-h-[28px] transition-all duration-500"
                  style={{ backgroundColor: isCompleted ? `${BRAND.green}40` : "rgba(255,255,255,0.08)" }}
                />
              )}
            </div>

            {/* Labels */}
            <div className="pt-1 pb-5">
              <div
                className="text-sm font-semibold transition-colors duration-300"
                style={{
                  color: isCompleted ? BRAND.green : isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
                }}
              >
                {meta.label}
              </div>
              <div
                className="text-xs mt-0.5 transition-colors duration-300"
                style={{ color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}
              >
                {meta.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
