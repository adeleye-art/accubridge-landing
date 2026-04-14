import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiFundingApplication {
  id: number;
  userId: number;
  type: string;           // "Grant" | "Loan" | "Equity" | "Raffle" | "InvestorPitch" | "ComplianceGrant"
  typeValue?: number;
  requestedAmount: number;
  purpose: string;
  businessSector?: string;
  employeeCount?: number;
  annualRevenue?: number;
  fundUsageBreakdown?: string;
  repaymentPlan?: string;
  status: string;         // "Draft" | "Submitted" | "UnderReview" | "Approved" | "Rejected" | "Completed" | "Cancelled"
  createdAt: string;
  submittedAt?: string | null;
  approvedAmount?: number;
  rejectionReason?: string;
  notes?: string;
  // Raffle-specific
  raffleTargetAmount?: number | null;
  raffleCurrentAmount?: number | null;
  raffleContributorCount?: number;
  raffleDeadline?: string | null;
  raffleWinnerSelected?: boolean;
}

export interface FundingSummary {
  totalApplications: number;
  draftCount: number;
  submittedCount: number;
  underReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRequested: number;
  totalApproved: number;
}

export interface FundingListResponse {
  applications: ApiFundingApplication[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FundingListParams {
  type?: number;
  status?: number;
  userId?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateFundingInput {
  type: number;              // 0=Grant, 1=Loan, 2=Equity, 3=Raffle, 4=InvestorPitch, 5=ComplianceGrant
  requestedAmount: number;
  purpose: string;
  businessSector?: string;
  employeeCount?: number;
  annualRevenue?: number;
  fundUsageBreakdown?: string;
  repaymentPlan?: string;
  raffleTargetAmount?: number;
  raffleDeadline?: string;
}

export interface ReviewFundingInput {
  approve: boolean;
  approvedAmount?: number;
  notes?: string;
  rejectionReason?: string;
}

export interface ContributeInput {
  amount: number;
}

export interface SelectWinnerInput {
  winnerId: number;
}

export interface RaffleProgressResponse {
  raffleId: number;
  targetAmount: number;
  currentAmount: number;
  contributorCount: number;
  progressPercentage: number;
  deadline: string;
  winnerSelected: boolean;
  winnerId: number | null;
}

export interface SubmitFundingResponse {
  id: number;
  status: string;
  submittedAt: string;
}

export interface ReviewFundingResponse {
  id: number;
  status: string;
  approvedAmount?: number;
  approvalNotes?: string;
  reviewedAt?: string;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const fundingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFundingApplications: builder.query<FundingListResponse, FundingListParams>({
      query: (params) => ({ url: "/funding", params }),
      transformResponse: (res: { success: boolean; data: FundingListResponse } | FundingListResponse) =>
        "data" in res && res.data ? res.data : (res as FundingListResponse),
      providesTags: ["Funding"],
    }),

    getFundingSummary: builder.query<FundingSummary, void>({
      query: () => "/funding/summary",
      transformResponse: (res: { success: boolean; data: FundingSummary } | FundingSummary) =>
        "data" in res && res.data ? res.data : (res as FundingSummary),
      providesTags: ["Funding"],
    }),

    getFundingApplication: builder.query<ApiFundingApplication, number>({
      query: (id) => `/funding/${id}`,
      transformResponse: (res: { success: boolean; data: ApiFundingApplication } | ApiFundingApplication) =>
        "data" in res && res.data ? res.data : (res as ApiFundingApplication),
      providesTags: ["Funding"],
    }),

    createFundingApplication: builder.mutation<ApiFundingApplication, CreateFundingInput>({
      query: (body) => ({ url: "/funding", method: "POST", body }),
      transformResponse: (res: { success: boolean; data: ApiFundingApplication } | ApiFundingApplication) =>
        "data" in res && res.data ? res.data : (res as ApiFundingApplication),
      invalidatesTags: ["Funding"],
    }),

    updateFundingApplication: builder.mutation<ApiFundingApplication, { id: number; body: Partial<CreateFundingInput> }>({
      query: ({ id, body }) => ({ url: `/funding/${id}`, method: "PUT", body }),
      invalidatesTags: ["Funding"],
    }),

    submitFundingApplication: builder.mutation<SubmitFundingResponse, number>({
      query: (id) => ({ url: `/funding/${id}/submit`, method: "POST", body: {} }),
      transformResponse: (res: { success: boolean; data: SubmitFundingResponse } | SubmitFundingResponse) =>
        "data" in res && res.data ? res.data : (res as SubmitFundingResponse),
      invalidatesTags: ["Funding"],
    }),

    reviewFundingApplication: builder.mutation<ReviewFundingResponse, { id: number; body: ReviewFundingInput }>({
      query: ({ id, body }) => ({ url: `/funding/${id}/review`, method: "POST", body }),
      transformResponse: (res: { success: boolean; data: ReviewFundingResponse } | ReviewFundingResponse) =>
        "data" in res && res.data ? res.data : (res as ReviewFundingResponse),
      invalidatesTags: ["Funding"],
    }),

    contributeToRaffle: builder.mutation<{ message: string; currentAmount: number; contributorCount: number; progressPercentage: number }, { id: number; body: ContributeInput }>({
      query: ({ id, body }) => ({ url: `/funding/${id}/contribute`, method: "POST", body }),
      invalidatesTags: ["Funding"],
    }),

    selectRaffleWinner: builder.mutation<ApiFundingApplication, { id: number; body: SelectWinnerInput }>({
      query: ({ id, body }) => ({ url: `/funding/${id}/select-winner`, method: "POST", body }),
      invalidatesTags: ["Funding"],
    }),

    getRaffleProgress: builder.query<RaffleProgressResponse, number>({
      query: (id) => `/funding/${id}/progress`,
      transformResponse: (res: { success: boolean; data: RaffleProgressResponse } | RaffleProgressResponse) =>
        "data" in res && res.data ? res.data : (res as RaffleProgressResponse),
      providesTags: ["Funding"],
    }),
  }),
});

export const {
  useGetFundingApplicationsQuery,
  useGetFundingSummaryQuery,
  useGetFundingApplicationQuery,
  useCreateFundingApplicationMutation,
  useUpdateFundingApplicationMutation,
  useSubmitFundingApplicationMutation,
  useReviewFundingApplicationMutation,
  useContributeToRaffleMutation,
  useSelectRaffleWinnerMutation,
  useGetRaffleProgressQuery,
} = fundingApi;
