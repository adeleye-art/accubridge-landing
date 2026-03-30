"use client";

import React, { useState } from "react";
import {
  Monitor,
  Smartphone,
  Globe,
  CheckCircle2,
  X,
  Shield,
  Lock,
} from "lucide-react";
import { ActiveSession } from "@/types/settings";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const BRAND = {
  accent: "#3E92CC",
  gold: "#D4AF37",
  green: "#06D6A0",
  muted: "#6B7280",
};

interface SecuritySectionProps {
  sessions: ActiveSession[];
  onRevokeSession: (id: string) => Promise<void>;
  onRevokeAll: () => Promise<void>;
}

export function SecuritySection({
  sessions,
  onRevokeSession,
  onRevokeAll,
}: SecuritySectionProps) {
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [revokeAll, setRevokeAll] = useState(false);

  const getDeviceIcon = (device: string) => {
    if (
      device.toLowerCase().includes("iphone") ||
      device.toLowerCase().includes("android")
    )
      return <Smartphone size={16} />;
    return <Monitor size={16} />;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 2FA display */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <Shield size={15} style={{ color: BRAND.accent }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: BRAND.accent }}
          >
            Two-Factor Authentication
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white font-medium">
              2FA is not yet enabled
            </p>
            <p
              className="text-xs mt-1 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Add an extra layer of security. Once enabled, you&apos;ll need an
              authenticator app code alongside your password to log in.
            </p>
          </div>
          <button
            type="button"
            className="flex-shrink-0 px-4 h-9 rounded-xl text-xs font-bold border transition-all duration-200"
            style={{
              borderColor: `${BRAND.green}35`,
              color: BRAND.green,
              backgroundColor: `${BRAND.green}10`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${BRAND.green}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${BRAND.green}10`;
            }}
          >
            Enable 2FA
          </button>
        </div>
      </div>

      {/* Active sessions */}
      <div
        className="rounded-2xl border p-5 flex flex-col gap-4"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={15} style={{ color: BRAND.accent }} />
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: BRAND.accent }}
            >
              Active Sessions
            </span>
          </div>
          {sessions.filter((s) => !s.is_current).length > 0 && (
            <button
              type="button"
              onClick={() => setRevokeAll(true)}
              className="text-xs transition-colors duration-200"
              style={{ color: "#ef4444" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ff6b6b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#ef4444";
              }}
            >
              Sign out all other devices
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-4 p-4 rounded-xl border transition-colors duration-150"
              style={{
                backgroundColor: session.is_current
                  ? `${BRAND.green}06`
                  : "rgba(255,255,255,0.03)",
                borderColor: session.is_current
                  ? `${BRAND.green}20`
                  : "rgba(255,255,255,0.07)",
              }}
            >
              {/* Device icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: session.is_current
                    ? `${BRAND.green}15`
                    : "rgba(255,255,255,0.06)",
                  color: session.is_current ? BRAND.green : BRAND.muted,
                }}
              >
                {getDeviceIcon(session.device)}
              </div>

              {/* Session info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">
                    {session.device}
                  </span>
                  {session.is_current && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: `${BRAND.green}15`,
                        color: BRAND.green,
                      }}
                    >
                      <CheckCircle2 size={9} /> This device
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs" style={{ color: BRAND.muted }}>
                    {session.browser}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                  <span className="text-xs" style={{ color: BRAND.muted }}>
                    {session.location}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                  <span className="text-xs" style={{ color: BRAND.muted }}>
                    {session.last_active}
                  </span>
                </div>
              </div>

              {/* Revoke */}
              {!session.is_current && (
                <button
                  type="button"
                  onClick={() => setRevokeTarget(session.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: BRAND.muted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(239,68,68,0.15)";
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.borderColor =
                      "rgba(239,68,68,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = BRAND.muted;
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.1)";
                  }}
                  title="Sign out this device"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Password hint */}
      <div
        className="rounded-2xl border p-4 flex items-start gap-3"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <Lock
          size={14}
          style={{ color: BRAND.muted, flexShrink: 0, marginTop: 2 }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          For security, you will be signed out of all other devices when you
          change your password. Active session data is refreshed every 30
          minutes.
        </p>
      </div>

      {/* Revoke single session */}
      <ConfirmDialog
        open={!!revokeTarget}
        onCancel={() => setRevokeTarget(null)}
        onConfirm={async () => {
          await onRevokeSession(revokeTarget!);
          setRevokeTarget(null);
        }}
        variant="warning"
        title="Sign Out Device"
        description="This will immediately sign out the selected device. They will need to log in again."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />

      {/* Revoke all */}
      <ConfirmDialog
        open={revokeAll}
        onCancel={() => setRevokeAll(false)}
        onConfirm={async () => {
          await onRevokeAll();
          setRevokeAll(false);
        }}
        variant="danger"
        title="Sign Out All Other Devices"
        description="All sessions except this one will be immediately terminated. Other devices will need to log in again."
        confirmLabel="Sign Out All"
        cancelLabel="Cancel"
      />
    </div>
  );
}
