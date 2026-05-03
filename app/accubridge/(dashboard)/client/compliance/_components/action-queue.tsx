"use client";

import React from "react";
import { Upload, Link2, Search, Wrench, ArrowRight, AlertCircle, Minus } from "lucide-react";
import { ActionItem } from "@/types/accubridge/compliance";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

const ACTION_CONFIG = {
  upload:  { icon: <Upload size={13} />,  label: "Upload",  color: BRAND.accent },
  connect: { icon: <Link2 size={13} />,   label: "Connect", color: BRAND.green },
  review:  { icon: <Search size={13} />,  label: "Review",  color: BRAND.gold },
  fix:     { icon: <Wrench size={13} />,  label: "Fix Now", color: "#fb923c" },
};

const PRIORITY_CONFIG = {
  high:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)",  icon: <AlertCircle size={11} />, label: "High" },
  medium: { color: BRAND.gold, bg: `${BRAND.gold}12`,     border: `${BRAND.gold}25`,       icon: <Minus size={11} />,       label: "Medium" },
  low:    { color: BRAND.muted, bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)", icon: <Minus size={11} />,  label: "Low" },
};

interface ActionQueueProps {
  items: ActionItem[];
  onAction: (item: ActionItem) => void;
}

export function ActionQueue({ items, onAction }: ActionQueueProps) {
  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 flex flex-col items-center gap-3 text-center"
        style={{ backgroundColor: `${BRAND.green}06`, borderColor: `${BRAND.green}20` }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green }}>
          <Search size={18} />
        </div>
        <div className="text-sm font-bold text-white">All actions complete</div>
        <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          Your compliance profile is fully up to date. Well done!
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-white font-bold text-base">What you need to do next</h3>
        <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
          {items.length} action{items.length !== 1 ? "s" : ""} required · complete these to improve your compliance score
        </p>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        {items.map((item, idx) => {
          const pCfg = PRIORITY_CONFIG[item.priority];
          const aCfg = ACTION_CONFIG[item.action_type];

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-4 border-b last:border-0 transition-colors duration-150"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.025)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {/* Index */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
              >
                {idx + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white">{item.title}</span>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ backgroundColor: pCfg.bg, color: pCfg.color, borderColor: pCfg.border }}
                  >
                    {pCfg.icon}{pCfg.label}
                  </span>
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{item.description}</div>
                {item.due_date && (
                  <div className="text-[11px] mt-0.5" style={{ color: pCfg.color }}>
                    Due: {new Date(item.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => onAction(item)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold flex-shrink-0 border transition-all duration-200"
                style={{ backgroundColor: `${aCfg.color}12`, color: aCfg.color, borderColor: `${aCfg.color}25` }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${aCfg.color}22`; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${aCfg.color}12`; }}
              >
                {aCfg.icon}{aCfg.label}
                <ArrowRight size={11} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
