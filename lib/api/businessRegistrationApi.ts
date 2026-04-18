import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiBusinessRegistration {
  id: number;
  jurisdiction: number;          // 1=UK, 2=NG
  status: string;                // "Draft" | "Submitted" | "UnderReview" | "Completed" | "Rejected" | "Cancelled"
  currentStep: number;
  businessName?: string;
  structure?: string;
  createdAt: string;
  updatedAt: string;
  referenceNumber?: string;
  notes?: string;
  estimatedCompletion?: string;
}

export interface RegistrationSummary {
  total: number;
  draftCount: number;
  submittedCount: number;
  underReviewCount: number;
  completedCount: number;
  rejectedCount: number;
}

export interface RegistrationListResponse {
  registrations: ApiBusinessRegistration[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RegistrationListParams {
  jurisdiction?: number;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface CreateRegistrationInput {
  jurisdiction: number;  // 1=UK, 2=NG
}

export interface UpdateUKRegistrationInput {
  step: number;
  structure?: string;
  businessName?: string;
  alternativeName?: string;
  registeredAddress?: string;
  city?: string;
  postcode?: string;
  sicCode?: string;
  directorFullName?: string;
  directorNationality?: string;
  directorDateOfBirth?: string;
  shareCapital?: number;
  numberOfShares?: number;
  modelArticles?: boolean;
  confirmationStatement?: boolean;
}

export interface UpdateNGRegistrationInput {
  step: number;
  businessType?: string;
  proposedName1?: string;
  proposedName2?: string;
  natureOfBusiness?: string;
  proprietorFullName?: string;
  proprietorDateOfBirth?: string;
  proprietorPhone?: string;
  proprietorEmail?: string;
  residentialAddress?: string;
  state?: string;
  businessAddress?: string;
  validIdType?: string;
  validIdUrl?: string;
  memorandumUrl?: string;
  paymentConfirmed?: boolean;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const businessRegistrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBusinessRegistrations: builder.query<RegistrationListResponse, RegistrationListParams>({
      query: (params) => ({ url: "/businessregistration", params }),
      transformResponse: (res: { success: boolean; data: RegistrationListResponse } | RegistrationListResponse) =>
        "data" in res && res.data ? res.data : (res as RegistrationListResponse),
      providesTags: ["BusinessRegistration"],
    }),

    getRegistrationSummary: builder.query<RegistrationSummary, void>({
      query: () => "/businessregistration/summary",
      transformResponse: (res: { success: boolean; data: RegistrationSummary } | RegistrationSummary) =>
        "data" in res && res.data ? res.data : (res as RegistrationSummary),
      providesTags: ["BusinessRegistration"],
    }),

    getBusinessRegistration: builder.query<ApiBusinessRegistration, number>({
      query: (id) => `/businessregistration/${id}`,
      transformResponse: (res: { success: boolean; data: ApiBusinessRegistration } | ApiBusinessRegistration) =>
        "data" in res && res.data ? res.data : (res as ApiBusinessRegistration),
      providesTags: ["BusinessRegistration"],
    }),

    createBusinessRegistration: builder.mutation<ApiBusinessRegistration, CreateRegistrationInput>({
      query: (body) => ({ url: "/businessregistration", method: "POST", body }),
      transformResponse: (res: { success: boolean; data: ApiBusinessRegistration } | ApiBusinessRegistration) =>
        "data" in res && res.data ? res.data : (res as ApiBusinessRegistration),
      invalidatesTags: ["BusinessRegistration"],
    }),

    updateUKRegistration: builder.mutation<ApiBusinessRegistration, { id: number; body: UpdateUKRegistrationInput }>({
      query: ({ id, body }) => ({ url: `/businessregistration/${id}/uk`, method: "PUT", body }),
      transformResponse: (res: { success: boolean; data: ApiBusinessRegistration } | ApiBusinessRegistration) =>
        "data" in res && res.data ? res.data : (res as ApiBusinessRegistration),
      invalidatesTags: ["BusinessRegistration"],
    }),

    updateNGRegistration: builder.mutation<ApiBusinessRegistration, { id: number; body: UpdateNGRegistrationInput }>({
      query: ({ id, body }) => ({ url: `/businessregistration/${id}/ng`, method: "PUT", body }),
      transformResponse: (res: { success: boolean; data: ApiBusinessRegistration } | ApiBusinessRegistration) =>
        "data" in res && res.data ? res.data : (res as ApiBusinessRegistration),
      invalidatesTags: ["BusinessRegistration"],
    }),

    submitBusinessRegistration: builder.mutation<ApiBusinessRegistration, number>({
      query: (id) => ({ url: `/businessregistration/${id}/submit`, method: "POST", body: {} }),
      transformResponse: (res: { success: boolean; data: ApiBusinessRegistration } | ApiBusinessRegistration) =>
        "data" in res && res.data ? res.data : (res as ApiBusinessRegistration),
      invalidatesTags: ["BusinessRegistration"],
    }),

    saveDraftBusinessRegistration: builder.mutation<ApiBusinessRegistration, number>({
      query: (id) => ({ url: `/businessregistration/${id}/save-draft`, method: "POST", body: {} }),
      transformResponse: (res: { success: boolean; data: ApiBusinessRegistration } | ApiBusinessRegistration) =>
        "data" in res && res.data ? res.data : (res as ApiBusinessRegistration),
      invalidatesTags: ["BusinessRegistration"],
    }),

    deleteBusinessRegistration: builder.mutation<void, number>({
      query: (id) => ({ url: `/businessregistration/${id}`, method: "DELETE" }),
      invalidatesTags: ["BusinessRegistration"],
    }),
  }),
});

export const {
  useGetBusinessRegistrationsQuery,
  useGetRegistrationSummaryQuery,
  useGetBusinessRegistrationQuery,
  useCreateBusinessRegistrationMutation,
  useUpdateUKRegistrationMutation,
  useUpdateNGRegistrationMutation,
  useSubmitBusinessRegistrationMutation,
  useSaveDraftBusinessRegistrationMutation,
  useDeleteBusinessRegistrationMutation,
} = businessRegistrationApi;
