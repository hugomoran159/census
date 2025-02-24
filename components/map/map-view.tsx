'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useState, useMemo } from 'react'
import Map, { NavigationControl, MapRef } from 'react-map-gl/maplibre'
import { useTheme } from 'next-themes'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  selectViewState,
  selectMapStyle,
  updateViewState,
  setMapStyle,
} from '@/features/map/mapSlice'
import { selectDateRange, selectFiltersEnabled } from '@/features/filters/filtersSlice'
import DeckGL from '@deck.gl/react'
import { MVTLayer } from '@deck.gl/geo-layers'
import { ViewStateChangeParameters } from '@deck.gl/core'
import { DataFilterExtension } from '@deck.gl/extensions'
import { parseDate, dateToTimestamp } from '@/lib/utils/dates'
import { DateRangeFilter } from '@/components/filters/DateRangeFilter'

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

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch: number
  bearing: number
}

interface MVTFeature {
  properties: {
    'County': string
    'Date of Sale (dd/mm/yyyy)': string
    'Description of Property': string
    'Price (€)': number
    'Property Size Description': string
    'formatted_address': string
  }
}

export function MapView() {
  const dispatch = useAppDispatch()
  const viewState = useAppSelector(selectViewState)
  const mapStyle = useAppSelector(selectMapStyle)
  const dateRange = useAppSelector(selectDateRange)
  const filtersEnabled = useAppSelector(selectFiltersEnabled)
  const { resolvedTheme } = useTheme()
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)

  useEffect(() => {
    const newStyle = resolvedTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light
    dispatch(setMapStyle(newStyle))
  }, [resolvedTheme, dispatch])

  const layers = useMemo(() => {
    return [
      new MVTLayer({
        id: 'property-sales',
        data: 'http://localhost:8080/data/property_sales/{z}/{x}/{y}.pbf',
        minZoom: 0,
        maxZoom: 13,
        pickable: true,
        getFillColor: d => {
          const price = d.properties['Price (€)']
          if (price >= 2000000) return [255, 0, 0]    // Red
          if (price >= 1000000) return [255, 69, 0]   // Red-Orange
          if (price >= 500000) return [255, 165, 0]   // Orange
          if (price >= 250000) return [255, 255, 0]   // Yellow
          if (price >= 100000) return [173, 255, 47]  // Green-Yellow
          return [0, 255, 0]                          // Green
        },
        getPointRadius: 50,
        pointRadiusMinPixels: 2,
        pointRadiusMaxPixels: 8,
        opacity: 0.6,
        extensions: [new DataFilterExtension({ filterSize: 1 })],
        getFilterValue: (d: MVTFeature) => {
          try {
            const date = parseDate(d.properties['Date of Sale (dd/mm/yyyy)'])
            return [date.getTime()]
          } catch (e) {
            console.error('Error parsing date:', d.properties['Date of Sale (dd/mm/yyyy)'])
            return [0] // Return a timestamp that will be filtered out
          }
        },
        filterRange: [dateRange.start, dateRange.end],
        updateTriggers: {
          getFilterValue: dateRange,
          filterRange: dateRange
        },
        visible: filtersEnabled,
        parameters: {
          depthTest: false
        },
        loadOptions: {
          mvt: {
            shape: 'Point'
          }
        },
        onHover: info => {
          if (info.object) {
            try {
              const date = parseDate(info.object.properties['Date of Sale (dd/mm/yyyy)'])
              const timestamp = dateToTimestamp(date)
              console.log({
                pointDate: info.object.properties['Date of Sale (dd/mm/yyyy)'],
                pointTimestamp: timestamp,
                rangeStart: dateRange.start,
                rangeEnd: dateRange.end,
                isInRange: timestamp >= dateRange.start && timestamp <= dateRange.end
              })
            } catch (e) {
              console.error('Error logging date info:', e)
            }
            
            setHoverInfo({
              x: info.x,
              y: info.y,
              properties: {
                'County': info.object.properties.County,
                'Date of Sale (dd/mm/yyyy)': info.object.properties['Date of Sale (dd/mm/yyyy)'],
                'Description of Property': info.object.properties['Description of Property'],
                'Price (€)': info.object.properties['Price (€)'],
                'Property Size Description': info.object.properties['Property Size Description'],
                'formatted_address': info.object.properties.formatted_address
              }
            })
          } else {
            setHoverInfo(null)
          }
        }
      })
    ]
  }, [dateRange, filtersEnabled])

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

  return (
    <div className="relative w-full h-full">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onViewStateChange={onViewStateChange}
      >
        <Map
          mapStyle={mapStyle.url}
          reuseMaps
        >
          <NavigationControl position="top-right" />
        </Map>
      </DeckGL>
      <DateRangeFilter />
      {hoverInfo && (
        <div 
          style={{
            position: 'absolute',
            zIndex: 1,
            pointerEvents: 'none',
            left: hoverInfo.x,
            top: hoverInfo.y,
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            maxWidth: '300px'
          }}
        >
          <div className="font-bold">{hoverInfo.properties['Description of Property']}</div>
          <div>{hoverInfo.properties.formatted_address}</div>
          <div>County: {hoverInfo.properties['County']}</div>
          <div>Price: €{hoverInfo.properties['Price (€)'].toLocaleString()}</div>
          <div>Date: {hoverInfo.properties['Date of Sale (dd/mm/yyyy)']}</div>
          {hoverInfo.properties['Property Size Description'] && (
            <div>Size: {hoverInfo.properties['Property Size Description']}</div>
          )}
        </div>
      )}
    </div>
  )
} 