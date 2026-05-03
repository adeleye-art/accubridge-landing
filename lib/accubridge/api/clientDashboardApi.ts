import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClientDashboardFinancialStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export interface ClientDashboardBusinessRegistration {
  kycStatus: string;
  kybStatus: string;
  currentStep: number;
  totalSteps: number;
}

export interface ClientDashboardFundingApplication {
  id: number;
  amount: number;
  status: string;
  submittedAt: string;
}

export interface ClientDashboardTransaction {
  id: number;
  type: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface ClientDashboardComplianceScore {
  score: number;
  taxFilingStatus: string;
  bookkeepingStatus: string;
  regulatoryObligations: string;
}

export interface ClientDashboard {
  welcomeMessage: string;
  financialStats: ClientDashboardFinancialStats;
  complianceScore: ClientDashboardComplianceScore;
  businessRegistration: ClientDashboardBusinessRegistration;
  fundingApplications: ClientDashboardFundingApplication[];
  recentTransactions: ClientDashboardTransaction[];
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const clientDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientDashboard: builder.query<ClientDashboard, void>({
      query: () => "/clientdashboard",
      transformResponse: (res: { success: boolean; data: ClientDashboard } | ClientDashboard) =>
        "data" in res && res.data ? res.data : (res as ClientDashboard),
      providesTags: ["ClientDashboard"],
    }),
  }),
});

export const { useGetClientDashboardQuery } = clientDashboardApi;
