"use client";

import React from "react";
import { Ticket, ArrowRight, CheckCircle2 } from "lucide-react";
import type { RaffleEntry } from "@/types/accubridge/funding";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", muted: "#6B7280" };

interface Props {
  entries: RaffleEntry[];
  onOpen: () => void;
}

export function RaffleCard({ entries, onOpen }: Props) {
  const activeEntry  = entries.find((e) => e.status === "active");
  const totalEntries = entries.length;

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-5 cursor-pointer transition-all duration-300 group relative overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "rgba(255,255,255,0.07)";
        el.style.borderColor = `${BRAND.gold}35`;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = `0 12px 40px ${BRAND.gold}10`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "rgba(255,255,255,0.04)";
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ backgroundColor: BRAND.gold }} />

      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${BRAND.gold}18`, color: BRAND.gold }}>
          <Ticket size={22} />
        </div>
        {activeEntry && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1"
            style={{ backgroundColor: `${BRAND.gold}15`, color: BRAND.gold, borderColor: `${BRAND.gold}30` }}>
            <CheckCircle2 size={10} />Active Entry
          </span>
        )}
      </div>

      <div>
        <h3 className="text-white font-bold text-lg mb-1">Raffle Funding</h3>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Enter for a chance to win business funding. Pay a small entry fee,
          receive a unique raffle ID and number. Draws happen quarterly.
        </p>
      </div>

      <div className="flex gap-4">
        <div>
          <div className="text-xs" style={{ color: BRAND.muted }}>Entry Fee</div>
          <div className="text-sm font-bold" style={{ color: BRAND.gold }}>£25</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: BRAND.muted }}>Your Entries</div>
          <div className="text-sm font-bold text-white">{totalEntries}</div>
        </div>
        {activeEntry && (
          <div>
            <div className="text-xs" style={{ color: BRAND.muted }}>Raffle ID</div>
            <div className="text-sm font-bold font-mono" style={{ color: BRAND.gold }}>#{activeEntry.raffle_number}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <span className="text-sm font-semibold" style={{ color: BRAND.gold }}>
          {activeEntry ? "View my entry →" : "Enter next draw →"}
        </span>
        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: BRAND.gold }} />
      </div>
    </div>
  );
}
