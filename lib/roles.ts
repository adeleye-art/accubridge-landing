import { UserRole } from "@/types/auth";

export const ROLES = {
  CLIENT: "client" as UserRole,
  STAFF:  "staff"  as UserRole,
  ADMIN:  "admin"  as UserRole,
};

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  client: "/client/dashboard",
  staff:  "/staff/dashboard",
  admin:  "/admin/dashboard",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  client: "Business Owner / Client",
  staff:  "Accountant / Staff",
  admin:  "Super Admin",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  client: "Manage your finances, compliance, and funding",
  staff:  "Review and manage assigned client accounts",
  admin:  "Full platform control — clients, staff, and operations",
};

export const ROLE_ICONS: Record<UserRole, string> = {
  client: "🏢",
  staff:  "📋",
  admin:  "⚙️",
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  client: [
    "view_own_dashboard",
    "manage_own_transactions",
    "view_own_reports",
    "download_compliance_passport",
    "apply_for_funding",
    "manage_own_business_profile",
  ],
  staff: [
    "view_assigned_clients",
    "review_client_transactions",
    "generate_client_reports",
    "update_client_compliance",
    "add_internal_notes",
    "request_missing_documents",
  ],
  admin: [
    "view_all_clients",
    "assign_accountants",
    "review_all_documents",
    "update_compliance_status",
    "review_funding_applications",
    "manage_staff",
    "manage_plans",
    "platform_settings",
  ],
};
