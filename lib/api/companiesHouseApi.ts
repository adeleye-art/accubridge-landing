import { baseApi } from "./baseApi";

// ─── Response types ────────────────────────────────────────────────────────────

export interface CompanySearchItem {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  dateOfCreation: string;
  address: string;
}

export interface CompanySearchResponse {
  totalResults: number;
  itemsPerPage: number;
  items: CompanySearchItem[];
}

export interface CompanyOfficer {
  name: string;
  role: string;
}

export interface CompanyOfficersResponse {
  officers: CompanyOfficer[];
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const companiesHouseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Search UK companies by name or number
    searchCompanies: builder.query<CompanySearchResponse, string>({
      query: (query) => `/companieshouse/search?query=${encodeURIComponent(query)}`,
      transformResponse: (res: { success: boolean; data: CompanySearchResponse } | CompanySearchResponse) =>
        "data" in res && res.data ? res.data : (res as CompanySearchResponse),
      providesTags: ["CompaniesHouse"],
    }),

    // Get full company profile by company number
    getCompanyProfile: builder.query<CompanySearchItem, string>({
      query: (companyNumber) => `/companieshouse/${encodeURIComponent(companyNumber)}`,
      transformResponse: (res: { success: boolean; data: CompanySearchItem } | CompanySearchItem) =>
        "data" in res && res.data ? res.data : (res as CompanySearchItem),
      providesTags: ["CompaniesHouse"],
    }),

    // Get company officers (used to pre-fill directors list)
    getCompanyOfficers: builder.query<CompanyOfficersResponse, string>({
      query: (companyNumber) => `/companieshouse/${encodeURIComponent(companyNumber)}/officers`,
      transformResponse: (res: { success: boolean; data: CompanyOfficersResponse } | CompanyOfficersResponse) =>
        "data" in res && res.data ? res.data : (res as CompanyOfficersResponse),
      providesTags: ["CompaniesHouse"],
    }),
  }),
});

export const {
  useLazySearchCompaniesQuery,
  useLazyGetCompanyProfileQuery,
  useLazyGetCompanyOfficersQuery,
} = companiesHouseApi;
