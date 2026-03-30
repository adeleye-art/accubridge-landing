"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Ticket, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

const BRAND = { gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const FUNDING_CARDS = [
  {
    href:        "/client/funding/raffle",
    icon:        <Ticket size={22} />,
    title:       "Raffle Funding",
    description: "Enter for a chance to win business funding. Pay a small entry fee, receive a unique raffle ID and number. Draws happen quarterly.",
    color:       BRAND.gold,
    cta:         "Enter a draw",
    features:    ["£25 entry fee", "Quarterly draws", "Unique raffle ID", "Random selection"],
  },
  {
    href:        "/client/funding/compliance",
    icon:        <ShieldCheck size={22} />,
    title:       "Compliance Grants",
    description: "Qualify by maintaining a strong compliance score over 12+ months. Grants are awarded based on consistent platform activity.",
    color:       BRAND.green,
    cta:         "Check eligibility",
    features:    ["Score 70+ required", "12+ months active", "Grant up to £10,000", "Admin reviewed"],
  },
  {
    href:        "/client/funding/investor",
    icon:        <TrendingUp size={22} />,
    title:       "Investor Pitch",
    description: "Upload your pitch deck for review by the AccuBridge team. Approved pitches gain access to our investor network for seed and growth funding.",
    color:       BRAND.accent,
    cta:         "Upload pitch deck",
    features:    ["Pitch deck upload", "Admin review", "Investor network access", "Seed & growth rounds"],
  },
];

export default function FundingPage() {
  const router = useRouter();

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto">

        <PageHeader
          badge="Client Dashboard"
          title="Funding"
          description="Explore funding opportunities available to your business"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FUNDING_CARDS.map((card) => (
            <div
              key={card.href}
              className="rounded-2xl border p-6 flex flex-col gap-5 cursor-pointer group relative overflow-hidden"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
                transition: "background-color 0.25s, border-color 0.25s, transform 0.25s, box-shadow 0.25s",
              }}
              onClick={() => router.push(card.href)}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.backgroundColor = "rgba(255,255,255,0.07)";
                el.style.borderColor = `${card.color}35`;
                el.style.transform = "translateY(-3px)";
                el.style.boxShadow = `0 16px 48px ${card.color}12`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.backgroundColor = "rgba(255,255,255,0.04)";
                el.style.borderColor = "rgba(255,255,255,0.08)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ backgroundColor: card.color }} />

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${card.color}18`, color: card.color }}>
                {card.icon}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {card.description}
                </p>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2">
                {card.features.map((f) => (
                  <span key={f} className="text-[11px] px-2.5 py-1 rounded-full border"
                    style={{ backgroundColor: `${card.color}08`, borderColor: `${card.color}20`, color: `${card.color}cc` }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA row */}
              <div className="flex items-center justify-between pt-2 border-t mt-auto"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-sm font-semibold" style={{ color: card.color }}>{card.cta} →</span>
                <ArrowRight size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: card.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="mt-6 rounded-xl border p-4 flex items-start gap-3"
          style={{ backgroundColor: `${BRAND.accent}08`, borderColor: `${BRAND.accent}20` }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
            style={{ backgroundColor: `${BRAND.accent}20`, color: BRAND.accent }}>i</div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            All funding applications are reviewed by the AccuBridge team. Eligibility criteria and award
            amounts may vary. Ensure your business profile is complete before applying.
          </p>
        </div>

      </div>
    </div>
  );
}
