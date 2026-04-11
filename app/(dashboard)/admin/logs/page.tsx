"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useGetActivityLogsQuery } from "@/lib/api/activityLogApi";

const BRAND = { gold: "#D4AF37", accent: "#3E92CC", muted: "#6B7280", primary: "#0A2463" };

const LOG_TYPES = ["All", "Login", "Logout", "Create", "Update", "Delete"] as const;
type LogTypeFilter = (typeof LOG_TYPES)[number];

const STATUS_FILTERS = ["All", "Success", "Failed"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function typeBadge(logType: string) {
  const map: Record<string, { color: string; bg: string }> = {
    Login:    { color: "#3E92CC",  bg: "rgba(62,146,204,0.12)"   },
    Logout:   { color: "#6B7280",  bg: "rgba(107,114,128,0.12)"  },
    Create:   { color: "#06D6A0",  bg: "rgba(6,214,160,0.12)"    },
    Update:   { color: "#D4AF37",  bg: "rgba(212,175,55,0.12)"   },
    Delete:   { color: "#ef4444",  bg: "rgba(239,68,68,0.12)"    },
  };
  return map[logType] ?? { color: "#a78bfa", bg: "rgba(167,139,250,0.12)" };
}

function statusBadge(status: string) {
  if (status === "Success") return { color: "#06D6A0", bg: "rgba(6,214,160,0.12)" };
  if (status === "Failed")  return { color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
  return { color: "#6B7280", bg: "rgba(107,114,128,0.12)" };
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className ?? ""}`}
      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    />
  );
}

export default function AdminLogsPage() {
  const [search, setSearch]           = useState("");
  const [activeType, setActiveType]   = useState<LogTypeFilter>("All");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("All");
  const [page, setPage]               = useState(1);

  const { data, isLoading, isError } = useGetActivityLogsQuery({
    search:   search || undefined,
    logType:  activeType !== "All" ? activeType : undefined,
    status:   activeStatus !== "All" ? activeStatus : undefined,
    page,
    pageSize: 20,
  });

  const logs        = data?.logs ?? [];
  const totalCount  = data?.totalCount ?? 0;
  const totalPages  = data?.totalPages ?? 1;

  return (
    <div className="p-5 md:p-8 text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div>
          <div className="inline-block border rounded-lg px-3 py-1 text-xs mb-2" style={{ borderColor: "rgba(255,255,255,0.1)", color: BRAND.muted }}>Admin</div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-sm mt-0.5" style={{ color: BRAND.muted }}>Chronological record of all platform actions.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border max-w-xs flex-1" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <Search size={14} style={{ color: BRAND.muted }} />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent outline-none text-sm text-white placeholder-[#6B7280] flex-1"
            />
          </div>

          {/* Log type tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {LOG_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setActiveType(t); setPage(1); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: activeType === t ? BRAND.gold : "rgba(255,255,255,0.06)",
                  color: activeType === t ? BRAND.primary : "rgba(255,255,255,0.6)",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setActiveStatus(s); setPage(1); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: activeStatus === s ? BRAND.accent : "rgba(255,255,255,0.06)",
                  color: activeStatus === s ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <span className="text-xs ml-auto" style={{ color: BRAND.muted }}>{totalCount} entries</span>
        </div>

        {/* Log table */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Time", "User", "Message", "IP Address", "Type", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: BRAND.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-5 py-3.5">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : isError
                    ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>
                          Failed to load activity logs.
                        </td>
                      </tr>
                    )
                    : logs.length === 0
                      ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: BRAND.muted }}>
                            No log entries match your filters.
                          </td>
                        </tr>
                      )
                      : logs.map((l) => {
                          const type   = typeBadge(l.logType);
                          const status = statusBadge(l.status);
                          return (
                            <tr key={l.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                              <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: BRAND.muted }}>{l.createdAtFormatted}</td>
                              <td className="px-5 py-3.5 font-medium text-sm">{l.userName}</td>
                              <td className="px-5 py-3.5 text-sm max-w-xs truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{l.message}</td>
                              <td className="px-5 py-3.5 text-xs font-mono" style={{ color: BRAND.muted }}>{l.ipAddress ?? "—"}</td>
                              <td className="px-5 py-3.5">
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: type.color, backgroundColor: type.bg }}>{l.logType}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: status.color, backgroundColor: status.bg }}>{l.status}</span>
                              </td>
                            </tr>
                          );
                        })
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: BRAND.muted }}>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
