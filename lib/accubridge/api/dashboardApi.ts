import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalClients: number;
  clientsGrowthThisMonth: number;
  activeOnboardings: number;
  onboardingsCreated: number;
  complianceAlerts: number;
  complianceAlertsCritical: number;
  fundingApplications: number;
  fundingApplicationsThisWeek: number;
}

export interface AdminDashboardQuickAction {
  label: string;
  icon: string;
  route: string;
}

export interface AdminDashboardClient {
  id: number;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  statusValue: number;
  score: number;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  joinedDate: string;
  joinedDateFormatted: string;
  isActive: boolean;
}

export interface AdminDashboardFundingItem {
  businessName: string;
  amount: number;
  amountFormatted: string;
  date: string;
  status: string;
}

export interface AdminDashboardOverview {
  stats: AdminDashboardStats;
  quickActions: AdminDashboardQuickAction[];
  recentClients: AdminDashboardClient[];
  fundingQueue: AdminDashboardFundingItem[];
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<AdminDashboardOverview, void>({
      query: () => "/dashboard/overview",
      transformResponse: (res: { success: boolean; data: AdminDashboardOverview } | AdminDashboardOverview) =>
        "data" in res && res.data ? res.data : (res as AdminDashboardOverview),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardOverviewQuery } = dashboardApi;
