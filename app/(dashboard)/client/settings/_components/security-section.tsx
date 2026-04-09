"use client";

import React, { useState } from "react";
import {
  Monitor,
  Smartphone,
  Globe,
  CheckCircle2,
  Shield,
  Lock,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useGetActiveSessionsQuery,
  useSignOutAllDevicesMutation,
  useGet2faSetupQuery,
  useEnable2faMutation,
  useDisable2faMutation,
  ApiSession,
} from "@/lib/api/authApi";

const BRAND = {
  accent: "#3E92CC",
  gold: "#D4AF37",
  green: "#06D6A0",
  muted: "#6B7280",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLastActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function DeviceIcon({ deviceType }: { deviceType: string }) {
  const isMobile = /mobile|phone|ios|android/i.test(deviceType);
  return isMobile ? <Smartphone size={16} /> : <Monitor size={16} />;
}

// ── 2FA Section ───────────────────────────────────────────────────────────────

function TwoFaSection() {
  const { data: twoFaRes, isLoading } = useGet2faSetupQuery();
  const [enable2fa, { isLoading: enabling }] = useEnable2faMutation();
  const [disable2fa, { isLoading: disabling }] = useDisable2faMutation();

  const twoFa = twoFaRes?.data;

  // Enable flow state
  const [showEnableFlow, setShowEnableFlow] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [enableError, setEnableError] = useState("");
  const [copied, setCopied] = useState(false);

  // Disable flow state
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState("");

  const handleCopySecret = () => {
    if (twoFa?.secretKey) {
      navigator.clipboard.writeText(twoFa.secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnable = async () => {
    if (!twoFa?.secretKey) return;
    setEnableError("");
    try {
      await enable2fa({ secretKey: twoFa.secretKey, code: verifyCode }).unwrap();
      setShowEnableFlow(false);
      setVerifyCode("");
    } catch {
      setEnableError("Invalid code. Please try again.");
    }
  };

  const handleDisable = async () => {
    setDisableError("");
    try {
      await disable2fa({ password: disablePassword }).unwrap();
      setShowDisableConfirm(false);
      setDisablePassword("");
    } catch {
      setDisableError("Incorrect password. Please try again.");
      throw new Error("wrong password"); // keeps dialog open
    }
  };

  if (isLoading) {
    return (
      <div
        className="rounded-2xl border p-5 flex items-center gap-3"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Loader2 size={15} className="animate-spin" style={{ color: BRAND.accent }} />
        <span className="text-xs" style={{ color: BRAND.muted }}>
          Loading 2FA status…
        </span>
      </div>
    );
  }

  const is2faEnabled = twoFa?.is2faEnabled ?? false;

  return (
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
            {is2faEnabled ? "2FA is enabled" : "2FA is not yet enabled"}
          </p>
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {is2faEnabled
              ? "Your account is protected with an authenticator app. Disable only if you want to remove this protection."
              : "Add an extra layer of security. Once enabled, you'll need an authenticator app code alongside your password to log in."}
          </p>
        </div>

        {is2faEnabled ? (
          <button
            type="button"
            onClick={() => setShowDisableConfirm(true)}
            disabled={disabling}
            className="flex-shrink-0 px-4 h-9 rounded-xl text-xs font-bold border transition-all duration-200 disabled:opacity-50"
            style={{
              borderColor: "rgba(239,68,68,0.35)",
              color: "#ef4444",
              backgroundColor: "rgba(239,68,68,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
            }}
          >
            {disabling ? <Loader2 size={13} className="animate-spin" /> : "Disable 2FA"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowEnableFlow((v) => !v)}
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
            {showEnableFlow ? "Cancel" : "Enable 2FA"}
          </button>
        )}
      </div>

      {/* Enable flow */}
      {!is2faEnabled && showEnableFlow && twoFa?.secretKey && (
        <div
          className="rounded-xl border p-4 flex flex-col gap-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            1. Open your authenticator app (Google Authenticator, Authy, etc.) and add a
            new account using the secret key below.
          </p>

          {/* Secret key */}
          <div className="flex items-center gap-2">
            <div
              className="flex-1 px-3 py-2 rounded-lg text-xs font-mono text-white border tracking-widest"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              {twoFa.secretKey}
            </div>
            <button
              type="button"
              onClick={handleCopySecret}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors duration-200"
              style={{
                backgroundColor: copied ? `${BRAND.green}15` : "rgba(255,255,255,0.06)",
                borderColor: copied ? `${BRAND.green}30` : "rgba(255,255,255,0.1)",
                color: copied ? BRAND.green : BRAND.muted,
              }}
              title="Copy secret key"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            2. Enter the 6-digit code from your authenticator app to verify.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => {
                setVerifyCode(e.target.value.replace(/\D/g, ""));
                setEnableError("");
              }}
              className="flex-1 h-10 px-3 rounded-xl text-sm text-white border outline-none tracking-widest text-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderColor: enableError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(62,146,204,0.6)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = enableError
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(255,255,255,0.1)";
              }}
            />
            <button
              type="button"
              onClick={handleEnable}
              disabled={verifyCode.length !== 6 || enabling}
              className="px-5 h-10 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                backgroundColor: BRAND.green,
                color: "#0D0D0D",
              }}
            >
              {enabling ? <Loader2 size={13} className="animate-spin" /> : null}
              Verify & Enable
            </button>
          </div>

          {enableError && (
            <p className="text-xs text-red-400">{enableError}</p>
          )}
        </div>
      )}

      {/* Disable confirm dialog */}
      <ConfirmDialog
        open={showDisableConfirm}
        onCancel={() => {
          setShowDisableConfirm(false);
          setDisablePassword("");
          setDisableError("");
        }}
        onConfirm={handleDisable}
        variant="danger"
        title="Disable Two-Factor Authentication"
        description={
          <div className="flex flex-col gap-3">
            <p>
              Disabling 2FA will immediately sign you out of all devices. Enter your
              current password to confirm.
            </p>
            <input
              type="password"
              placeholder="Current password"
              value={disablePassword}
              onChange={(e) => {
                setDisablePassword(e.target.value);
                setDisableError("");
              }}
              className="w-full h-10 px-3 rounded-lg text-sm text-white border outline-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderColor: disableError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.15)",
              }}
            />
            {disableError && (
              <p className="text-xs text-red-400">{disableError}</p>
            )}
          </div>
        }
        confirmLabel="Disable 2FA"
        cancelLabel="Cancel"
      />
    </div>
  );
}

