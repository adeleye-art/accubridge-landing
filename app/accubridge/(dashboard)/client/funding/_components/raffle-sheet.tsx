"use client";

import React, { useState } from "react";
import { SystemSheet } from "@/components/accubridge/shared/system-sheet";
import type { RaffleEntry } from "@/types/accubridge/funding";
import { Ticket, CheckCircle2, CreditCard, Loader2 } from "lucide-react";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", muted: "#6B7280" };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entries: RaffleEntry[];
  onEnter: () => Promise<void>;
}

export function RaffleSheet({ isOpen, onClose, entries, onEnter }: Props) {
  const [isEntering, setIsEntering] = useState(false);
  const activeEntry = entries.find((e) => e.status === "active");

  return (
    <SystemSheet
      open={isOpen}
      onClose={onClose}
      title="Raffle Funding"
      description="Enter quarterly draws for a chance to win business funding"
      footer={
        !activeEntry ? (
          <button
            type="button"
            onClick={async () => { setIsEntering(true); await onEnter(); setIsEntering(false); }}
            disabled={isEntering}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200"
            style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
          >
            {isEntering
              ? <><Loader2 size={15} className="animate-spin" />Processing entry…</>
              : <><Ticket size={15} />Enter Next Draw — £25</>}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ backgroundColor: `${BRAND.green}10`, borderColor: `${BRAND.green}25` }}>
            <CheckCircle2 size={16} style={{ color: BRAND.green }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: BRAND.green }}>You have an active entry</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Raffle #{activeEntry.raffle_number} · Draw: {new Date(activeEntry.draw_date).toLocaleDateString("en-GB")}
              </div>
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-6">
        {/* How it works */}
        <div className="rounded-2xl border p-4 flex flex-col gap-3"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.gold }}>How It Works</div>
          {[
            "Pay a £25 entry fee to join the quarterly raffle draw",
            "Receive a unique raffle ID and number instantly",
            "Entries are stored for the next quarterly draw",
            "Winners are selected randomly — prize amounts vary by quarter",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${BRAND.gold}20`, color: BRAND.gold }}>
                {i + 1}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{text}</p>
            </div>
          ))}
        </div>

        {/* My entries */}
        {entries.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>My Raffle Entries</div>
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl border"
                style={{
                  backgroundColor: entry.status === "active" ? `${BRAND.gold}08` : "rgba(255,255,255,0.03)",
                  borderColor: entry.status === "active" ? `${BRAND.gold}30` : "rgba(255,255,255,0.08)",
                }}>
                <div>
                  <div className="text-sm font-bold font-mono" style={{ color: BRAND.gold }}>{entry.raffle_id}</div>
                  <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                    #{entry.raffle_number} · Entered {new Date(entry.entry_date).toLocaleDateString("en-GB")}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: entry.status === "active" ? `${BRAND.gold}15` : "rgba(255,255,255,0.06)",
                    color: entry.status === "active" ? BRAND.gold : BRAND.muted,
                    borderColor: entry.status === "active" ? `${BRAND.gold}30` : "rgba(255,255,255,0.1)",
                  }}>
                  {entry.status === "active" ? "Active" : entry.status === "won" ? "Won 🎉" : entry.status === "drawn" ? "Drawn" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Entry fee */}
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <CreditCard size={16} style={{ color: BRAND.muted }} />
          <div>
            <div className="text-sm text-white font-medium">Entry Fee</div>
            <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>£25 per entry — secure payment via AccuBridge</div>
          </div>
          <span className="ml-auto text-lg font-bold" style={{ color: BRAND.gold }}>£25</span>
        </div>
      </div>
    </SystemSheet>
  );
}
