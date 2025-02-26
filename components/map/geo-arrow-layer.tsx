'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { DataFilterExtension } from '@deck.gl/extensions'
import { parseDate, dateToTimestamp } from '@/lib/utils/dates'
import { GeoArrowScatterplotLayer } from "@geoarrow/deck.gl-layers"
import { Table, tableFromIPC } from 'apache-arrow'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { 
  initializeGeoArrow, 
  setHoverInfo, 
  setLayers,
  selectGeoArrowInitialized,
  selectGeoArrowLoading,
  setSelectedPointData,
  setGeoDataTable,
  fetchPointData,
  loadArrowData as loadArrowDataAction
} from '@/features/geoarrow/geoarrowSlice'
import { selectDateRange, selectFiltersEnabled } from '@/features/filters/filtersSlice'
import React from 'react'

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

interface GeoArrowMapLayerProps {
  onHoverInfo: (info: HoverInfo | null) => void
  onLoadingState: (loading: boolean) => void
}

// Use React.memo to prevent unnecessary re-renders
export const GeoArrowMapLayer = React.memo(function GeoArrowMapLayer({ 
  onHoverInfo,
  onLoadingState
}: GeoArrowMapLayerProps) {
  const dispatch = useAppDispatch()
  const [geoData, setGeoData] = useState<Table | null>(null)
  const [processingData, setProcessingData] = useState(false)
  
  // Get state from Redux
  const initialized = useAppSelector(selectGeoArrowInitialized)
  const isLoading = useAppSelector(selectGeoArrowLoading)
  const dateRange = useAppSelector(selectDateRange)
  const filtersEnabled = useAppSelector(selectFiltersEnabled)

  // Initialize GeoArrow
  useEffect(() => {
    if (!initialized) {
      dispatch(initializeGeoArrow())
    }
  }, [dispatch, initialized])

  // Update loading state in parent component - memoized to prevent unnecessary updates
  const updateLoadingState = useCallback((loading: boolean) => {
    onLoadingState(loading)
  }, [onLoadingState])

  // Use the memoized callback in the effect
  useEffect(() => {
    updateLoadingState(isLoading || processingData)
  }, [isLoading, processingData, updateLoadingState])

  // Load the Arrow data directly
  useEffect(() => {
    // Skip if we already have data or are already processing
    if (!initialized || geoData || processingData) return

    const loadArrowData = async () => {
      try {
        setProcessingData(true)
        
        console.log('Fetching Arrow data...')
        
        // Directly fetch the Arrow file
        const response = await fetch('/property_sales.arrow')
        console.log('Arrow data fetched, processing...')
        
        // Clone the response before using it
        const responseForTable = response.clone()
        const responseForRedux = response.clone()
        
        // Use tableFromIPC with the cloned response
        const table = await tableFromIPC(responseForTable)
        console.log('Arrow table loaded, schema:', table.schema.toString())
        
        // Store the table in both component state and Redux
        setGeoData(table)
        setGeoDataTable(table)
        
        // Also dispatch the loadArrowData action to update Redux state
        const arrayBuffer = await responseForRedux.arrayBuffer()
        dispatch(loadArrowDataAction(arrayBuffer))
      } catch (error) {
        console.error('Error loading Arrow data:', error)
      } finally {
        setProcessingData(false)
      }
    }
    
    loadArrowData()
  }, [initialized, geoData, processingData, dispatch])

  // Memoize the hover handler to prevent unnecessary re-renders
  const handleHover = useCallback((info: any) => {
    if (!info) {
      dispatch(setHoverInfo(null));
      onHoverInfo(null);
      return;
    }
    
    if (info.object) {
      // Check if info.object is a valid index
      const i = typeof info.object === 'number' ? info.object : info.index;
      
      if (typeof i !== 'number' || isNaN(i)) {
        console.log('Invalid hover object:', info.object);
        dispatch(setSelectedPointData(null));
        onHoverInfo(null);
        return;
      }
      
      // Store the selected point data in Redux with just the index
      dispatch(setSelectedPointData({
        index: i,
        properties: null // We'll fetch this on demand when needed
      }));
      
      // Fetch the point data asynchronously
      dispatch(fetchPointData(i));
      
      // For backward compatibility, still call the onHoverInfo prop
      // but we won't display it in the UI
      onHoverInfo(null);
    } else {
      dispatch(setSelectedPointData(null));
      onHoverInfo(null);
    }
  }, [dispatch, onHoverInfo]);

  // Create the layers with proper memoization
  const layers = useMemo(() => {
    if (!geoData || !filtersEnabled) return []

    try {
      console.log('Creating GeoArrow layer with data...')
      
      const geometryColumn = geoData.getChild('geometry')
      
      if (!geometryColumn) {
        console.error('Could not find geometry column')
        return []
      }
      
      // Log the geometry column type for debugging
      console.log('Geometry column type:', geometryColumn.type.toString())
      
      // Create a GeoArrowScatterplotLayer that uses the geometry column
      const layer = new GeoArrowScatterplotLayer({
        id: 'property-sales',
        data: geoData,
        getPosition: geometryColumn,
        getRadius: 1,
        radiusScale: 10,
        pickable: true,
        onHover: handleHover,
        getFillColor: [255, 140, 0, 200]
      })
      
      return [layer]
    } catch (error) {
      console.error("Error creating layer:", error)
      return []
    }
  }, [geoData, dateRange, filtersEnabled, handleHover])

  // Use a deep comparison to prevent unnecessary updates
  const layersString = JSON.stringify(layers.map(layer => {
    if (!layer) return { id: 'unknown' }
    return { id: layer.id }
  }))

  // Update layers in Redux when they change (with deep comparison)
  useEffect(() => {
    if (layers.length > 0) {
      dispatch(setLayers(layers))
    }
  }, [layersString, dispatch])

  // Important: Don't return the layers directly as they are objects, not React elements
  // Instead, return null and let the parent DeckGL component use the layers from Redux
  return null
}); 