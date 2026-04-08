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
  name: string;
  lastname: string;
  email: string;
  organisationName: string;
  phoneNo: string;
  country: "UK" | "Nigeria";
  password: string;
  confirmPassword: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}
