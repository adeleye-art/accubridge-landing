"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Circle, ShieldCheck, Loader2, Building2, Calendar, Hash } from "lucide-react";
import { SystemSheet } from "@/components/shared/system-sheet";
import { RegStatusBadge } from "./registration-history-table";
import { BusinessRegistration } from "@/types/tools";

const BRAND = {
  primary: "#0A2463",
  gold: "#D4AF37",
  green: "#06D6A0",
  accent: "#3E92CC",
  muted: "#6B7280",
};

const UK_STEPS = ["Choose structure", "Company details", "Directors & shares", "Submit & pay"];
const NG_STEPS = ["Choose type", "Name reservation", "Proprietor details", "Submit"];

interface BusinessDetailsSheetProps {
  reg: BusinessRegistration | null;
  onClose: () => void;
}

export function BusinessDetailsSheet({ reg, onClose }: BusinessDetailsSheetProps) {
  const [requestingAudit, setRequestingAudit] = useState(false);
  const [auditRequested, setAuditRequested] = useState(false);

  const handleRequestAudit = async () => {
    setRequestingAudit(true);
    await new Promise((res) => setTimeout(res, 1400));
    setRequestingAudit(false);
    setAuditRequested(true);
  };

  if (!reg) return null;

  const steps = reg.country === "uk" ? UK_STEPS : NG_STEPS;
  const countryLabel = reg.country === "uk" ? "🇬🇧 United Kingdom" : "🇳🇬 Nigeria";
  const bodyLabel = reg.country === "uk" ? "Companies House" : "Corporate Affairs Commission (CAC)";
  const accentColor = reg.country === "uk" ? BRAND.accent : BRAND.green;

  return (
    <SystemSheet
      open={!!reg}
      title="Business Details"
      description={reg.business_name}
      onClose={onClose}
      width={520}
      footer={
        <div className="flex flex-col gap-2">
          {auditRequested ? (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: `${BRAND.green}12`, borderColor: `${BRAND.green}30` }}
            >
              <CheckCircle2 size={15} style={{ color: BRAND.green }} />
              <span className="text-sm font-medium" style={{ color: BRAND.green }}>
                Audit request submitted — our team will be in touch.
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestAudit}
              disabled={requestingAudit}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-60"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
              onMouseEnter={(e) => { if (!requestingAudit) e.currentTarget.style.backgroundColor = "#c49b30"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BRAND.gold; }}
            >
              {requestingAudit
                ? <><Loader2 size={15} className="animate-spin" />Submitting request…</>
                : <><ShieldCheck size={15} />Request Audit</>}
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Info row */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-3"
          style={{ backgroundColor: `${accentColor}06`, borderColor: `${accentColor}18` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{reg.country === "uk" ? "🇬🇧" : "🇳🇬"}</span>
              <div>
                <div className="text-sm font-bold text-white">{countryLabel.split(" ").slice(1).join(" ")}</div>
                <div className="text-[11px]" style={{ color: accentColor }}>{bodyLabel}</div>
              </div>
            </div>
            <RegStatusBadge status={reg.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={<Building2 size={12} />} label="Structure" value={reg.structure} />
            {reg.reference && (
              <InfoRow icon={<Hash size={12} />} label="Reference" value={reg.reference} mono />
            )}
            <InfoRow icon={<Calendar size={12} />} label="Started" value={fmt(reg.initiated_at)} />
            <InfoRow icon={<Calendar size={12} />} label="Last updated" value={fmt(reg.last_updated)} />
          </div>

          {reg.notes && (
            <div
              className="px-3 py-2 rounded-lg text-xs leading-relaxed"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)" }}
            >
              {reg.notes}
            </div>
          )}
        </div>

        {/* Registration stages */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>
            Registration Stages
          </div>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            {steps.map((label, i) => {
              const stepNum = i + 1;
              const isDone = stepNum < reg.current_step || reg.status === "completed";
              const isActive = stepNum === reg.current_step && reg.status !== "completed";
              return (
                <div
                  key={label}
                  className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 size={18} style={{ color: BRAND.green }} />
                    ) : isActive ? (
                      <Clock size={18} style={{ color: BRAND.gold }} />
                    ) : (
                      <Circle size={18} style={{ color: "rgba(255,255,255,0.18)" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium"
                      style={{
                        color: isDone ? "#fff" : isActive ? BRAND.gold : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {label}
                    </div>
                    {isDone && (
                      <div className="text-[11px] mt-0.5" style={{ color: BRAND.green }}>
                        Completed
                      </div>
                    )}
                    {isActive && (
                      <div className="text-[11px] mt-0.5" style={{ color: BRAND.gold }}>
                        In progress
                      </div>
                    )}
                  </div>
                  <div
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: isDone
                        ? `${BRAND.green}15`
                        : isActive
                        ? `${BRAND.gold}15`
                        : "rgba(255,255,255,0.05)",
                      color: isDone ? BRAND.green : isActive ? BRAND.gold : "rgba(255,255,255,0.2)",
                    }}
                  >
                    Step {stepNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress summary */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-2"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: BRAND.muted }}>Overall progress</span>
            <span className="font-bold" style={{ color: reg.status === "completed" ? BRAND.green : BRAND.gold }}>
              Step {reg.current_step} of {reg.total_steps}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.round((reg.current_step / reg.total_steps) * 100)}%`,
                background: reg.status === "completed"
                  ? BRAND.green
                  : `linear-gradient(to right, ${BRAND.gold}, ${BRAND.accent})`,
              }}
            />
          </div>
        </div>
      </div>
    </SystemSheet>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>
        {icon}{label}
      </div>
      <div
        className={`text-xs font-medium text-white truncate ${mono ? "font-mono" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}
