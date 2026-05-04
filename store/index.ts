import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import swidexAuthReducer from './swidexAuthSlice'
import cartReducer from './cartSlice'
import driverReducer from './driverSlice'
import { baseApi } from './api/baseApi'
import { baseApi as accubridgeApi } from '@/lib/accubridge/api/baseApi'

// ─── Import all APIs so their endpoints are registered ────────────────────────
import '@/store/api/customerApi'
import '@/store/api/vendorApi'
import '@/store/api/adminApi'
import '@/store/api/authApi'
import '@/store/api/driverApi'

// ─── Persist config (cart only) ───────────────────────────────────────────────

const cartPersistConfig = {
  key: 'afrocart_cart',
  storage,
  whitelist: ['items', 'vendor_id', 'vendor_name'],
}

const rootReducer = combineReducers({
  swidexAuth:                  swidexAuthReducer,
  cart:                        persistReducer(cartPersistConfig, cartReducer),
  driver:                      driverReducer,
  [baseApi.reducerPath]:       baseApi.reducer,
  [accubridgeApi.reducerPath]: accubridgeApi.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware, accubridgeApi.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
