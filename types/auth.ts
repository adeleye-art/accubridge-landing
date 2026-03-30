export type UserRole = "client" | "staff" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  onboarding_complete?: boolean;
}

export interface SignUpFormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role?: UserRole;
}

export interface SignInFormData {
  email: string;
  password: string;
}
