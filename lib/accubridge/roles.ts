import { UserRole } from "@/types/accubridge/auth";

export const ROLES = {
  CLIENT: "client" as UserRole,
  STAFF:  "staff"  as UserRole,
  ADMIN:  "admin"  as UserRole,
};

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  client: "/accubridge/client/dashboard",
  staff:  "/accubridge/staff/dashboard",
  admin:  "/accubridge/admin/dashboard",
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
    "edit_client_profile",
    "add_transaction",
    "edit_transaction",
    "review_client_transactions",
    "generate_client_reports",
    "view_compliance_score",
    "add_compliance_notes",
    "request_missing_documents",
    "add_internal_notes",
    "view_internal_notes",
  ],
  admin: [
    "view_all_clients",
    "view_all_staff",
    "edit_client_profile",
    "assign_staff",
    "suspend_client",
    "delete_client",
    "approve_documents",
    "approve_funding",
    "reject_funding",
    "view_activity_logs",
    "delete_transaction",
    "override_compliance_score",
    "update_compliance_status",
    "view_all_notes",
    "manage_staff",
    "manage_plans",
    "platform_settings",
    "review_funding_applications",
    "generate_all_reports",
  ],
};
