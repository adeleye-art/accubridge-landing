"use client";

import React from "react";
import { usePermissions } from "@/lib/accubridge/auth/permission-context";

interface PermissionGuardProps {
  permission: string;
  mode?: "hide" | "disable" | "replace";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  mode = "hide",
  fallback,
  children,
}: PermissionGuardProps) {
  const { can } = usePermissions();
  const allowed = can(permission);

  if (allowed) return <>{children}</>;

  if (mode === "hide") return null;
  if (mode === "replace") return <>{fallback ?? null}</>;

  // mode === "disable"
  return (
    <div
      style={{
        opacity: 0.4,
        pointerEvents: "none",
        cursor: "not-allowed",
        userSelect: "none",
      }}
      title="You don't have permission for this action"
    >
      {children}
    </div>
  );
}
