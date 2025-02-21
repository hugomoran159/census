import { configureStore } from '@reduxjs/toolkit'
import mapReducer from '@/features/map/mapSlice'
import layersReducer from '@/features/layers/layersSlice'
import dataReducer from '@/features/data/dataSlice'
import uiReducer from '@/features/ui/uiSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      map: mapReducer,
      layers: layersReducer,
      data: dataReducer,
      ui: uiReducer,
    },
    // Enable Redux DevTools in development
    devTools: process.env.NODE_ENV !== 'production',
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the RootState and AppDispatch types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch'] 