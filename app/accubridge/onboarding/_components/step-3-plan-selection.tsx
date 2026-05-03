"use client";

import React, { useState } from "react";
import { Check, Star, Sparkles, Pencil } from "lucide-react";
import type { Step3Data, PlanType } from "@/types/accubridge/onboarding";
import { StepNav } from "./form-primitives";
import { useInitializePaymentMutation } from "@/lib/accubridge/api/paymentApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280" };

const PLAN_PRICES: Record<string, number> = { basic: 29, standard: 69, premium: 129 };

const PLANS = [
  {
    id: "basic" as PlanType,
    name: "Basic",
    price: "£29",
    period: "/month",
    icon: <Pencil size={20} />,
    description: "Perfect for sole traders and early-stage startups",
    features: [
      "Up to 50 transactions/month",
      "Basic bookkeeping & categorisation",
      "Compliance score monitoring",
      "Financial report downloads",
      "Funding applications",
    ],
    popular: false,
    color: "#6B7280",
  },
  {
    id: "standard" as PlanType,
    name: "Standard",
    price: "£69",
    period: "/month",
    icon: <Star size={20} />,
    description: "Ideal for growing SMEs needing full financial management",
    features: [
      "Unlimited transactions",
      "Full bookkeeping & bank reconciliation",
      "Auto-generated financial reports (PDF)",
      "Compliance Passport download",
      "Raffle & Compliance-Based Funding",
    ],
    popular: true,
    color: BRAND.gold,
  },
  {
    id: "premium" as PlanType,
    name: "Premium",
    price: "£129",
    period: "/month",
    icon: <Sparkles size={20} />,
    description: "For established businesses needing full-service operations",
    features: [
      "Everything in Standard",
      "Dedicated accountant assignment",
      "Investor Pitch Funding access",
      "Priority compliance reviews",
      "Multi-country operations support",
    ],
    popular: false,
    color: BRAND.accent,
  },
];

interface Props {
  data: Partial<Step3Data>;
  email?: string;
  onComplete: (data: Step3Data) => void;
  onBack: () => void;
}

export function Step3PlanSelection({ data, email, onComplete, onBack }: Props) {
  const [selected,    setSelected]    = useState<PlanType | "">(data.selected_plan ?? "");
  const [error,       setError]       = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [initializePayment] = useInitializePaymentMutation();

  async function handleContinue() {
    if (!selected) { setError("Please select a plan to continue"); return; }
    setIsRedirecting(true);
    try {
      const result = await initializePayment({
        amount:      PLAN_PRICES[selected] ?? 29,
        email:       email ?? "",
        currency:    "GBP",
        paymentType: "subscription",
        callbackUrl: `${window.location.origin}/payment/callback?type=subscription`,
      }).unwrap();
      window.location.href = result.authorizationUrl;
    } catch {
      // If payment init fails fall back to local completion so onboarding isn't blocked
      setIsRedirecting(false);
      onComplete({ selected_plan: selected });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => { setSelected(plan.id); setError(""); }}
              className="relative rounded-2xl border p-5 cursor-pointer flex flex-col gap-4 transition-all duration-300"
              style={{
                backgroundColor: isSelected ? `${plan.color}10` : "rgba(255,255,255,0.03)",
                borderColor: isSelected ? `${plan.color}50` : "rgba(255,255,255,0.1)",
                transform: isSelected ? "translateY(-2px)" : "none",
                boxShadow: isSelected ? `0 8px 32px ${plan.color}15` : "none",
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
                >
                  Most Popular
                </div>
              )}

              {/* Radio dot */}
              <div className="absolute top-4 right-4">
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                  style={{
                    borderColor: isSelected ? plan.color : "rgba(255,255,255,0.2)",
                    backgroundColor: isSelected ? plan.color : "transparent",
                  }}
                >
                  {isSelected && (
                    <Check size={10} style={{ color: plan.id === "standard" ? BRAND.primary : "#fff" }} />
                  )}
                </div>
              </div>

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${plan.color}18`, color: plan.color }}
              >
                {plan.icon}
              </div>

              {/* Price */}
              <div>
                <div className="text-white font-bold text-lg">{plan.name}</div>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-2xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
                  <span className="text-xs" style={{ color: BRAND.muted }}>{plan.period}</span>
                </div>
                <div className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {plan.description}
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={12} className="flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <p className="text-center text-xs" style={{ color: BRAND.muted }}>
        No hidden fees. Cancel anytime. All plans include UK and Nigeria compliance features.
      </p>

      <StepNav
        onBack={onBack}
        isLoading={isRedirecting}
        onContinue={handleContinue}
        continueLabel={
          isRedirecting
            ? "Redirecting to payment…"
            : `Continue with ${PLANS.find((p) => p.id === selected)?.name ?? "selected plan"} →`
        }
      />
    </div>
  );
}
