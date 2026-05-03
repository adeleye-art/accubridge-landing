import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: (process.env.NEXT_PUBLIC_API_URL ?? '') + '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).swidexAuth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User', 'Vendor', 'Order', 'Driver', 'Referral', 'Stats', 'Credits', 'Product'],
  endpoints: () => ({}),
})
