import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import { baseApi } from './api/baseApi'
import './api/authApi'
import './api/adminApi'
import './api/vendorApi'
import './api/orderApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
