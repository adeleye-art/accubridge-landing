"use client";

import React from "react";
import { Loader2 } from "lucide-react";

const BRAND = { primary: "#0A2463", gold: "#D4AF37", muted: "#6B7280" };

interface SettingsSaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SettingsSaveBar({
  isDirty,
  isSaving,
  onSave,
  onDiscard,
}: SettingsSaveBarProps) {
  if (!isDirty) return null;

  return (
    <div
      className="sticky bottom-0 flex items-center justify-between px-5 py-3 border-t rounded-b-2xl mt-5"
      style={{
        backgroundColor: "rgba(10,36,99,0.95)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-xs" style={{ color: BRAND.muted }}>
        You have unsaved changes
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSaving}
          className="px-4 h-9 rounded-xl text-xs font-medium border transition-all duration-200"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.6)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold transition-all duration-200"
          style={{ backgroundColor: BRAND.gold, color: BRAND.primary }}
          onMouseEnter={(e) => {
            if (!isSaving) e.currentTarget.style.backgroundColor = "#c49b30";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND.gold;
          }}
        >
          {isSaving && <Loader2 size={13} className="animate-spin" />}
          Save changes
        </button>
      </div>
    </div>
  );
}
