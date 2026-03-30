import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Up Your Business — AccuBridge",
  description: "Complete your AccuBridge business onboarding",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "linear-gradient(135deg, #0A2463 0%, #0D0D0D 100%)" }}
    >
      {children}
    </div>
  );
}
