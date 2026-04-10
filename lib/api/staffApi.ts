import { baseApi } from "./baseApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiStaffMember {
  id: number;
  name: string;
  lastname: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  phoneNumber: string | null;
  country: string | null;
  assignedClientsCount: number;
}

export interface StaffListResponse {
  staff: ApiStaffMember[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface StaffListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateStaffInput {
  name: string;
  lastname: string;
  email: string;
  password: string;
  phoneNo?: string;
  country?: string;
}

export interface UpdateStaffInput {
  name: string;
  lastname: string;
  phoneNo?: string;
  country?: string;
}

// ─── RTK Query Endpoints ──────────────────────────────────────────────────────

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query<StaffListResponse, StaffListParams>({
      query: (params) => ({ url: "/staff", params }),
      transformResponse: (res: unknown): StaffListResponse => {
        // API may return a raw array, a paginated wrapper, or a success-wrapped object
        if (Array.isArray(res)) {
          const staff = res as ApiStaffMember[];
          return { staff, totalCount: staff.length, page: 1, pageSize: staff.length };
        }
        const typed = res as { success?: boolean; data?: StaffListResponse | ApiStaffMember[] } & StaffListResponse;
        if (typed.data) {
          if (Array.isArray(typed.data)) {
            const staff = typed.data as ApiStaffMember[];
            return { staff, totalCount: staff.length, page: 1, pageSize: staff.length };
          }
          return typed.data as StaffListResponse;
        }
        return typed as StaffListResponse;
      },
      providesTags: ["Staff"],
    }),

    createStaff: builder.mutation<ApiStaffMember, CreateStaffInput>({
      query: (body) => ({ url: "/staff", method: "POST", body }),
      invalidatesTags: ["Staff"],
    }),

    updateStaff: builder.mutation<ApiStaffMember, { id: number; body: UpdateStaffInput }>({
      query: ({ id, body }) => ({ url: `/staff/${id}`, method: "PUT", body }),
      invalidatesTags: ["Staff"],
    }),

    toggleStaffStatus: builder.mutation<ApiStaffMember, number>({
      query: (id) => ({ url: `/staff/${id}/toggle-status`, method: "PUT" }),
      invalidatesTags: ["Staff"],
    }),

    deleteStaff: builder.mutation<void, number>({
      query: (id) => ({ url: `/staff/${id}`, method: "DELETE" }),
      invalidatesTags: ["Staff", "Client"],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useToggleStaffStatusMutation,
  useDeleteStaffMutation,
} = staffApi;
