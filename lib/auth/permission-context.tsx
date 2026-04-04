"use client";

import React, { createContext, useContext, useCallback } from "react";
import { UserRole } from "@/types/auth";
import { hasPermission } from "@/lib/auth";

interface PermissionContextT {
  role: UserRole;
  can: (permission: string) => boolean;
}

const PermissionContext = createContext<PermissionContextT>({
  role: "staff",
  can: () => false,
});

interface PermissionProviderProps {
  user: { role: UserRole };
  children: React.ReactNode;
}

export function PermissionProvider({ user, children }: PermissionProviderProps) {
  const can = useCallback(
    (permission: string) => hasPermission(user.role, permission),
    [user.role]
  );

  return (
    <PermissionContext.Provider value={{ role: user.role, can }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}
