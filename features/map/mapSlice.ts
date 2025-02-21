import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store'

// Define types for the map state
export interface ViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch: number
  bearing: number
  padding?: { [key: string]: number }
  maxZoom?: number
  minZoom?: number
  maxPitch?: number
  minPitch?: number
}

export interface MapStyle {
  id: string
  name: string
  url: string
  attribution?: string
}

interface MapState {
  viewState: ViewState
  mapStyle: MapStyle
  isLoaded: boolean
  error: string | null
  interactionState: {
    inTransition?: boolean
    isDragging?: boolean
    isPanning?: boolean
    isRotating?: boolean
    isZooming?: boolean
  }
}

// Define the initial state
const initialState: MapState = {
  viewState: {
    longitude: -8.24389,
    latitude: 53.41291,
    zoom: 6.5,
    pitch: 0,
    bearing: 0,
    padding: {},
    maxZoom: 20,
    minZoom: 0,
    maxPitch: 60,
    minPitch: 0,
  },
  mapStyle: {
    id: 'positron',
    name: 'Positron Light',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  isLoaded: false,
  error: null,
  interactionState: {},
}

// Create the slice
export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    // Update view state (position, zoom, etc.)
    updateViewState: (state, action: PayloadAction<Partial<ViewState>>) => {
      state.viewState = { ...state.viewState, ...action.payload }
    },
    // Update interaction state
    updateInteractionState: (state, action: PayloadAction<MapState['interactionState']>) => {
      state.interactionState = action.payload
    },
    // Change map style
    setMapStyle: (state, action: PayloadAction<MapStyle>) => {
      state.mapStyle = action.payload
    },
    // Set map loaded state
    setMapLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload
    },
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

// Export actions
export const {
  updateViewState,
  updateInteractionState,
  setMapStyle,
  setMapLoaded,
  setError,
} = mapSlice.actions

// Export selectors
export const selectViewState = (state: RootState) => state.map.viewState
export const selectMapStyle = (state: RootState) => state.map.mapStyle
export const selectIsLoaded = (state: RootState) => state.map.isLoaded
export const selectError = (state: RootState) => state.map.error
export const selectInteractionState = (state: RootState) => state.map.interactionState

export default mapSlice.reducer 