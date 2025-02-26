import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Table, tableFromIPC } from 'apache-arrow'
import { RootState } from '@/lib/store'

// Define types
interface HoverInfo {
  x: number
  y: number
  properties: {
    'County': string
    'Date of Sale (dd/mm/yyyy)': string
    'Description of Property': string
    'Price (€)': number
    'Property Size Description': string
    'formatted_address': string
  }
}

interface PointProperties {
  'County': string
  'Date of Sale (dd/mm/yyyy)': string
  'Description of Property': string
  'Price (€)': number
  'Property Size Description': string
  'formatted_address': string
}

interface SelectedPointData {
  index: number
  properties: PointProperties | null
}

// We'll use a module-level variable to store the Table reference
// This avoids Redux serialization issues with complex objects
let geoDataTable: Table | null = null;

// Function to set the geoData outside of Redux
export const setGeoDataTable = (table: Table | null) => {
  geoDataTable = table;
};

// Function to get the geoData
export const getGeoDataTable = () => {
  return geoDataTable;
};

interface GeoArrowState {
  initialized: boolean
  isLoading: boolean
  layers: any[]
  hoverInfo: HoverInfo | null
  selectedPointData: SelectedPointData | null
  error: string | null
  colorProperty: string
  colorScale: string
}

const initialState: GeoArrowState = {
  initialized: false,
  isLoading: false,
  layers: [],
  hoverInfo: null,
  selectedPointData: null,
  error: null,
  colorProperty: 'Price (€)',
  colorScale: 'viridis'
}

// Async thunks
export const initializeGeoArrow = createAsyncThunk(
  'geoarrow/initialize',
  async () => {
    try {
      // No need to import WASM module for Arrow data
      return true
    } catch (error) {
      console.error('Failed to initialize GeoArrow:', error)
      throw error
    }
  }
)

// Thunk to load Arrow data
export const loadArrowData = createAsyncThunk(
  'geoarrow/loadArrowData',
  async (arrowBuffer: ArrayBuffer) => {
    try {
      const table = tableFromIPC(new Uint8Array(arrowBuffer))
      setGeoDataTable(table)
      return true
    } catch (error) {
      console.error('Failed to load Arrow data:', error)
      throw error
    }
  }
)

// Thunk to fetch point data on demand
export const fetchPointData = createAsyncThunk(
  'geoarrow/fetchPointData',
  async (index: number) => {
    const geoData = getGeoDataTable();
    
    if (!geoData || index < 0 || index >= geoData.numRows) {
      throw new Error('Invalid index or no data available')
    }
    
    try {
      // Fetch the data for the selected point
      const properties: PointProperties = {
        'County': geoData.getChild('County')?.get(index) as string || '',
        'Date of Sale (dd/mm/yyyy)': geoData.getChild('Date of Sale (dd/mm/yyyy)')?.get(index) as string || '',
        'Description of Property': geoData.getChild('Description of Property')?.get(index) as string || '',
        'Price (€)': (() => {
          const priceStr = geoData.getChild('Price (€)')?.get(index) as string;
          return priceStr ? parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0 : 0;
        })(),
        'Property Size Description': geoData.getChild('Property Size Description')?.get(index) as string || '',
        'formatted_address': geoData.getChild('Formatted_Address')?.get(index) as string || ''
      }
      
      return { index, properties }
    } catch (error) {
      console.error('Error fetching point data:', error)
      throw error
    }
  }
)

// Create the slice
const geoarrowSlice = createSlice({
  name: 'geoarrow',
  initialState,
  reducers: {
    setHoverInfo: (state, action: PayloadAction<HoverInfo | null>) => {
      state.hoverInfo = action.payload
    },
    setSelectedPointData: (state, action: PayloadAction<SelectedPointData | null>) => {
      state.selectedPointData = action.payload
    },
    setLayers: (state, action: PayloadAction<any[]>) => {
      state.layers = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setColorProperty: (state, action: PayloadAction<string>) => {
      state.colorProperty = action.payload
    },
    setColorScale: (state, action: PayloadAction<string>) => {
      state.colorScale = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize GeoArrow
      .addCase(initializeGeoArrow.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(initializeGeoArrow.fulfilled, (state) => {
        state.initialized = true
        state.isLoading = false
      })
      .addCase(initializeGeoArrow.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to initialize GeoArrow'
      })
      // Load Arrow data
      .addCase(loadArrowData.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadArrowData.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(loadArrowData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to load Arrow data'
      })
      // Fetch point data
      .addCase(fetchPointData.fulfilled, (state, action) => {
        if (state.selectedPointData && state.selectedPointData.index === action.payload.index) {
          state.selectedPointData.properties = action.payload.properties
        }
      })
  }
})

// Export actions and selectors
export const { 
  setHoverInfo, 
  setSelectedPointData, 
  setLayers, 
  setLoading, 
  setError,
  setColorProperty,
  setColorScale
} = geoarrowSlice.actions

export const selectGeoArrowInitialized = (state: RootState) => state.geoarrow.initialized
export const selectGeoArrowLoading = (state: RootState) => state.geoarrow.isLoading
export const selectGeoArrowLayers = (state: RootState) => state.geoarrow.layers
export const selectHoverInfo = (state: RootState) => state.geoarrow.hoverInfo
export const selectSelectedPointData = (state: RootState) => state.geoarrow.selectedPointData
export const selectGeoArrowError = (state: RootState) => state.geoarrow.error
export const selectColorProperty = (state: RootState) => state.geoarrow.colorProperty
export const selectColorScale = (state: RootState) => state.geoarrow.colorScale

export default geoarrowSlice.reducer 