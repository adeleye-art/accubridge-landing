"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Ticket, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import type { RaffleEntry } from "@/types/funding";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

export default function RaffleFundingPage() {
  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [isEntering, setIsEntering] = useState(false);
  const [justEntered, setJustEntered] = useState(false);

  const activeEntry = entries.find((e) => e.status === "active");

  const handleEnter = async () => {
    setIsEntering(true);
    await new Promise((res) => setTimeout(res, 1200));
    const newEntry: RaffleEntry = {
      id: `r${Date.now()}`,
      raffle_id: `RFL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      raffle_number: Math.floor(Math.random() * 2000) + 1,
      entry_date: new Date().toISOString().split("T")[0],
      draw_date: "2026-06-30",
      status: "active",
      entry_fee: 25,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setIsEntering(false);
    setJustEntered(true);
    setTimeout(() => setJustEntered(false), 3000);
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <div className="mb-4">
          <Link href="/client/funding"
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
            style={{ color: BRAND.accent }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = BRAND.accent; }}>
            <ChevronLeft size={15} />Back to Funding
          </Link>
        </div>

        <PageHeader
          badge="Funding"
          title="Raffle Funding"
          description="Enter quarterly draws for a chance to win business funding"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* Left — How it works + entry fee */}
          <div className="flex flex-col gap-5">

            {/* How it works */}
            <div className="rounded-2xl border p-6 flex flex-col gap-5"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${BRAND.gold}18`, color: BRAND.gold }}>
                  <Ticket size={20} />
                </div>
                <h2 className="text-white font-bold text-base">How It Works</h2>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { step: "01", title: "Pay entry fee",       desc: "Pay a £25 entry fee to join the next quarterly raffle draw." },
                  { step: "02", title: "Receive your ticket", desc: "You'll instantly receive a unique raffle ID and a numbered ticket." },
                  { step: "03", title: "Wait for the draw",   desc: "Draws happen every quarter. Your entry is automatically included." },
                  { step: "04", title: "Win funding",         desc: "Winners are selected randomly. Prize amounts vary by quarter." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ backgroundColor: `${BRAND.gold}12`, color: BRAND.gold, fontVariantNumeric: "tabular-nums" }}>
                      {item.step}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-0.5">{item.title}</div>
                      <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Entry fee info */}
            <div className="rounded-2xl border p-5 flex items-center gap-4"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: BRAND.muted }}>
                <CreditCard size={18} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Entry Fee</div>
                <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                  Secure payment processed via AccuBridge · Non-refundable
                </div>
              </div>
              <span className="text-2xl font-black" style={{ color: BRAND.gold }}>£25</span>
            </div>

            {/* Next draw info */}
            <div className="rounded-2xl border p-5 flex items-center gap-4"
              style={{ backgroundColor: `${BRAND.gold}06`, borderColor: `${BRAND.gold}20` }}>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: BRAND.gold }}>Next Draw</div>
                <div className="text-sm font-bold text-white">30 June 2026</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Q2 2026 Quarterly Draw</div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: BRAND.muted }}>Prize Pool</div>
                <div className="text-lg font-black" style={{ color: BRAND.gold }}>£5,000</div>
              </div>
            </div>
          </div>

          {/* Right — CTA + entries */}
          <div className="flex flex-col gap-5">

            {/* CTA card */}
            <div className="rounded-2xl border p-6 flex flex-col gap-5"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: activeEntry ? `${BRAND.gold}30` : "rgba(255,255,255,0.08)" }}>

              {justEntered && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border"
                  style={{ backgroundColor: `${BRAND.green}12`, borderColor: `${BRAND.green}30` }}>
                  <CheckCircle2 size={15} style={{ color: BRAND.green }} />
                  <span className="text-sm font-medium" style={{ color: BRAND.green }}>Entry confirmed!</span>
                </div>
              )}

              {activeEntry ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} style={{ color: BRAND.green }} />
                    <span className="text-sm font-bold" style={{ color: BRAND.green }}>You have an active entry</span>
                  </div>
                  <div className="rounded-xl border p-4 flex flex-col gap-2"
                    style={{ backgroundColor: `${BRAND.gold}08`, borderColor: `${BRAND.gold}25` }}>
                    <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>Raffle ID</div>
                    <div className="text-xl font-black font-mono" style={{ color: BRAND.gold }}>{activeEntry.raffle_id}</div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: BRAND.muted }}>
                      <span>Ticket #{activeEntry.raffle_number}</span>
                      <span>·</span>
                      <span>Draw: {new Date(activeEntry.draw_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    You can enter additional draws. Each entry gets its own unique ID and ticket number.
                  </p>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-base font-bold text-white">Enter the next draw</div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Pay £25 to secure your spot in the Q2 2026 draw. You'll receive a unique raffle ID immediately.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleEnter}
                disabled={isEntering}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60"
                style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
                onMouseEnter={(e) => { if (!isEntering) e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {isEntering
                  ? <><Loader2 size={15} className="animate-spin" />Processing…</>
                  : <><Ticket size={15} />{activeEntry ? "Enter another draw — £25" : "Enter next draw — £25"}</>}
              </button>
            </div>

            {/* My entries */}
            <div className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" }}>
                <span className="text-sm font-bold text-white">My Entries</span>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: BRAND.muted }}>
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {entries.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: BRAND.muted }}>
                    <Ticket size={22} />
                  </div>
                  <div className="text-sm font-medium" style={{ color: BRAND.muted }}>No entries yet</div>
                  <div className="text-xs text-center max-w-[200px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Enter your first draw above to get started
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {entries.map((entry) => (
                    <div key={entry.id}
                      className="flex items-center justify-between px-5 py-4 border-b last:border-0"
                      style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <div>
                        <div className="text-sm font-bold font-mono" style={{ color: BRAND.gold }}>{entry.raffle_id}</div>
                        <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                          #{entry.raffle_number} · {new Date(entry.entry_date).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: entry.status === "active" ? `${BRAND.gold}15` : "rgba(255,255,255,0.06)",
                          color: entry.status === "active" ? BRAND.gold : BRAND.muted,
                          borderColor: entry.status === "active" ? `${BRAND.gold}30` : "rgba(255,255,255,0.1)",
                        }}>
                        {entry.status === "active" ? "Active" : entry.status === "won" ? "Won 🎉" : "Drawn"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
