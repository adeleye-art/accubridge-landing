import { UserRole } from "@/types/auth";
import { ROLE_REDIRECTS, ROLE_PERMISSIONS } from "@/lib/roles";

export function getRedirectPath(role: UserRole, onboardingComplete?: boolean): string {
  if (role === "client" && !onboardingComplete) return "/onboarding";
  return ROLE_REDIRECTS[role];
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
