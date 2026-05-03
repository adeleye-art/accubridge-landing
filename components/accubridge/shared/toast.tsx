"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
}

interface ToastContextT {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextT>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 4000;
    setToasts((prev) => [...prev, { ...opts, id, duration }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, {
  icon: React.ReactNode;
  border: string;
  iconColor: string;
  bg: string;
}> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    border: "rgba(6,214,160,0.35)",
    iconColor: "#06D6A0",
    bg: "rgba(6,214,160,0.08)",
  },
  error: {
    icon: <XCircle size={18} />,
    border: "rgba(239,68,68,0.35)",
    iconColor: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    border: "rgba(212,175,55,0.35)",
    iconColor: "#D4AF37",
    bg: "rgba(212,175,55,0.08)",
  },
  info: {
    icon: <Info size={18} />,
    border: "rgba(62,146,204,0.35)",
    iconColor: "#3E92CC",
    bg: "rgba(62,146,204,0.08)",
  },
};

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const cfg = VARIANT_CONFIG[t.variant];
  const [visible, setVisible] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Progress bar
  const duration = t.duration ?? 4000;
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!progressRef.current || duration <= 0) return;
    const el = progressRef.current;
    el.style.transition = "none";
    el.style.width = "100%";
    requestAnimationFrame(() => {
      el.style.transition = `width ${duration}ms linear`;
      el.style.width = "0%";
    });
  }, [duration]);

  return (
    <div
      style={{
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 24px))",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.25, 1.1, 0.4, 1), opacity 0.25s ease",
        background: "rgba(10,18,40,0.96)",
        border: `1px solid ${cfg.border}`,
        backdropFilter: "blur(16px)",
        borderRadius: "14px",
        padding: "14px 16px",
        minWidth: "280px",
        maxWidth: "360px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Inner tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: cfg.bg,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "10px" }}>
        {/* Icon */}
        <div style={{ color: cfg.iconColor, flexShrink: 0, marginTop: "1px" }}>{cfg.icon}</div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "rgba(255,255,255,0.95)", fontWeight: 600, fontSize: "13px", lineHeight: "1.4" }}>
            {t.title}
          </div>
          {t.description && (
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", marginTop: "3px", lineHeight: "1.5" }}>
              {t.description}
            </div>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          style={{
            color: "rgba(255,255,255,0.4)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "1px",
            flexShrink: 0,
            lineHeight: 1,
          }}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div
          ref={progressRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "2px",
            width: "100%",
            backgroundColor: cfg.iconColor,
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}

// ─── Toaster (display stack) ──────────────────────────────────────────────────

function Toaster() {
  const { toasts, dismiss } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
