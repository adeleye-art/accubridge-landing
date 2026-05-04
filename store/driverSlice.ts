import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

interface DriverState {
  isOnline:           boolean
  hasActiveDelivery:  boolean
  activeDeliveryId:   string | null
  jobsPollingActive:  boolean
}

const initialState: DriverState = {
  isOnline:           false,
  hasActiveDelivery:  false,
  activeDeliveryId:   null,
  jobsPollingActive:  false,
}

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline          = action.payload
      state.jobsPollingActive = action.payload
    },
    setActiveDelivery(state, action: PayloadAction<string | null>) {
      state.activeDeliveryId  = action.payload
      state.hasActiveDelivery = action.payload !== null
    },
    setPollingActive(state, action: PayloadAction<boolean>) {
      state.jobsPollingActive = action.payload
    },
  },
})

export const { setOnlineStatus, setActiveDelivery, setPollingActive } = driverSlice.actions

export const selectDriverIsOnline          = (s: RootState) => s.driver.isOnline
export const selectHasActiveDelivery       = (s: RootState) => s.driver.hasActiveDelivery
export const selectActiveDeliveryId        = (s: RootState) => s.driver.activeDeliveryId
export const selectJobsPollingActive       = (s: RootState) => s.driver.jobsPollingActive

export default driverSlice.reducer
