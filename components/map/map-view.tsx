'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useState } from 'react'
import Map, { NavigationControl } from 'react-map-gl/maplibre'
import { useTheme } from 'next-themes'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  selectViewState,
  selectMapStyle,
  updateViewState,
  setMapStyle,
} from '@/features/map/mapSlice'
import { selectDateRange, selectFiltersEnabled } from '@/features/filters/filtersSlice'
import { 
  selectGeoArrowLayers, 
  selectGeoArrowLoading, 
  selectHoverInfo,
  selectSelectedPointData
} from '@/features/geoarrow/geoarrowSlice'
import DeckGL from '@deck.gl/react'
import { ViewStateChangeParameters } from '@deck.gl/core'
// Remove DateRangeFilter import
import dynamic from 'next/dynamic'
import { ZoomIndicator } from './zoom-indicator'

const MAP_STYLES = {
  light: {
    id: 'light',
    name: 'Light',
    url: 'https://api.protomaps.com/styles/v5/light/en.json?key=5d51259c2bf27d6f',
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    url: 'https://api.protomaps.com/styles/v5/dark/en.json?key=5d51259c2bf27d6f',
  },
}

const INITIAL_VIEW_STATE = {
  longitude: -8.24389,
  latitude: 53.41291,
  zoom: 7,
  bearing: 0,
  pitch: 0,
  maxZoom: 20
}

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch: number
  bearing: number
}

// Create a client-side only component for the GeoArrow functionality
const GeoArrowMapLayer = dynamic(
  () => import('@/components/map/geo-arrow-layer').then(mod => mod.GeoArrowMapLayer),
  { 
    ssr: false,
    // This is a workaround for TypeScript errors with dynamic imports
    loading: () => null
  }
) as any; // Use 'any' type to avoid TypeScript errors with props

export function MapView() {
  const dispatch = useAppDispatch()
  const viewState = useAppSelector(selectViewState)
  const mapStyle = useAppSelector(selectMapStyle)
  const isLoading = useAppSelector(selectGeoArrowLoading)
  const layers = useAppSelector(selectGeoArrowLayers)
  const selectedPointData = useAppSelector(selectSelectedPointData)

  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const newStyle = resolvedTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light
    dispatch(setMapStyle(newStyle))
  }, [resolvedTheme, dispatch])

  const onViewStateChange = (params: ViewStateChangeParameters) => {
    const newViewState = params.viewState as ViewState
    if (newViewState.longitude && newViewState.latitude) {
      dispatch(updateViewState({
        longitude: newViewState.longitude,
        latitude: newViewState.latitude,
        zoom: newViewState.zoom || 7,
        pitch: newViewState.pitch || 0,
        bearing: newViewState.bearing || 0
      }))
    }
  }

  // These handlers are now just for the component-level UI updates
  const handleHoverInfo = (info: any) => {
    // No need to set state here as it's handled in Redux
    // This is just a pass-through for the component
  };

  const handleLoadingState = (loading: boolean) => {
    // No need to set state here as it's handled in Redux
    // This is just a pass-through for the component
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
          <div className="text-white">Loading data...</div>
        </div>
      )}
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        onViewStateChange={onViewStateChange}
        layers={layers} // Use layers from Redux
      >
        <Map
          mapStyle={mapStyle.url}
          reuseMaps
        >
          <NavigationControl position="top-right" />
        </Map>
      </DeckGL>
      
      {/* Add the zoom indicator */}
      <ZoomIndicator zoom={viewState.zoom} />
      
      {/* Render the GeoArrowMapLayer component but don't use its direct output */}
      <div style={{ display: 'none' }}>
        <GeoArrowMapLayer 
          onHoverInfo={handleHoverInfo}
          onLoadingState={handleLoadingState}
        />
      </div>
      
      {/* Removed the hover popup */}
    </div>
  )
} 