// ── Sessions Section ──────────────────────────────────────────────────────────

function SessionsSection() {
  const { data: sessionsRes, isLoading } = useGetActiveSessionsQuery();
  const [signOutAll, { isLoading: signingOut }] = useSignOutAllDevicesMutation();
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  const sessions: ApiSession[] = sessionsRes?.data ?? [];
  const otherSessions = sessions.filter((s) => !s.isCurrentDevice);

  return (
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
        {otherSessions.length > 0 && (
          <button
            type="button"
            onClick={() => setRevokeAllOpen(true)}
            disabled={signingOut}
            className="text-xs transition-colors duration-200 disabled:opacity-50"
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

      {isLoading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin" style={{ color: BRAND.accent }} />
          <span className="text-xs" style={{ color: BRAND.muted }}>
            Loading sessions…
          </span>
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-xs py-2" style={{ color: BRAND.muted }}>
          No active sessions found.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{
                backgroundColor: session.isCurrentDevice
                  ? `${BRAND.green}06`
                  : "rgba(255,255,255,0.03)",
                borderColor: session.isCurrentDevice
                  ? `${BRAND.green}20`
                  : "rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: session.isCurrentDevice
                    ? `${BRAND.green}15`
                    : "rgba(255,255,255,0.06)",
                  color: session.isCurrentDevice ? BRAND.green : BRAND.muted,
                }}
              >
                <DeviceIcon deviceType={session.deviceType} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">
                    {session.deviceType}
                  </span>
                  {session.isCurrentDevice && (
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
                    {formatLastActive(session.lastActiveAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={revokeAllOpen}
        onCancel={() => setRevokeAllOpen(false)}
        onConfirm={async () => {
          await signOutAll().unwrap();
          setRevokeAllOpen(false);
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

// ── Root export ───────────────────────────────────────────────────────────────

export function SecuritySection() {
  return (
    <div className="flex flex-col gap-5">
      <TwoFaSection />
      <SessionsSection />

      {/* Security note */}
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
    </div>
  );
}
