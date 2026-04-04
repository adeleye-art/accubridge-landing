"use client";

import React from "react";
import { CheckCircle2, ArrowUpRight, Calendar, CreditCard } from "lucide-react";
import { SubscriptionInfo } from "@/types/settings";
import { useCurrency } from "@/lib/currency-context";
import { PLAN_PRICES } from "@/lib/currency";

const BRAND = {
  primary: "#0A2463",
  gold: "#D4AF37",
  green: "#06D6A0",
  accent: "#3E92CC",
  muted: "#6B7280",
};

const PLAN_CONFIG = {
  basic: {
    label: "Basic",
    color: "rgba(255,255,255,0.6)",
    bg: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.15)",
    features: [
      "Up to 50 transactions/month",
      "Basic bookkeeping",
      "Compliance score",
      "Report downloads",
    ],
  },
  standard: {
    label: "Standard",
    color: BRAND.gold,
    bg: `${BRAND.gold}15`,
    border: `${BRAND.gold}30`,
    features: [
      "Unlimited transactions",
      "Full bookkeeping & reconciliation",
      "Auto-generated reports (PDF)",
      "Compliance Passport",
      "Raffle & Compliance Funding",
    ],
  },
  premium: {
    label: "Premium",
    color: BRAND.accent,
    bg: `${BRAND.accent}15`,
    border: `${BRAND.accent}30`,
    features: [
      "Everything in Standard",
      "Dedicated accountant",
      "Investor Pitch Funding",
      "Priority compliance reviews",
      "Multi-country operations",
    ],
  },
};

interface SubscriptionSectionProps {
  subscription: SubscriptionInfo;
}

export function SubscriptionSection({ subscription }: SubscriptionSectionProps) {
  const { currency, fmt } = useCurrency();
  const plan = PLAN_CONFIG[subscription.plan];
  const planOrder = { basic: 0, standard: 1, premium: 2 };

  return (
    <div className="flex flex-col gap-5">
      {/* Current plan card */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-5"
        style={{
          backgroundColor: `${plan.color}06`,
          borderColor: plan.border,
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: plan.bg,
                  color: plan.color,
                  borderColor: plan.border,
                }}
              >
                {plan.label} Plan
              </span>
              {subscription.status === "active" && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: `${BRAND.green}12`,
                    color: BRAND.green,
                  }}
                >
                  <CheckCircle2 size={10} /> Active
                </span>
              )}
            </div>
            <div className="text-3xl font-bold" style={{ color: plan.color }}>
              {fmt(PLAN_PRICES[currency][subscription.plan])}/mo
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              All plans include UK & Nigeria compliance features
            </p>
          </div>
        </div>

        {/* Billing info */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <Calendar size={13} />,
              label: "Started",
              value: new Date(subscription.started_at).toLocaleDateString(
                "en-GB",
                { day: "numeric", month: "long", year: "numeric" }
              ),
            },
            {
              icon: <CreditCard size={13} />,
              label: "Next billing",
              value: new Date(subscription.next_billing).toLocaleDateString(
                "en-GB",
                { day: "numeric", month: "long", year: "numeric" }
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 p-3 rounded-xl"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <span
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide"
                style={{ color: BRAND.muted }}
              >
                {item.icon}
                {item.label}
              </span>
              <span className="text-sm text-white font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {plan.features.map((f) => (
            <div key={f} className="flex items-start gap-2">
              <CheckCircle2
                size={13}
                className="flex-shrink-0 mt-0.5"
                style={{ color: plan.color }}
              />
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade options */}
      {subscription.plan !== "premium" && (
        <div className="flex flex-col gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: BRAND.muted }}
          >
            Available Upgrades
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              Object.entries(PLAN_CONFIG) as [
                keyof typeof PLAN_CONFIG,
                (typeof PLAN_CONFIG)[keyof typeof PLAN_CONFIG]
              ][]
            )
              .filter(
                ([key]) => planOrder[key] > planOrder[subscription.plan]
              )
              .map(([key, config]) => (
                <div
                  key={key}
                  className="rounded-2xl border p-4 flex flex-col gap-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      {config.label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: config.color }}
                    >
                      {fmt(PLAN_PRICES[currency][key])}/mo
                    </span>
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl text-xs font-bold border transition-all duration-200"
                    style={{
                      borderColor: `${config.color}35`,
                      color: config.color,
                      backgroundColor: `${config.color}10`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${config.color}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${config.color}10`;
                    }}
                  >
                    <ArrowUpRight size={13} />
                    Upgrade to {config.label}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Cancellation */}
      <div
        className="rounded-2xl border p-4 flex items-start justify-between gap-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div>
          <p className="text-sm text-white font-medium">Cancel Subscription</p>
          <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
            Your access continues until the end of the current billing period.
            All data is retained for 90 days after cancellation.
          </p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 px-4 h-9 rounded-xl text-xs font-medium border transition-all duration-200"
          style={{
            borderColor: "rgba(239,68,68,0.25)",
            color: "#ef4444",
            backgroundColor: "rgba(239,68,68,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.08)";
          }}
        >
          Cancel Plan
        </button>
      </div>
    </div>
  );
}
