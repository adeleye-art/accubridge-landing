import type { OnboardingProgress, OnboardingStep } from "@/types/onboarding";

export const STEP_META = [
  { step: 1 as OnboardingStep, label: "Business Info",   description: "Tell us about your business"          },
  { step: 2 as OnboardingStep, label: "Tax Setup",       description: "Tax IDs and compliance settings"      },
  { step: 3 as OnboardingStep, label: "Choose a Plan",   description: "Select the right plan for your needs" },
  { step: 4 as OnboardingStep, label: "Financial Setup", description: "Connect bank & upload statements"     },
  { step: 5 as OnboardingStep, label: "Verification",    description: "Upload ID and business documents"     },
];

export function isStepComplete(step: OnboardingStep, progress: OnboardingProgress): boolean {
  return progress.completed_steps.includes(step);
}

export function saveOnboardingProgress(progress: OnboardingProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    "accubridge_onboarding",
    JSON.stringify({ ...progress, last_saved: new Date().toISOString() })
  );
}

export function loadOnboardingProgress(): OnboardingProgress | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("accubridge_onboarding");
  if (!raw) return null;
  try { return JSON.parse(raw) as OnboardingProgress; } catch { return null; }
}

export function clearOnboardingProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accubridge_onboarding");
}
