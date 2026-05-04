import { baseApi } from './baseApi'
import type {
  Restaurant,
  GroceryStore,
  MenuItem,
  MenuCategory,
  CartCalculation,
  PromoCode,
  CustomerOrder,
  Address,
  WalletTransaction,
  ReferralStatus,
  DeliveryQuote,
  DeliveryRequest,
  DeliveryItemType,
  ReviewRequest,
} from '@/types'

// ─── Paginated wrapper ────────────────────────────────────────────────────────

interface Paginated<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ─── Customer API ─────────────────────────────────────────────────────────────

const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // ── Browse — Restaurants ─────────────────────────────────────────────────

    getRestaurants: build.query<Paginated<Restaurant>, {
      search?: string
      cuisine?: string
      sort?: 'rating' | 'delivery_time' | 'delivery_fee'
      is_open?: boolean
      page?: number
      per_page?: number
    }>({
      query: (params) => ({ url: '/restaurants', params }),
      providesTags: ['Vendor'],
    }),

    getRestaurantById: build.query<Restaurant & { menu_categories: MenuCategory[] }, string>({
      query: (id) => `/restaurants/${id}`,
      providesTags: ['Vendor'],
    }),

    getRestaurantMenu: build.query<MenuItem[], { id: string; category?: string }>({
      query: ({ id, category }) => ({ url: `/restaurants/${id}/menu`, params: { category } }),
      providesTags: ['Product'],
    }),

    // ── Browse — Grocery Stores ──────────────────────────────────────────────

    getGroceryStores: build.query<Paginated<GroceryStore>, {
      search?: string
      category?: string
      sort?: 'rating' | 'delivery_time' | 'delivery_fee'
      page?: number
      per_page?: number
    }>({
      query: (params) => ({ url: '/stores', params }),
      providesTags: ['Vendor'],
    }),

    getGroceryStoreById: build.query<GroceryStore & { categories: MenuCategory[] }, string>({
      query: (id) => `/stores/${id}`,
      providesTags: ['Vendor'],
    }),

    getStoreProducts: build.query<Paginated<MenuItem>, {
      id: string
      category?: string
      search?: string
      page?: number
      per_page?: number
    }>({
      query: ({ id, ...params }) => ({ url: `/stores/${id}/products`, params }),
      providesTags: ['Product'],
    }),

    // ── Cart Calculation ─────────────────────────────────────────────────────

    calculateCart: build.mutation<CartCalculation, {
      vendor_id: string
      items: { menu_item_id: string; quantity: number }[]
      apply_credits: boolean
      promo_code?: string
      delivery_address_id: string
    }>({
      query: (body) => ({ url: '/cart/calculate', method: 'POST', body }),
    }),

    validatePromoCode: build.mutation<PromoCode, {
      code: string
      vendor_id: string
      subtotal: number
    }>({
      query: (body) => ({ url: '/cart/validate-promo', method: 'POST', body }),
    }),

    // ── Orders ───────────────────────────────────────────────────────────────

    placeOrder: build.mutation<CustomerOrder, {
      vendor_id: string
      items: { menu_item_id: string; quantity: number }[]
      delivery_address_id: string
      payment_method: 'card' | 'credits' | 'cash'
      apply_credits: boolean
      promo_code?: string
      delivery_instructions?: string
    }>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),

    getMyOrders: build.query<Paginated<CustomerOrder>, {
      status?: string
      page?: number
      per_page?: number
    }>({
      query: (params) => ({ url: '/orders/me', params }),
      providesTags: ['Order'],
    }),

    getMyOrderById: build.query<CustomerOrder, string>({
      query: (id) => `/orders/me/${id}`,
      providesTags: ['Order'],
    }),

    submitReview: build.mutation<void, ReviewRequest>({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),

    // ── Delivery Requests ────────────────────────────────────────────────────

    getDeliveryQuote: build.mutation<DeliveryQuote, {
      pickup_location: string
      dropoff_location: string
      item_type: DeliveryItemType
    }>({
      query: (body) => ({ url: '/delivery/quote', method: 'POST', body }),
    }),

    createDeliveryRequest: build.mutation<DeliveryRequest, {
      pickup_location: string
      dropoff_location: string
      item_type: DeliveryItemType
      item_description?: string
      quoted_price: number
    }>({
      query: (body) => ({ url: '/delivery/requests', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),

    getMyDeliveryRequests: build.query<DeliveryRequest[], void>({
      query: () => '/delivery/requests/me',
      providesTags: ['Order'],
    }),

    // ── Account ──────────────────────────────────────────────────────────────

    getMyAddresses: build.query<Address[], void>({
      query: () => '/users/me/addresses',
      providesTags: ['User'],
    }),

    addAddress: build.mutation<Address, { label: string; full_address: string; postcode: string; is_default: boolean }>({
      query: (body) => ({ url: '/users/me/addresses', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    updateAddress: build.mutation<Address, { id: string; label: string; full_address: string; postcode: string; is_default: boolean }>({
      query: ({ id, ...body }) => ({ url: `/users/me/addresses/${id}`, method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),

    deleteAddress: build.mutation<void, string>({
      query: (id) => ({ url: `/users/me/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    getWallet: build.query<{ balance: number; transactions: WalletTransaction[] }, void>({
      query: () => '/users/me/wallet',
      providesTags: ['User'],
    }),

    getReferralStatus: build.query<ReferralStatus, void>({
      query: () => '/referrals/my-status',
      providesTags: ['User'],
    }),

    updateProfile: build.mutation<void, { name: string; email: string; phone: string }>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),

    updatePassword: build.mutation<void, { current_password: string; new_password: string; confirm_password: string }>({
      query: (body) => ({ url: '/users/me/password', method: 'PUT', body }),
    }),
  }),
})

export const {
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useGetRestaurantMenuQuery,
  useGetGroceryStoresQuery,
  useGetGroceryStoreByIdQuery,
  useGetStoreProductsQuery,
  useCalculateCartMutation,
  useValidatePromoCodeMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderByIdQuery,
  useSubmitReviewMutation,
  useGetDeliveryQuoteMutation,
  useCreateDeliveryRequestMutation,
  useGetMyDeliveryRequestsQuery,
  useGetMyAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetWalletQuery,
  useGetReferralStatusQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
} = customerApi
