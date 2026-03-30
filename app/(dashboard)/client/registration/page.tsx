"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2, Clock, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RegistrationHistoryTable } from "./_components/registration-history-table";
import { NewRegistrationSheet } from "./_components/new-registration-sheet";
import { BusinessRegistration } from "@/types/tools";

const BRAND = {
  primary: "#0A2463",
  gold: "#D4AF37",
  green: "#06D6A0",
  accent: "#3E92CC",
  muted: "#6B7280",
};

const MOCK_REGISTRATIONS: BusinessRegistration[] = [
  {
    id: "reg1",
    country: "uk",
    business_name: "Apex Solutions Ltd",
    structure: "Private Limited Company",
    status: "completed",
    initiated_at: "2026-01-10",
    last_updated: "2026-01-18",
    reference: "15234789",
    estimated_completion: "2026-01-18",
    current_step: 4,
    total_steps: 4,
    notes: "Certificate of Incorporation issued",
  },
  {
    id: "reg2",
    country: "nigeria",
    business_name: "GreenPath Ventures",
    structure: "Limited Liability Company",
    status: "in_progress",
    initiated_at: "2026-03-05",
    last_updated: "2026-03-20",
    reference: "CAC-2026-044821",
    current_step: 2,
    total_steps: 4,
    notes: "Name reservation approved — awaiting document submission",
  },
  {
    id: "reg3",
    country: "uk",
    business_name: "BridgeTech Consulting LLP",
    structure: "LLP",
    status: "draft",
    initiated_at: "2026-03-25",
    last_updated: "2026-03-25",
    current_step: 1,
    total_steps: 4,
  },
];

export default function RegistrationPage() {
  const [registrations, setRegistrations] =
    useState<BusinessRegistration[]>(MOCK_REGISTRATIONS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<BusinessRegistration | null>(null);

  const handleNewComplete = async (regData: Omit<BusinessRegistration, "id">) => {
    await new Promise((res) => setTimeout(res, 1000));
    const newReg: BusinessRegistration = {
      ...regData,
      id: `reg-${Date.now()}`,
      reference:
        regData.country === "uk"
          ? String(Math.floor(Math.random() * 90000000) + 10000000)
          : `CAC-${new Date().getFullYear()}-${String(
              Math.floor(Math.random() * 900000) + 100000
            )}`,
    };
    setRegistrations((prev) => [newReg, ...prev]);
    setEditingReg(null);
    setSheetOpen(false);
  };

  const handleResume = (reg: BusinessRegistration) => {
    setEditingReg(reg);
    setSheetOpen(true);
  };

  const handleViewDetails = (reg: BusinessRegistration) => {
    setEditingReg(reg);
    setSheetOpen(true);
  };

  const completed = registrations.filter((r) => r.status === "completed").length;
  const inProgress = registrations.filter((r) =>
    ["in_progress", "draft", "pending_review"].includes(r.status)
  ).length;
  const total = registrations.length;

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          badge="Tools"
          title="Business Registration"
          description="Register your business with Companies House (UK) or CAC (Nigeria) — guided step-by-step"
          actions={
            <button
              type="button"
              onClick={() => {
                setEditingReg(null);
                setSheetOpen(true);
              }}
              className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#c49b30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = BRAND.gold;
              }}
            >
              <Plus size={15} />
              New Registration
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Total Registrations",
              value: total,
              color: "rgba(255,255,255,0.7)",
              icon: <FileText size={16} />,
            },
            {
              label: "In Progress",
              value: inProgress,
              color: BRAND.gold,
              icon: <Clock size={16} />,
            },
            {
              label: "Completed",
              value: completed,
              color: BRAND.green,
              icon: <CheckCircle2 size={16} />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border p-4 flex flex-col gap-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="text-xs" style={{ color: BRAND.muted }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Info panels — UK + Nigeria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            {
              flag: "🇬🇧",
              country: "United Kingdom",
              body: "Companies House",
              color: BRAND.accent,
              points: [
                "Certificate within 24 hours",
                "Ltd, LLP, Sole Trader, CIC",
                "Filing fee from £50",
                "Fully online via AccuBridge",
              ],
            },
            {
              flag: "🇳🇬",
              country: "Nigeria",
              body: "Corporate Affairs Commission (CAC)",
              color: BRAND.green,
              points: [
                "Name reservation in 24–48 hours",
                "Business Name, LLC, Incorporated Trustee",
                "Real-time status tracking",
                "Full document management",
              ],
            },
          ].map((opt) => (
            <div
              key={opt.country}
              className="rounded-2xl border p-4 flex flex-col gap-3"
              style={{
                backgroundColor: `${opt.color}06`,
                borderColor: `${opt.color}18`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{opt.flag}</span>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {opt.country}
                  </div>
                  <div className="text-[11px]" style={{ color: opt.color }}>
                    {opt.body}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {opt.points.map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <div
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* History table */}
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-white font-bold text-base">
              Registration History
            </h3>
            <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
              {total} registration{total !== 1 ? "s" : ""} · click Resume to
              continue a draft
            </p>
          </div>
          <RegistrationHistoryTable
            registrations={registrations}
            onViewDetails={handleViewDetails}
            onResume={handleResume}
          />
        </div>

        <NewRegistrationSheet
          isOpen={sheetOpen}
          onClose={() => {
            setSheetOpen(false);
            setEditingReg(null);
          }}
          onComplete={handleNewComplete}
          editRegistration={editingReg}
        />
      </div>
    </div>
  );
}
