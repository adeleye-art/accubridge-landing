import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Cart, CartItem } from '@/types'

// ─── Initial state ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'afrocart_cart'

function loadFromStorage(): Cart {
  if (typeof window === 'undefined') return { items: [], vendor_id: null, vendor_name: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Cart
  } catch {
    // ignore
  }
  return { items: [], vendor_id: null, vendor_name: null }
}

function saveToStorage(cart: Cart) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // ignore
  }
}

const initialState: Cart = loadFromStorage()

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const item = action.payload

      // Different vendor — consumer must confirm clear first via UI
      if (state.vendor_id && state.vendor_id !== item.vendor_id) {
        throw new Error(`VENDOR_MISMATCH:${state.vendor_name}`)
      }

      // Set vendor if cart was empty
      if (!state.vendor_id) {
        state.vendor_id   = item.vendor_id
        state.vendor_name = item.vendor_name
      }

      const existing = state.items.find((i) => i.menu_item_id === item.menu_item_id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...item, quantity: 1 })
      }

      saveToStorage({ ...state })
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.menu_item_id !== action.payload)
      if (state.items.length === 0) {
        state.vendor_id   = null
        state.vendor_name = null
      }
      saveToStorage({ ...state })
    },

    updateQuantity(state, action: PayloadAction<{ menu_item_id: string; quantity: number }>) {
      const { menu_item_id, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.menu_item_id !== menu_item_id)
        if (state.items.length === 0) {
          state.vendor_id   = null
          state.vendor_name = null
        }
      } else {
        const item = state.items.find((i) => i.menu_item_id === menu_item_id)
        if (item) item.quantity = quantity
      }
      saveToStorage({ ...state })
    },

    clearCart(state) {
      state.items       = []
      state.vendor_id   = null
      state.vendor_name = null
      saveToStorage({ items: [], vendor_id: null, vendor_name: null })
    },

    setVendor(state, action: PayloadAction<{ vendor_id: string; vendor_name: string }>) {
      state.vendor_id   = action.payload.vendor_id
      state.vendor_name = action.payload.vendor_name
      saveToStorage({ ...state })
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart, setVendor } = cartSlice.actions

export default cartSlice.reducer

// ─── Selectors ────────────────────────────────────────────────────────────────

import type { RootState } from './index'

export const selectCart        = (state: RootState) => state.cart
export const selectCartItems   = (state: RootState) => state.cart.items
export const selectCartCount   = (state: RootState) => state.cart.items.reduce((s, i) => s + i.quantity, 0)
export const selectCartSubtotal = (state: RootState) =>
  state.cart.items.reduce((s, i) => s + i.price * i.quantity, 0)
export const selectCartVendorId = (state: RootState) => state.cart.vendor_id
