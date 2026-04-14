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

// ─── Onboarding sub-route types ───────────────────────────────────────────────

export interface ClientBusinessDetailsInput {
  tradingName?: string;
  registrationNumber?: string;
  taxId?: string;
  vatNumber?: string;
  dateOfIncorporation?: string;
  structure?: number;   // 0=SoleTrader,1=LimitedCompany,2=LLP,3=Partnership,4=Charity,5=Other
  industrySector?: string;
  sicCode?: string;
}

export interface ClientAddressInput {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postalCode?: string;
  country?: string;
  operatingCountry?: string;
}

export interface ClientTaxSetupInput {
  corporationTaxUtr?: string;
  payeReference?: string;
  payeAccountsOfficeReference?: string;
  financialYearEnd?: string;
  accountingBasis?: number;         // 0=Cash, 1=Accrual
  vatReturnFrequency?: number;
  lastVatReturnDate?: string;
  nextVatReturnDue?: string;
  vatRegistrationDate?: string;
  vatDeregistrationDate?: string;
}

export interface ClientFinancialInput {
  bankName?: string;
  bankAccountNo?: string;
  bankSortCode?: string;
  currency?: string;
  annualRevenue?: number;
  employeeCount?: number;
  companySize?: number;
}

export interface ClientContactPersonInput {
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  contactPersonRole?: string;
}

export interface ClientMetadataInput {
  notes?: string;
  tags?: string;
  logoUrl?: string;
  source?: number;
  referralSource?: string;
}

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

    // ── Onboarding sub-routes ──────────────────────────────────────────────────
    updateClientBusinessDetails: builder.mutation<void, { id: number; body: ClientBusinessDetailsInput }>({
      query: ({ id, body }) => ({ url: `/client/${id}/business-details`, method: "PUT", body }),
      invalidatesTags: ["Client"],
    }),

    updateClientAddress: builder.mutation<void, { id: number; body: ClientAddressInput }>({
      query: ({ id, body }) => ({ url: `/client/${id}/address`, method: "PUT", body }),
      invalidatesTags: ["Client"],
    }),

    updateClientTaxSetup: builder.mutation<void, { id: number; body: ClientTaxSetupInput }>({
      query: ({ id, body }) => ({ url: `/client/${id}/tax-setup`, method: "PUT", body }),
      invalidatesTags: ["Client"],
    }),

    updateClientFinancial: builder.mutation<void, { id: number; body: ClientFinancialInput }>({
      query: ({ id, body }) => ({ url: `/client/${id}/financial`, method: "PUT", body }),
      invalidatesTags: ["Client"],
    }),

    updateClientContactPerson: builder.mutation<void, { id: number; body: ClientContactPersonInput }>({
      query: ({ id, body }) => ({ url: `/client/${id}/contact-person`, method: "PUT", body }),
      invalidatesTags: ["Client"],
    }),

    updateClientMetadata: builder.mutation<void, { id: number; body: ClientMetadataInput }>({
      query: ({ id, body }) => ({ url: `/client/${id}/metadata`, method: "PUT", body }),
      invalidatesTags: ["Client"],
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
  useUpdateClientBusinessDetailsMutation,
  useUpdateClientAddressMutation,
  useUpdateClientTaxSetupMutation,
  useUpdateClientFinancialMutation,
  useUpdateClientContactPersonMutation,
  useUpdateClientMetadataMutation,
} = clientApi;
