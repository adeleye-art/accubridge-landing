import { baseApi } from './baseApi'
import type {
  VendorProfile,
  VendorStats,
  VendorOrder,
  MenuItem,
  MenuCategory,
  EarningsRecord,
  PayoutInfo,
  OrderStatus,
  VendorStoreSettingsRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from '@/types'

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── STORE & PROFILE ──────────────────────────────────────────────────────
    getMyStore: build.query<VendorProfile, void>({
      query: () => '/vendors/me',
      providesTags: ['Vendor'],
    }),

    updateStoreSettings: build.mutation<VendorProfile, VendorStoreSettingsRequest>({
      query: (body) => {
        const form = new FormData()
        Object.entries(body).forEach(([k, v]) => {
          if (v !== undefined) form.append(k, v instanceof File ? v : String(v))
        })
        return { url: '/vendors/me', method: 'PUT', body: form }
      },
      invalidatesTags: ['Vendor'],
    }),

    toggleStoreOpen: build.mutation<VendorProfile, { is_open: boolean }>({
      query: (body) => ({ url: '/vendors/me/toggle-open', method: 'PATCH', body }),
      async onQueryStarted({ is_open }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          vendorApi.util.updateQueryData('getMyStore', undefined, (draft) => {
            draft.is_open = is_open
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: ['Vendor'],
    }),

    getVendorStats: build.query<VendorStats, void>({
      query: () => '/vendors/me/stats',
      providesTags: ['Stats'],
    }),

    // ── ORDERS ───────────────────────────────────────────────────────────────
    getVendorOrders: build.query<
      PaginatedResponse<VendorOrder>,
      { status?: OrderStatus | 'incoming'; search?: string; from?: string; to?: string; page?: number; per_page?: number }
    >({
      query: (params = {}) => ({ url: '/vendors/me/orders', params }),
      providesTags: ['Order'],
    }),

    getVendorOrderById: build.query<VendorOrder, string>({
      query: (id) => `/vendors/me/orders/${id}`,
      providesTags: ['Order'],
    }),

    acceptOrder: build.mutation<VendorOrder, { id: string; estimated_prep_time: number }>({
      query: ({ id, estimated_prep_time }) => ({
        url: `/vendors/me/orders/${id}/accept`,
        method: 'PATCH',
        body: { estimated_prep_time },
      }),
      invalidatesTags: ['Order', 'Stats'],
    }),

    rejectOrder: build.mutation<VendorOrder, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/vendors/me/orders/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Order', 'Stats'],
    }),

    markOrderReady: build.mutation<VendorOrder, string>({
      query: (id) => ({ url: `/vendors/me/orders/${id}/ready`, method: 'PATCH' }),
      invalidatesTags: ['Order'],
    }),

    // ── MENU / PRODUCTS ──────────────────────────────────────────────────────
    getMenuItems: build.query<MenuItem[], { category?: string; availability?: boolean; search?: string }>({
      query: (params = {}) => ({ url: '/vendors/me/menu', params }),
      providesTags: ['Product'],
    }),

    getMenuCategories: build.query<MenuCategory[], void>({
      query: () => '/vendors/me/menu/categories',
      providesTags: ['Product'],
    }),

    createMenuItem: build.mutation<MenuItem, CreateMenuItemRequest>({
      query: (body) => {
        const form = new FormData()
        Object.entries(body).forEach(([k, v]) => {
          if (v !== undefined) form.append(k, v instanceof File ? v : String(v))
        })
        return { url: '/vendors/me/menu', method: 'POST', body: form }
      },
      invalidatesTags: ['Product'],
    }),

    updateMenuItem: build.mutation<MenuItem, UpdateMenuItemRequest>({
      query: ({ id, ...body }) => {
        const form = new FormData()
        Object.entries(body).forEach(([k, v]) => {
          if (v !== undefined) form.append(k, v instanceof File ? v : String(v))
        })
        return { url: `/vendors/me/menu/${id}`, method: 'PUT', body: form }
      },
      invalidatesTags: ['Product'],
    }),

    toggleMenuItemAvailability: build.mutation<MenuItem, { id: string; availability: boolean }>({
      query: ({ id, availability }) => ({
        url: `/vendors/me/menu/${id}/availability`,
        method: 'PATCH',
        body: { availability },
      }),
      invalidatesTags: ['Product'],
    }),

    deleteMenuItem: build.mutation<void, string>({
      query: (id) => ({ url: `/vendors/me/menu/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),

    // ── EARNINGS ─────────────────────────────────────────────────────────────
    getEarnings: build.query<
      PaginatedResponse<EarningsRecord>,
      { from?: string; to?: string; page?: number; per_page?: number }
    >({
      query: (params = {}) => ({ url: '/vendors/me/earnings', params }),
      providesTags: ['Stats'],
    }),

    getPayoutInfo: build.query<PayoutInfo, void>({
      query: () => '/vendors/me/payout',
      providesTags: ['Stats'],
    }),

    exportEarningsCSV: build.mutation<Blob, { from?: string; to?: string }>({
      queryFn: async (params, _queryApi, _extraOptions, baseQuery) => {
        const result = await baseQuery({
          url: '/vendors/me/earnings/export',
          params,
          responseHandler: (response) => response.blob(),
        })
        if (result.error) return { error: result.error }
        return { data: result.data as Blob }
      },
    }),
  }),
})

export const {
  useGetMyStoreQuery,
  useUpdateStoreSettingsMutation,
  useToggleStoreOpenMutation,
  useGetVendorStatsQuery,
  useGetVendorOrdersQuery,
  useGetVendorOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useMarkOrderReadyMutation,
  useGetMenuItemsQuery,
  useGetMenuCategoriesQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useToggleMenuItemAvailabilityMutation,
  useDeleteMenuItemMutation,
  useGetEarningsQuery,
  useGetPayoutInfoQuery,
  useExportEarningsCSVMutation,
} = vendorApi
