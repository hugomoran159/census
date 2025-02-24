import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store'

const START_DATE = new Date('2010-01-01').getTime()
const END_DATE = new Date('2025-02-24').getTime()

export interface DateRange {
  start: number  // Unix timestamp
  end: number    // Unix timestamp
}

interface FiltersState {
  dateRange: DateRange
  enabled: boolean
}

const initialState: FiltersState = {
  dateRange: {
    start: START_DATE,
    end: END_DATE
  },
  enabled: true
}

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload
    },
    toggleFilters: (state) => {
      state.enabled = !state.enabled
    }
  }
})

export const { setDateRange, toggleFilters } = filtersSlice.actions

export const selectDateRange = (state: RootState) => state.filters.dateRange
export const selectFiltersEnabled = (state: RootState) => state.filters.enabled

export default filtersSlice.reducer