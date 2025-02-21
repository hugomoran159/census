import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store'

// Define types for layer state
export interface LayerConfig {
  id: string
  type: string
  config: {
    dataId: string
    label: string
    color: string | number[]
    columns: {
      lat: string
      lng: string
      altitude?: string
    }
    isVisible: boolean
    opacity: number
    colorScale?: string
    sizeScale?: number
    [key: string]: any // For additional layer-specific config
  }
}

interface LayersState {
  layers: LayerConfig[]
  activeLayerId: string | null
  hoveredLayerId: string | null
  error: string | null
}

// Define initial state
const initialState: LayersState = {
  layers: [],
  activeLayerId: null,
  hoveredLayerId: null,
  error: null,
}

// Create the slice
export const layersSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    // Add a new layer
    addLayer: (state, action: PayloadAction<LayerConfig>) => {
      state.layers.push(action.payload)
    },
    // Remove a layer
    removeLayer: (state, action: PayloadAction<string>) => {
      state.layers = state.layers.filter(layer => layer.id !== action.payload)
      if (state.activeLayerId === action.payload) {
        state.activeLayerId = null
      }
    },
    // Update layer config
    updateLayer: (state, action: PayloadAction<{ id: string; config: Partial<LayerConfig['config']> }>) => {
      const layer = state.layers.find(l => l.id === action.payload.id)
      if (layer) {
        layer.config = { ...layer.config, ...action.payload.config }
      }
    },
    // Reorder layers
    reorderLayers: (state, action: PayloadAction<string[]>) => {
      const newLayers: LayerConfig[] = []
      action.payload.forEach(id => {
        const layer = state.layers.find(l => l.id === id)
        if (layer) {
          newLayers.push(layer)
        }
      })
      state.layers = newLayers
    },
    // Set active layer
    setActiveLayer: (state, action: PayloadAction<string | null>) => {
      state.activeLayerId = action.payload
    },
    // Set hovered layer
    setHoveredLayer: (state, action: PayloadAction<string | null>) => {
      state.hoveredLayerId = action.payload
    },
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

// Export actions
export const {
  addLayer,
  removeLayer,
  updateLayer,
  reorderLayers,
  setActiveLayer,
  setHoveredLayer,
  setError,
} = layersSlice.actions

// Export selectors
export const selectLayers = (state: RootState) => state.layers.layers
export const selectActiveLayer = (state: RootState) => {
  const activeId = state.layers.activeLayerId
  return activeId ? state.layers.layers.find(l => l.id === activeId) : null
}
export const selectHoveredLayer = (state: RootState) => {
  const hoveredId = state.layers.hoveredLayerId
  return hoveredId ? state.layers.layers.find(l => l.id === hoveredId) : null
}
export const selectError = (state: RootState) => state.layers.error

export default layersSlice.reducer 