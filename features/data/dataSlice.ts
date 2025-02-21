import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store'

// Define types for data state
export interface DatasetInfo {
  id: string
  label: string
  color?: string | number[]
  format: 'csv' | 'geojson' | 'json'
  size: number
  rows: number
  columns: string[]
  timeField?: string
  fields: {
    name: string
    type: 'string' | 'number' | 'boolean' | 'timestamp'
    format?: string
  }[]
}

export interface Dataset {
  info: DatasetInfo
  data: any[] // The actual data rows
}

interface DataState {
  datasets: Record<string, Dataset>
  processingDatasets: string[]
  error: string | null
}

// Define initial state
const initialState: DataState = {
  datasets: {},
  processingDatasets: [],
  error: null,
}

// Create the slice
export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Add a new dataset
    addDataset: (state, action: PayloadAction<Dataset>) => {
      state.datasets[action.payload.info.id] = action.payload
    },
    // Remove a dataset
    removeDataset: (state, action: PayloadAction<string>) => {
      delete state.datasets[action.payload]
    },
    // Update dataset info
    updateDatasetInfo: (state, action: PayloadAction<{ id: string; info: Partial<DatasetInfo> }>) => {
      const dataset = state.datasets[action.payload.id]
      if (dataset) {
        dataset.info = { ...dataset.info, ...action.payload.info }
      }
    },
    // Set processing state
    setProcessingDataset: (state, action: PayloadAction<{ id: string; processing: boolean }>) => {
      const { id, processing } = action.payload
      if (processing) {
        state.processingDatasets.push(id)
      } else {
        state.processingDatasets = state.processingDatasets.filter(dataId => dataId !== id)
      }
    },
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

// Export actions
export const {
  addDataset,
  removeDataset,
  updateDatasetInfo,
  setProcessingDataset,
  setError,
} = dataSlice.actions

// Export selectors
export const selectDatasets = (state: RootState) => state.data.datasets
export const selectDataset = (id: string) => (state: RootState) => state.data.datasets[id]
export const selectProcessingDatasets = (state: RootState) => state.data.processingDatasets
export const selectError = (state: RootState) => state.data.error

export default dataSlice.reducer 