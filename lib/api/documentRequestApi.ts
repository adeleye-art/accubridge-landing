import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiDocumentRequest {
  id: number;
  clientId: number;
  clientName: string;
  documentType: string;
  status: string;       // "Pending" | "Submitted" | "Overdue" | "Approved" | "Rejected"
  requestedAt: string;
  requestedAtFormatted: string;
  dueDate: string;
  dueDateFormatted: string;
  isOverdue: boolean;
  requestedByName: string;
  message: string | null;
}

export interface DocumentRequestListResponse {
  requests: ApiDocumentRequest[];
  totalCount: number;
  page: number;
  pageSize: number;
  pendingCount: number;
  submittedCount: number;
  overdueCount: number;
}

export interface DocumentRequestListParams {
  status?: number;    // 0=Pending, 1=Submitted, 2=Overdue, 3=Approved, 4=Rejected
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateDocumentRequestInput {
  clientId: number;
  documentType: number; // 0=CertificateOfIncorporation, 1=BankStatement, 2=VatCertificate, 3=ProofOfAddress, 4=TaxReturn, 5=FinancialStatements, 6=Other
  dueDate: string;      // ISO date string
  message?: string | null;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const documentRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentRequests: builder.query<DocumentRequestListResponse, DocumentRequestListParams>({
      query: (params) => ({ url: "/documentrequest", params }),
      transformResponse: (res: { success: boolean; data: DocumentRequestListResponse } | DocumentRequestListResponse) =>
        "data" in res && res.data ? res.data : (res as DocumentRequestListResponse),
      providesTags: ["DocumentRequest"],
    }),

    createDocumentRequest: builder.mutation<ApiDocumentRequest, CreateDocumentRequestInput>({
      query: (body) => ({ url: "/documentrequest", method: "POST", body }),
      invalidatesTags: ["DocumentRequest"],
    }),
  }),
});

export const {
  useGetDocumentRequestsQuery,
  useCreateDocumentRequestMutation,
} = documentRequestApi;
