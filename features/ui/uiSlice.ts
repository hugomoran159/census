import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store'

// Define types for UI state
interface PanelState {
  isOpen: boolean
  activeTab?: string
}

interface ModalState {
  type: string | null
  props?: Record<string, any>
}

interface UIState {
  panels: {
    layers: PanelState
    data: PanelState
    filters: PanelState
    interactions: PanelState
  }
  modal: ModalState
  tooltip: {
    isVisible: boolean
    x: number
    y: number
    content: any
  }
  splitView: {
    isEnabled: boolean
    config?: Record<string, any>
  }
  theme: 'light' | 'dark'
  error: string | null
}

// Define initial state
const initialState: UIState = {
  panels: {
    layers: { isOpen: true },
    data: { isOpen: false },
    filters: { isOpen: false },
    interactions: { isOpen: false },
  },
  modal: {
    type: null,
  },
  tooltip: {
    isVisible: false,
    x: 0,
    y: 0,
    content: null,
  },
  splitView: {
    isEnabled: false,
  },
  theme: 'light',
  error: null,
}

// Create the slice
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggle panel
    togglePanel: (state, action: PayloadAction<{ panel: keyof typeof state.panels; isOpen?: boolean }>) => {
      const { panel, isOpen } = action.payload
      state.panels[panel].isOpen = isOpen ?? !state.panels[panel].isOpen
    },
    // Set panel tab
    setPanelTab: (state, action: PayloadAction<{ panel: keyof typeof state.panels; tab: string }>) => {
      const { panel, tab } = action.payload
      state.panels[panel].activeTab = tab
    },
    // Show modal
    showModal: (state, action: PayloadAction<{ type: string; props?: Record<string, any> }>) => {
      state.modal = action.payload
    },
    // Hide modal
    hideModal: (state) => {
      state.modal = { type: null }
    },
    // Update tooltip
    updateTooltip: (state, action: PayloadAction<Partial<typeof state.tooltip>>) => {
      state.tooltip = { ...state.tooltip, ...action.payload }
    },
    // Toggle split view
    toggleSplitView: (state, action: PayloadAction<{ isEnabled: boolean; config?: Record<string, any> }>) => {
      state.splitView = action.payload
    },
    // Set theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

// Export actions
export const {
  togglePanel,
  setPanelTab,
  showModal,
  hideModal,
  updateTooltip,
  toggleSplitView,
  setTheme,
  setError,
} = uiSlice.actions

// Export selectors
export const selectPanels = (state: RootState) => state.ui.panels
export const selectModal = (state: RootState) => state.ui.modal
export const selectTooltip = (state: RootState) => state.ui.tooltip
export const selectSplitView = (state: RootState) => state.ui.splitView
export const selectTheme = (state: RootState) => state.ui.theme
export const selectError = (state: RootState) => state.ui.error

export default uiSlice.reducer 