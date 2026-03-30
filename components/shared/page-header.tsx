// Server-safe — no hooks or event handlers

import React from "react";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ badge, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        {badge && (
          <div
            className="inline-block border rounded-lg px-3 py-1 text-xs mb-2"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "#6B7280" }}
          >
            {badge}
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}
