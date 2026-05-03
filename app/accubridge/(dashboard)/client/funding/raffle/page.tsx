"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Ticket, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/accubridge/shared/page-header";
import { useToast } from "@/components/accubridge/shared/toast";
import { RafflePaymentModal } from "../_components/raffle-payment-modal";
import { useGetFundingApplicationsQuery } from "@/lib/accubridge/api/fundingApi";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };
const TICKET_PRICE_GBP = 25;
const TICKET_PRICE_NGN = 15000;
const MIN_TICKETS  = 5;

function entryStatusLabel(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case "Submitted":
    case "UnderReview":
      return { label: "Active",   color: BRAND.gold,   bg: `${BRAND.gold}15`  };
    case "Approved":
      return { label: "Won 🎉",   color: BRAND.green,  bg: `${BRAND.green}15` };
    case "Rejected":
    case "Completed":
      return { label: "Drawn",    color: BRAND.muted,  bg: "rgba(255,255,255,0.06)" };
    default:
      return { label: status,     color: BRAND.muted,  bg: "rgba(255,255,255,0.06)" };
  }
}

export default function RaffleFundingPage() {
  const [pendingTickets, setPendingTickets] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<number | undefined>(undefined);

  const { toast } = useToast();

  // Retrieve user credentials from localStorage
  useEffect(() => {
    const email = localStorage.getItem("auth_user_email") || "";
    setUserEmail(email);
    // Decode userId from JWT if needed
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const id = payload.userId ?? payload.nameid ?? payload.sub;
            if (id) setUserId(Number(id));
          }
        } catch {
          // Silent fail - userId remains undefined
        }
      }
    }
  }, []);

  const { data: fundingData, isLoading: entriesLoading } = useGetFundingApplicationsQuery({ type: 3, pageSize: 50 });
  const entries   = fundingData?.applications ?? [];
  const activeEntry = entries.find((e) => e.status === "Submitted" || e.status === "UnderReview");

  const canConfirm = pendingTickets >= MIN_TICKETS;
  const totalCostGBP  = pendingTickets * TICKET_PRICE_GBP;
  const totalCostNGN  = pendingTickets * TICKET_PRICE_NGN;

  const handleBuyTicket = () => setPendingTickets((c) => c + 1);

  const handleConfirmEntry = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (reference: string, jurisdiction: "GB" | "NG") => {
    toast({
      title: "Payment successful!",
      description: `Your raffle entry has been confirmed. Reference: ${reference}`,
      variant: "success",
    });
    // Reset the ticket counter
    setPendingTickets(0);
    // In a real scenario, you might want to refresh the entries list here
  };

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <div className="mb-4">
          <Link
            href="/accubridge/client/funding"
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
            style={{ color: BRAND.accent }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = BRAND.accent; }}
          >
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
                  { step: "01", title: "Buy tickets",        desc: `Buy at least ${MIN_TICKETS} tickets at £${TICKET_PRICE_GBP} each to enter the draw.` },
                  { step: "02", title: "Pay securely",       desc: "Complete your payment via Stripe (UK) or Paystack (Nigeria)." },
                  { step: "03", title: "Entry confirmed",    desc: "Your entry is automatically submitted. Draws happen every quarter." },
                  { step: "04", title: "Win funding",        desc: "Winners are selected randomly. Prize amounts vary by quarter." },
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
                <div className="text-sm font-semibold text-white">Entry Fee Per Ticket</div>
                <div className="text-xs mt-0.5 flex gap-3" style={{ color: BRAND.muted }}>
                  <span>🇬🇧 £{TICKET_PRICE_GBP} (Stripe)</span>
                  <span>·</span>
                  <span>🇳🇬 ₦{TICKET_PRICE_NGN} (Paystack)</span>
                </div>
              </div>
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

              {/* Active entry display */}
              {activeEntry && (
                <div className="rounded-xl border p-4 flex flex-col gap-2"
                  style={{ backgroundColor: `${BRAND.gold}08`, borderColor: `${BRAND.gold}25` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={14} style={{ color: BRAND.green }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.green }}>Active Entry</span>
                  </div>
                  <div className="text-xl font-black font-mono" style={{ color: BRAND.gold }}>#{activeEntry.id}</div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: BRAND.muted }}>
                    <span>£{activeEntry.requestedAmount} entered</span>
                    <span>·</span>
                    <span>{activeEntry.submittedAt
                      ? new Date(activeEntry.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                      : new Date(activeEntry.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              )}

              {/* Ticket purchase section */}
              <div className="flex flex-col gap-2">
                <div className="text-base font-bold text-white">Buy tickets</div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Buy at least {MIN_TICKETS} tickets to unlock your draw entry. Each ticket costs £{TICKET_PRICE_GBP}.
                </p>
              </div>

              {/* Pending tickets progress */}
              <div className="rounded-xl border p-4 flex flex-col gap-3"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.09)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>Tickets selected</span>
                  <span className="text-lg font-black" style={{ color: canConfirm ? BRAND.gold : "#fff" }}>
                    {pendingTickets} <span className="text-xs font-normal" style={{ color: BRAND.muted }}>/ {MIN_TICKETS} min</span>
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((pendingTickets / MIN_TICKETS) * 100, 100)}%`,
                      backgroundColor: canConfirm ? BRAND.gold : BRAND.accent,
                    }}
                  />
                </div>
                {pendingTickets > 0 && (
                  <div className="flex items-center justify-between text-xs" style={{ color: BRAND.muted }}>
                    <span>Total (GBP)</span>
                    <span className="font-bold text-white">£{totalCostGBP}</span>
                  </div>
                )}
              </div>

              {/* Buy ticket button */}
              <button
                type="button"
                onClick={handleBuyTicket}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.13)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; }}
              >
                <Ticket size={15} />Add a ticket — £{TICKET_PRICE_GBP}
              </button>

              {/* Confirm & pay button — only when >= MIN_TICKETS */}
              {canConfirm && (
                <button
                  type="button"
                  onClick={handleConfirmEntry}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  <CheckCircle2 size={15} />Pay & enter — {pendingTickets} tickets · £{totalCostGBP}
                </button>
              )}
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

              {entriesLoading ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin" style={{ color: BRAND.muted }} />
                </div>
              ) : entries.length === 0 ? (
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
                  {entries.map((entry) => {
                    const { label, color, bg } = entryStatusLabel(entry.status);
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-5 py-4 border-b last:border-0"
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}
                      >
                        <div>
                          <div className="text-sm font-bold font-mono" style={{ color: BRAND.gold }}>Entry #{entry.id}</div>
                          <div className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
                            £{entry.requestedAmount} · {entry.submittedAt
                              ? new Date(entry.submittedAt).toLocaleDateString("en-GB")
                              : new Date(entry.createdAt).toLocaleDateString("en-GB")}
                          </div>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                          style={{ backgroundColor: bg, color, borderColor: `${color}30` }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <RafflePaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        ticketCount={pendingTickets}
        priceGBP={TICKET_PRICE_GBP}
        priceNGN={TICKET_PRICE_NGN}
        onPaymentSuccess={handlePaymentSuccess}
        userEmail={userEmail}
        userId={userId}
      />
    </div>
  );
}
