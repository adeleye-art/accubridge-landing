import { UserRole } from "@/types/auth";
import { ROLE_REDIRECTS, ROLE_PERMISSIONS } from "@/lib/roles";

export function getRedirectPath(role: UserRole, onboardingComplete?: boolean): string {
  if (role === "client" && !onboardingComplete) return "/onboarding";
  return ROLE_REDIRECTS[role];
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Decodes the stored JWT and returns the authenticated user's numeric ID.
 * Tries common claim names: nameid, userId, sub.
 * Returns null if the token is absent or cannot be decoded.
 */
export function getAuthUserId(): number | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    const id =
      payload.nameid ??
      payload.userId ??
      payload.sub ??
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    return id != null ? Number(id) : null;
  } catch {
    return null;
  }
}
