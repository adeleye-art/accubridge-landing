import { baseApi } from "./baseApi";

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ReconciliationSummary {
  inProgressCount: number;
  pendingCount: number;
  totalCount: number;
}

export interface ReconciliationListItem {
  id: number;
  period: string;
  bankName: string;
  fileName: string;
  status: string;
  statusValue: number;
  matchedCount?: number;
  unmatchedCount?: number;
  totalLines: number;
  linesSummary?: string;
  progressPercentage?: number;
  uploadedAt: string;
  uploadedAtFormatted?: string;
  totalAmount?: number;
  formattedTotalAmount?: string;
  hasUnmatchedLines?: boolean;
}

export interface ReconciliationsListResponse {
  sessions: ReconciliationListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: ReconciliationSummary;
}

export interface ApiReconciliationLine {
  id: number;
  dateFormatted: string;
  description: string;
  amount: number;
  isIncome?: boolean;
  matchStatus: "Unmatched" | "Matched" | "Flagged";
  matchedTransactionId?: number | null;
  matchConfidence?: number | null;
}

export interface ReconciliationDetail {
  id: number;
  period: string;
  bankName: string;
  fileName: string;
  status: string | number;
  statusValue?: number;
  statusLabel?: string;
  matchedCount?: number;
  unmatchedCount?: number;
  flaggedCount?: number;
  totalLines: number;
  progressPercentage?: number;
  progressLabel: string;
  autoMatchCount?: number;
  canFinalise?: boolean;  // From API
  lines: ApiReconciliationLine[];
  totalCount?: number;
  filteredLineCount?: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  uploadedAtFormatted?: string;
}

export interface MatchCandidate {
  transactionId: number;
  type: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  referenceNo: string;
  confidenceScore: number;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const reconciliationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReconciliations: builder.query<
      ReconciliationsListResponse,
      { page?: number; pageSize?: number } | void
    >({
      query: (params) => ({
        url: "/reconciliation",
        params: { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 },
      }),
      transformResponse: (res: { success?: boolean; data?: ReconciliationsListResponse } | ReconciliationsListResponse) =>
        ("data" in res && res.data != null) ? res.data : (res as ReconciliationsListResponse),
      providesTags: ["Reconciliation"],
    }),

    getReconciliationSummary: builder.query<ReconciliationSummary, void>({
      query: () => "/reconciliation/summary",
      transformResponse: (res: { success: boolean; data: ReconciliationSummary }) => res.data,
      providesTags: ["Reconciliation"],
    }),

    getReconciliationDetail: builder.query<
      ReconciliationDetail,
      { id: number; status?: number; page?: number; pageSize?: number }
    >({
      query: ({ id, status, page = 1, pageSize = 200 }) => ({
        url: `/reconciliation/${id}`,
        params: {
          ...(status != null && { Status: status }),
          Page: page,
          PageSize: pageSize,
        },
      }),
      transformResponse: (res: { success: boolean; data: ReconciliationDetail } | ReconciliationDetail) =>
        "data" in res && res.data != null
          ? (res as { success: boolean; data: ReconciliationDetail }).data
          : (res as ReconciliationDetail),
      providesTags: (_result, _error, { id }) => [{ type: "Reconciliation" as const, id }],
    }),

    createReconciliation: builder.mutation<ReconciliationDetail, FormData>({
      query: (formData) => ({
        url: "/reconciliation",
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: { success: boolean; data: ReconciliationDetail } | ReconciliationDetail) =>
        "data" in res && res.data ? (res as { success: boolean; data: ReconciliationDetail }).data : res as ReconciliationDetail,
      invalidatesTags: ["Reconciliation"],
    }),

    autoMatch: builder.mutation<{ MatchedCount: number; Message: string }, number>({
      query: (id) => ({
        url: `/reconciliation/${id}/auto-match`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Reconciliation" as const, id }],
    }),

    finaliseReconciliation: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/reconciliation/${id}/finalise`,
        method: "POST",
      }),
      transformResponse: (res: { message: string }) => ({
        success: true,
        message: res.message,
      }),
      invalidatesTags: ["Reconciliation"],
    }),

    getCandidates: builder.query<MatchCandidate[], { id: number; lineId: number }>({
      query: ({ id, lineId }) => `/reconciliation/${id}/lines/${lineId}/candidates`,
      transformResponse: (res: { success: boolean; data: MatchCandidate[] }) => res.data,
    }),

    matchLine: builder.mutation<
      ReconciliationDetail,
      { id: number; lineId: number; transactionId: number }
    >({
      query: ({ id, lineId, transactionId }) => ({
        url: `/reconciliation/${id}/lines/${lineId}/match`,
        method: "POST",
        body: { transactionId },
      }),
      transformResponse: (res: { success: boolean; data: ReconciliationDetail }) => res.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Reconciliation" as const, id }],
    }),

    flagLine: builder.mutation<
      { success: boolean; message: string },
      { id: number; lineId: number }
    >({
      query: ({ id, lineId }) => ({
        url: `/reconciliation/${id}/lines/${lineId}/flag`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Reconciliation" as const, id }],
    }),

    addNewTransaction: builder.mutation<
      ReconciliationDetail,
      { id: number; lineId: number; category: string; description?: string; referenceNo?: string }
    >({
      query: ({ id, lineId, category, description, referenceNo }) => ({
        url: `/reconciliation/${id}/lines/${lineId}/add-new`,
        method: "POST",
        body: { category, description, referenceNo },
      }),
      transformResponse: (res: { success: boolean; data: ReconciliationDetail }) => res.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "Reconciliation" as const, id }],
    }),
  }),
});

export const {
  useGetReconciliationsQuery,
  useGetReconciliationSummaryQuery,
  useGetReconciliationDetailQuery,
  useCreateReconciliationMutation,
  useAutoMatchMutation,
  useFinaliseReconciliationMutation,
  useGetCandidatesQuery,
  useMatchLineMutation,
  useFlagLineMutation,
  useAddNewTransactionMutation,
} = reconciliationApi;
