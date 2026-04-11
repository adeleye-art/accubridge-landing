"use client";

import React from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmColor = variant === "danger" ? "#ef4444" : variant === "warning" ? "#D4AF37" : "#3E92CC";
  const confirmBg =
    variant === "danger"
      ? "rgba(239,68,68,0.15)"
      : variant === "warning"
      ? "rgba(212,175,55,0.15)"
      : "rgba(62,146,204,0.15)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #0e1e40 0%, #111 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "18px",
          padding: "28px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          animation: "dialogIn 0.25s cubic-bezier(0.25, 1.1, 0.4, 1)",
        }}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: confirmBg, border: `1px solid ${confirmColor}33` }}
        >
          <AlertTriangle size={22} style={{ color: confirmColor }} />
        </div>

        <h2 className="text-white font-bold text-lg mb-2">{title}</h2>
        {description && (
          <div className="text-sm mb-6" style={{ color: "#6B7280", lineHeight: "1.6" }}>
            {description}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: confirmBg, border: `1px solid ${confirmColor}55`, color: confirmColor }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.93) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
