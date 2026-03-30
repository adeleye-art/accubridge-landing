"use client";

import React, { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AIBusinessIdea } from "@/types/tools";

const BRAND = {
  primary: "#0A2463",
  accent: "#3E92CC",
  gold: "#D4AF37",
  green: "#06D6A0",
  muted: "#6B7280",
};

const REVENUE_COLORS: Record<AIBusinessIdea["revenue_potential"], string> = {
  Low: "#6B7280",
  Medium: "#D4AF37",
  High: "#3E92CC",
  "Very High": "#06D6A0",
};

const MODEL_COLORS: Record<string, string> = {
  B2B: "#3E92CC",
  B2C: "#D4AF37",
  B2B2C: "#06D6A0",
  SaaS: "#a78bfa",
  Marketplace: "#fb923c",
  Service: "#60a5fa",
  Product: "#34d399",
  Franchise: "#f472b6",
};

interface IdeaCardProps {
  idea: AIBusinessIdea;
  index: number;
  onSave: (id: string) => void;
}

export function IdeaCard({ idea, index, onSave }: IdeaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const revColor = REVENUE_COLORS[idea.revenue_potential];
  const modelColor = MODEL_COLORS[idea.business_model] || BRAND.accent;

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-300"
      style={{
        background:
          "linear-gradient(135deg, rgba(15,30,58,0.9) 0%, rgba(10,36,99,0.4) 100%)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      {/* Card header */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          {/* Idea number */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: `${BRAND.accent}20`,
                color: BRAND.accent,
              }}
            >
              #{index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-base truncate">
                {idea.title}
              </h4>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {idea.tagline}
              </p>
            </div>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={() => onSave(idea.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{
              backgroundColor: idea.saved
                ? `${BRAND.gold}20`
                : "rgba(255,255,255,0.06)",
              color: idea.saved ? BRAND.gold : BRAND.muted,
            }}
            onMouseEnter={(e) => {
              if (!idea.saved) {
                e.currentTarget.style.backgroundColor = `${BRAND.gold}15`;
                e.currentTarget.style.color = BRAND.gold;
              }
            }}
            onMouseLeave={(e) => {
              if (!idea.saved) {
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = BRAND.muted;
              }
            }}
            title={idea.saved ? "Saved" : "Save idea"}
          >
            {idea.saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide"
            style={{
              backgroundColor: `${modelColor}15`,
              color: modelColor,
            }}
          >
            {idea.business_model}
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1"
            style={{
              backgroundColor: `${revColor}12`,
              color: revColor,
              borderColor: `${revColor}25`,
            }}
          >
            <TrendingUp size={9} />
            {idea.revenue_potential} Revenue
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.6)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <DollarSign size={9} />
            {idea.startup_cost_estimate}
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.6)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Clock size={9} />
            {idea.time_to_first_revenue}
          </span>
        </div>

        {/* Skills match bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[11px]" style={{ color: BRAND.muted }}>
              Skills match
            </span>
            <span
              className="text-[11px] font-bold"
              style={{
                color:
                  idea.skills_match >= 70
                    ? BRAND.green
                    : idea.skills_match >= 50
                    ? BRAND.gold
                    : "#ef4444",
              }}
            >
              {idea.skills_match}%
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${idea.skills_match}%`,
                backgroundColor:
                  idea.skills_match >= 70
                    ? BRAND.green
                    : idea.skills_match >= 50
                    ? BRAND.gold
                    : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Description */}
        <p
          className="text-xs leading-relaxed"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {idea.description}
        </p>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 self-start"
          style={{ color: BRAND.accent }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = BRAND.accent;
          }}
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Show less" : "View key steps & risks"}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          className="px-5 pb-5 flex flex-col gap-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Key steps */}
            <div className="flex flex-col gap-2">
              <div
                className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: BRAND.green }}
              >
                <CheckCircle2 size={12} /> Key Steps
              </div>
              {idea.key_steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: `${BRAND.green}20`,
                      color: BRAND.green,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Risks */}
            <div className="flex flex-col gap-2">
              <div
                className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: "#ef4444" }}
              >
                <AlertCircle size={12} /> Risks to Consider
              </div>
              {idea.risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                    style={{ backgroundColor: "#ef4444" }}
                  />
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {risk}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
