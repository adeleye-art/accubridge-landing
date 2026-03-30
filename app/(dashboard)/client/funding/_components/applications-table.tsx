"use client";

import React from "react";
import { Eye } from "lucide-react";
import type { FundingApplication } from "@/types/funding";
import { AppStatusBadge, FundingTypeBadge } from "./funding-badges";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280" };

interface Props {
  applications: FundingApplication[];
  onViewAll: () => void;
}

export function ApplicationsTable({ applications, onViewAll }: Props) {
  const preview = applications.slice(0, 5);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-base">My Applications</h3>
          <p className="text-xs mt-0.5" style={{ color: BRAND.muted }}>
            {applications.length} total application{applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold border transition-all duration-200"
          style={{ backgroundColor: `${BRAND.accent}12`, color: BRAND.accent, borderColor: `${BRAND.accent}25` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}22`; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${BRAND.accent}12`; }}
        >
          <Eye size={13} />View All
        </button>
      </div>

      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_120px_100px] px-4 py-3 border-b"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.06)" }}>
          {["Application", "Type", "Status", "Date"].map((h) => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: BRAND.muted }}>{h}</span>
          ))}
        </div>

        {preview.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: BRAND.muted }}>No applications yet — explore funding options above</p>
          </div>
        ) : (
          preview.map((app) => (
            <div
              key={app.id}
              className="grid grid-cols-[1fr_100px_120px_100px] px-4 py-3 border-b transition-colors duration-150"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div className="min-w-0 pr-3">
                <div className="text-sm font-medium text-white truncate">{app.title}</div>
                {app.reference && (
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: BRAND.muted }}>{app.reference}</div>
                )}
              </div>
              <div className="flex items-center"><FundingTypeBadge type={app.type} /></div>
              <div className="flex items-center"><AppStatusBadge status={app.status} /></div>
              <div className="flex items-center text-xs font-mono" style={{ color: BRAND.muted }}>
                {new Date(app.submitted_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          ))
        )}

        {applications.length > 5 && (
          <div className="px-4 py-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
            <button type="button" onClick={onViewAll}
              className="text-xs transition-colors duration-200"
              style={{ color: BRAND.accent }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.accent; }}>
              + {applications.length - 5} more applications — View all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
