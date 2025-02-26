import { configureStore } from '@reduxjs/toolkit'
import mapReducer from '@/features/map/mapSlice'
import layersReducer from '@/features/layers/layersSlice'
import dataReducer from '@/features/data/dataSlice'
import uiReducer from '@/features/ui/uiSlice'
import filtersReducer from '@/features/filters/filtersSlice'
import geoarrowReducer from '@/features/geoarrow/geoarrowSlice'
import { apiSlice } from '@/features/api/apiSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      map: mapReducer,
      layers: layersReducer,
      data: dataReducer,
      ui: uiReducer,
      filters: filtersReducer,
      geoarrow: geoarrowReducer,
      [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false // Disable serializable check for non-serializable values like ArrayBuffer
      }).concat(apiSlice.middleware),
    // Enable Redux DevTools in development
    devTools: process.env.NODE_ENV !== 'production',
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch'] 