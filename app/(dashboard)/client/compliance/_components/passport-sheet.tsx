"use client";

import React, { useState } from "react";
import { SystemSheet } from "@/components/shared/system-sheet";
import { CompliancePassport } from "@/types/compliance";
import { Download, Share2, CheckCircle2, ShieldCheck, FileCheck, Loader2 } from "lucide-react";
import { PaymentModal } from "./payment-modal";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", green: "#06D6A0", accent: "#3E92CC", muted: "#6B7280" };

interface PassportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  passport?: CompliancePassport;
  companyName: string;
  onGenerate: () => Promise<CompliancePassport>;
  onDownload: () => void;
  compliancePriceNGN?: number;
  compliancePriceGBP?: number;
  userEmail?: string;
  userId?: number;
}

export function PassportSheet({
  isOpen,
  onClose,
  passport,
  companyName,
  onGenerate,
  onDownload,
  compliancePriceNGN = 5000,
  compliancePriceGBP = 29.99,
  userEmail = "user@example.com",
  userId = 0,
}: PassportSheetProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [localPassport, setLocalPassport] = useState<CompliancePassport | undefined>(passport);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleGenerateClick = () => {
    if (compliancePriceNGN && compliancePriceGBP && userEmail && userId) {
      setPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = async (reference: string, jurisdiction: "GB" | "NG") => {
    setPaymentModalOpen(false);
    setIsGenerating(true);
    try {
      const p = await onGenerate();
      setLocalPassport(p);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const p = await onGenerate();
      setLocalPassport(p);
    } finally {
      setIsGenerating(false);
    }
  };

  const footer = localPassport ? (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onDownload}
        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200"
        style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
      >
        <Download size={15} />
        Download PDF
      </button>
      <button
        type="button"
        className="px-4 h-11 rounded-xl text-sm font-medium border flex items-center gap-1.5 transition-all duration-200"
        style={{ borderColor: `${BRAND.accent}25`, color: BRAND.accent, backgroundColor: `${BRAND.accent}10` }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}20`; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}10`; }}
      >
        <Share2 size={14} />
        Share
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={handleGenerateClick}
      disabled={isGenerating}
      className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
      style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
    >
      {isGenerating ? (
        <><Loader2 size={15} className="animate-spin" />Generating...</>
      ) : (
        <><FileCheck size={15} />Generate Compliance Passport</>
      )}
    </button>
  );

  return (
    <>
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        compliancePriceNGN={compliancePriceNGN}
        compliancePriceGBP={compliancePriceGBP}
        onPaymentSuccess={handlePaymentSuccess}
        userEmail={userEmail}
        userId={userId}
      />
      <SystemSheet
        open={isOpen}
        onClose={onClose}
        title="Compliance Passport"
        description="Your digital compliance certificate — downloadable and shareable"
        footer={footer}
      >
      <button
        type="button"
        onClick={onClose}
        className="mb-4 text-sm font-semibold flex items-center gap-1.5 transition-colors"
        style={{ color: BRAND.accent }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        ← Back to Summary
      </button>
      {localPassport ? (
        <div className="flex flex-col gap-5">
          {/* Passport card visual */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, #0D0D0D 100%)`,
              border: `1px solid ${BRAND.gold}30`,
              boxShadow: `0 0 40px ${BRAND.gold}10`,
            }}
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 1px, transparent 1px, transparent 20px)" }}
            />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center border"
                  style={{ backgroundColor: `${BRAND.gold}20`, borderColor: `${BRAND.gold}40` }}
                >
                  <span className="font-bold" style={{ color: BRAND.gold }}>A</span>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">AccuBridge</div>
                  <div className="text-[10px]" style={{ color: BRAND.gold }}>COMPLIANCE PASSPORT</div>
                </div>
              </div>
              <ShieldCheck size={24} style={{ color: BRAND.gold }} />
            </div>

            <div className="relative">
              <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                Issued to
              </div>
              <div className="text-xl font-bold text-white mt-0.5">{companyName}</div>
            </div>

            <div className="relative grid grid-cols-2 gap-4">
              {[
                { label: "Passport ID",  value: localPassport.passport_id },
                { label: "Issue Date",   value: new Date(localPassport.issued_at).toLocaleDateString("en-GB") },
                { label: "Expiry Date",  value: new Date(localPassport.expires_at).toLocaleDateString("en-GB") },
                { label: "Valid For",    value: "4 Years" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</div>
                  <div className="text-sm font-semibold font-mono" style={{ color: BRAND.gold }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div
              className="relative flex flex-wrap gap-2 pt-3 border-t"
              style={{ borderColor: `${BRAND.gold}20` }}
            >
              {Object.entries(localPassport.verification_badges).map(([key, passed]) => (
                <span
                  key={key}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: passed ? `${BRAND.green}15` : "rgba(255,255,255,0.05)",
                    color: passed ? BRAND.green : "rgba(255,255,255,0.3)",
                    borderColor: passed ? `${BRAND.green}30` : "rgba(255,255,255,0.1)",
                  }}
                >
                  {passed && <CheckCircle2 size={10} />}
                  {key.replace("_", " ").toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl border p-4 flex flex-col gap-3"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.muted }}>
              What This Passport Confirms
            </div>
            {[
              "Identity has been KYC/AML verified through AccuBridge",
              "Company registration has been validated with the relevant authority",
              "No adverse PEP or sanctions flags at time of issue",
              "Business is eligible for Compliance-Based Grants",
              "Financial records are maintained through AccuBridge",
            ].map((point) => (
              <div key={point} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: BRAND.green }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{point}</span>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl border p-3 text-xs"
            style={{ backgroundColor: `${BRAND.gold}06`, borderColor: `${BRAND.gold}15`, color: "rgba(255,255,255,0.45)" }}
          >
            ⏳ This passport expires on{" "}
            <strong style={{ color: BRAND.gold }}>
              {new Date(localPassport.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </strong>.
            You will be notified 90 days before expiry to renew.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-2xl border p-6 flex flex-col items-center gap-4 text-center"
            style={{ backgroundColor: `${BRAND.gold}06`, borderColor: `${BRAND.gold}20` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${BRAND.gold}18`, color: BRAND.gold }}
            >
              <FileCheck size={28} />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1">Ready to Generate</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                All compliance steps are complete. Click below to generate your digital passport.
              </p>
            </div>
          </div>
          <div
            className="rounded-2xl border p-4 flex flex-col gap-3"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND.muted }}>
              Your Passport Will Include
            </div>
            {[
              "Unique passport ID and AccuBridge verification seal",
              "Identity & company verification badges",
              "AML/PEP/Sanctions clear status",
              "4-year validity with renewal reminders",
              "Downloadable PDF + shareable link",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: BRAND.gold }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </SystemSheet>
    </>
  );
}
