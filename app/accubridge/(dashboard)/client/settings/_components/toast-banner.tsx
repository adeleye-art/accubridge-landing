"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastBannerProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export function ToastBanner({ message, type, onDismiss }: ToastBannerProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = type === "success";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border mb-5 transition-all duration-300"
      style={{
        backgroundColor: isSuccess
          ? "rgba(6,214,160,0.12)"
          : "rgba(239,68,68,0.10)",
        borderColor: isSuccess
          ? "rgba(6,214,160,0.25)"
          : "rgba(239,68,68,0.20)",
      }}
    >
      {isSuccess ? (
        <CheckCircle2
          size={16}
          style={{ color: "#06D6A0", flexShrink: 0 }}
        />
      ) : (
        <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
      )}
      <p
        className="flex-1 text-sm"
        style={{ color: isSuccess ? "#06D6A0" : "#ef4444" }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 transition-opacity hover:opacity-60"
        style={{ color: isSuccess ? "#06D6A0" : "#ef4444" }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
