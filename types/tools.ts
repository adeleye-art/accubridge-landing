// ─── AI Ideas ─────────────────────────────────────────────────────────────────
export interface AIIdeaInput {
  skills: string;
  experience: string;
  location: string;
  capital: string;
  industry_preference?: string;
}

export interface AIBusinessIdea {
  id: string;
  title: string;
  tagline: string;
  description: string;
  business_model: "B2B" | "B2C" | "B2B2C" | "Marketplace" | "SaaS" | "Service" | "Product" | "Franchise";
  startup_cost_estimate: string;
  revenue_potential: "Low" | "Medium" | "High" | "Very High";
  time_to_first_revenue: string;
  skills_match: number;
  market_demand: "Low" | "Medium" | "High" | "Very High";
  key_steps: string[];
  risks: string[];
  saved?: boolean;
  generated_at: string;
}

export interface SavedIdeasSession {
  id: string;
  input: AIIdeaInput;
  ideas: AIBusinessIdea[];
  generated_at: string;
}

// ─── Business Registration ─────────────────────────────────────────────────────
export type RegistrationCountry = "uk" | "nigeria";
export type RegistrationStatus =
  | "draft"
  | "in_progress"
  | "pending_review"
  | "approved"
  | "completed"
  | "rejected";

export type UKBusinessStructure =
  | "private_limited"
  | "llp"
  | "sole_trader"
  | "partnership"
  | "community_interest";

export type NigeriaBusinessType =
  | "business_name"
  | "limited_liability"
  | "incorporated_trustee"
  | "unlimited_company";

export interface UKRegistrationData {
  business_structure: UKBusinessStructure | "";
  proposed_company_name: string;
  alternative_name: string;
  registered_address: string;
  city: string;
  postcode: string;
  sic_code: string;
  director_full_name: string;
  director_dob: string;
  director_nationality: string;
  director_address: string;
  share_capital: string;
  number_of_shares: string;
  agree_model_articles: boolean;
  confirmation_statement: boolean;
}

export interface NigeriaRegistrationData {
  business_type: NigeriaBusinessType | "";
  proposed_name_1: string;
  proposed_name_2: string;
  business_nature: string;
  proprietor_full_name: string;
  proprietor_dob: string;
  proprietor_address: string;
  proprietor_phone: string;
  proprietor_email: string;
  registered_address: string;
  state: string;
  memorandum_uploaded: boolean;
  id_uploaded: boolean;
  payment_confirmed: boolean;
}

export interface BusinessRegistration {
  id: string;
  country: RegistrationCountry;
  business_name: string;
  structure: string;
  status: RegistrationStatus;
  initiated_at: string;
  last_updated: string;
  reference?: string;
  estimated_completion?: string;
  current_step: number;
  total_steps: number;
  notes?: string;
  uk_data?: Partial<UKRegistrationData>;
  nigeria_data?: Partial<NigeriaRegistrationData>;
}
