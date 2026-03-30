"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface SystemSheetProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number; // px, default 480
}

export function SystemSheet({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  width = 480,
}: SystemSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 900,
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: `min(${width}px, 100vw)`,
          zIndex: 901,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg, #0e1e40 0%, #0d0d0d 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.25, 1.1, 0.4, 1)",
          boxShadow: "-16px 0 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            padding: "24px 24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ color: "white", fontWeight: 700, fontSize: "17px", margin: 0 }}>{title}</h2>
            {description && (
              <p style={{ color: "#6B7280", fontSize: "13px", marginTop: "4px" }}>{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              padding: "6px",
              flexShrink: 0,
              lineHeight: 1,
              transition: "background 0.15s",
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
