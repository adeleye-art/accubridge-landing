import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiClient {
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

export interface ApiClientSummary {
  totalCount: number;
  activeCount: number;
  pendingCount: number;
  suspendedCount: number;
}

export interface ClientListResponse {
  summary: ApiClientSummary;
  clients: ApiClient[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ClientListParams {
  search?: string;
  status?: number;   // 0=Pending, 1=Active, 2=Suspended
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateClientInput {
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  status: number;
  score: number;
  assignedStaffId?: number | null;
}

export type UpdateClientInput = CreateClientInput;

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<ClientListResponse, ClientListParams>({
      query: (params) => ({ url: "/client", params }),
      transformResponse: (res: { success: boolean; data: ClientListResponse } | ClientListResponse) =>
        "data" in res && res.data ? res.data : (res as ClientListResponse),
      providesTags: ["Client"],
    }),

    getClientSummary: builder.query<ApiClientSummary, void>({
      query: () => "/client/summary",
      transformResponse: (res: { success: boolean; data: ApiClientSummary } | ApiClientSummary) =>
        "data" in res && res.data ? res.data : (res as ApiClientSummary),
      providesTags: ["Client"],
    }),

    createClient: builder.mutation<ApiClient, CreateClientInput>({
      query: (body) => ({ url: "/client", method: "POST", body }),
      invalidatesTags: ["Client"],
    }),

    updateClient: builder.mutation<ApiClient, { id: number; body: UpdateClientInput }>({
      query: ({ id, body }) => ({ url: `/client/${id}`, method: "PUT", body }),
      invalidatesTags: ["Client"],
    }),

    deleteClient: builder.mutation<void, number>({
      query: (id) => ({ url: `/client/${id}`, method: "DELETE" }),
      invalidatesTags: ["Client"],
    }),

    assignStaff: builder.mutation<ApiClient, { clientId: number; staffId: number }>({
      query: ({ clientId, staffId }) => ({
        url: `/client/${clientId}/assign-staff`,
        method: "PUT",
        body: JSON.stringify(staffId),   // raw number — must be pre-serialised; RTK Query only auto-stringifies objects
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Client"],
    }),

    unassignStaff: builder.mutation<ApiClient, number>({
      query: (clientId) => ({ url: `/client/${clientId}/assign-staff`, method: "DELETE" }),
      invalidatesTags: ["Client"],
    }),

    toggleClientStatus: builder.mutation<ApiClient, number>({
      query: (id) => ({ url: `/client/${id}/toggle-status`, method: "PUT" }),
      invalidatesTags: ["Client", "Dashboard"],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientSummaryQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useAssignStaffMutation,
  useUnassignStaffMutation,
  useToggleClientStatusMutation,
} = clientApi;
