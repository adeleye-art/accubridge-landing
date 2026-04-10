import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiComplianceCase {
  id: number;
  clientId: number;
  businessName: string;
  clientScore: number;
  reason: string;       // "HighRisk" | "PendingReview" | "DocumentMismatch" | "OverdueTaxIssues" | "FundingRelatedReview" | "StaleFinancialData"
  urgency: string;      // "Low" | "Medium" | "High"
  status: string;       // "Pending" | "UnderReview" | "Resolved" | "Escalated"
  assignedReviewerName: string | null;
  openedAt: string;
  openedAtFormatted: string;
  notes: string | null;
}

export interface ComplianceCaseListResponse {
  cases: ApiComplianceCase[];
  totalCount: number;
  page: number;
  pageSize: number;
  allCount: number;
  highRiskCount: number;
  pendingReviewCount: number;
  documentMismatchCount: number;
  overdueTaxIssuesCount: number;
  fundingRelatedReviewCount: number;
  staleFinancialDataCount: number;
}

export interface ComplianceCaseListParams {
  reason?: number;    // 0=HighRisk, 1=PendingReview, 2=DocumentMismatch, 3=OverdueTaxIssues, 4=FundingRelatedReview, 5=StaleFinancialData
  urgency?: number;   // 0=Low, 1=Medium, 2=High
  status?: number;    // 0=Pending, 1=UnderReview, 2=Resolved, 3=Escalated
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UpdateComplianceCaseInput {
  status: number;     // 0=Pending, 1=UnderReview, 2=Resolved, 3=Escalated
  urgency: number;    // 0=Low, 1=Medium, 2=High
  notes?: string | null;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const complianceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplianceCases: builder.query<ComplianceCaseListResponse, ComplianceCaseListParams>({
      query: (params) => ({ url: "/compliance", params }),
      transformResponse: (res: { success: boolean; data: ComplianceCaseListResponse } | ComplianceCaseListResponse) =>
        "data" in res && res.data ? res.data : (res as ComplianceCaseListResponse),
      providesTags: ["Compliance"],
    }),

    getComplianceCaseDetail: builder.query<ApiComplianceCase, number>({
      query: (id) => `/compliance/${id}`,
      transformResponse: (res: { success: boolean; data: ApiComplianceCase } | ApiComplianceCase) =>
        "data" in res && res.data ? res.data : (res as ApiComplianceCase),
      providesTags: ["Compliance"],
    }),

    updateComplianceCase: builder.mutation<ApiComplianceCase, { id: number; body: UpdateComplianceCaseInput }>({
      query: ({ id, body }) => ({ url: `/compliance/${id}`, method: "PUT", body }),
      invalidatesTags: ["Compliance", "Dashboard"],
    }),
  }),
});

export const {
  useGetComplianceCasesQuery,
  useGetComplianceCaseDetailQuery,
  useUpdateComplianceCaseMutation,
} = complianceApi;
