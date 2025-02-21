'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useState, useMemo } from 'react'
import { Map, NavigationControl, Layer, Source } from '@vis.gl/react-maplibre'
import type { LayerProps } from '@vis.gl/react-maplibre'
import { useTheme } from 'next-themes'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import {
  selectViewState,
  selectMapStyle,
  updateViewState,
  setMapStyle,
  type ViewState
} from '@/features/map/mapSlice'

const MAP_STYLES = {
  light: {
    id: 'positron',
    name: 'Positron Light',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  dark: {
    id: 'dark-matter',
    name: 'Dark Matter',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
}

interface HoverInfo {
  x: number;
  y: number;
  properties: {
    'County': string;
    'Date of Sale (dd/mm/yyyy)': string;
    'Description of Property': string;
    'Price (€)': number;
    'Property Size Description': string;
  };
}

const circleLayer: LayerProps = {
  'id': 'property-points',
  'type': 'circle',
  'source': 'property-sales',
  'source-layer': 'property_sales',
  'paint': {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 1,
      7, 1.2,
      8, 1.5,
      9, 2,
      10, 3,
      11, 4,
      12, 5,
      13, 6,
      14, 8,
      15, 10,
      16, 12,
      17, 15,
      18, 20,
      19, 25
    ],
    'circle-color': [
      'step',
      ['get', 'Price (€)'],
      'rgba(0, 255, 0, 0.15)',   // < 100k
      100000, 'rgba(173, 255, 47, 0.15)',  // 100k-250k
      250000, 'rgba(255, 255, 0, 0.15)',   // 250k-500k
      500000, 'rgba(255, 165, 0, 0.15)',   // 500k-1M
      1000000, 'rgba(255, 69, 0, 0.15)',   // 1M-2M
      2000000, 'rgba(255, 0, 0, 0.15)'     // > 2M
    ],
    'circle-opacity': 0.8,
    'circle-stroke-width': 1,
    'circle-stroke-color': [
      'step',
      ['get', 'Price (€)'],
      'rgba(0, 255, 0, 0.3)',    // < 100k
      100000, 'rgba(173, 255, 47, 0.3)',   // 100k-250k
      250000, 'rgba(255, 255, 0, 0.3)',    // 250k-500k
      500000, 'rgba(255, 165, 0, 0.3)',    // 500k-1M
      1000000, 'rgba(255, 69, 0, 0.3)',    // 1M-2M
      2000000, 'rgba(255, 0, 0, 0.3)'      // > 2M
    ]
  }
};

export function MapView() {
  const dispatch = useAppDispatch()
  const viewState = useAppSelector(selectViewState)
  const mapStyle = useAppSelector(selectMapStyle)
  const { resolvedTheme } = useTheme()
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)

  // Update map style when theme changes
  useEffect(() => {
    const newStyle = resolvedTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light;
    dispatch(setMapStyle(newStyle));
  }, [resolvedTheme, dispatch]);

  // Vector tile source configuration
  const vectorSource = useMemo(() => ({
    type: 'vector' as const,
    tiles: [`https://census-martin.fly.dev/property_sales/{z}/{x}/{y}.pbf`],
    minzoom: 0,
    maxzoom: 14,
    attribution: 'Property Sales Data'
  }), []);

  // Handle map movement
  const onMove = (evt: { viewState: ViewState }) => {
    dispatch(updateViewState(evt.viewState));
  };

  // Handle hover interactions
  const onMouseMove = (evt: any) => {
    if (evt.features && evt.features.length > 0) {
      const feature = evt.features[0];
      setHoverInfo({
        x: evt.point.x,
        y: evt.point.y,
        properties: {
          'County': feature.properties['County'],
          'Date of Sale (dd/mm/yyyy)': feature.properties['Date of Sale (dd/mm/yyyy)'],
          'Description of Property': feature.properties['Description of Property'],
          'Price (€)': feature.properties['Price (€)'],
          'Property Size Description': feature.properties['Property Size Description']
        }
      });
    } else {
      setHoverInfo(null);
    }
  };

  const onMouseLeave = () => {
    setHoverInfo(null);
  };

  return (
    <div className="relative w-full h-full">
      <Map
        mapStyle={mapStyle.url}
        longitude={viewState.longitude}
        latitude={viewState.latitude}
        zoom={viewState.zoom}
        pitch={viewState.pitch}
        bearing={viewState.bearing}
        onMove={onMove}
        interactiveLayerIds={['property-points']}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <NavigationControl position="top-right" />
        <Source id="property-sales" {...vectorSource}>
          <Layer {...circleLayer} />
        </Source>
      </Map>
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
          <div>County: {hoverInfo.properties['County']}</div>
          <div>Price: €{hoverInfo.properties['Price (€)']?.toLocaleString()}</div>
          <div>Date: {hoverInfo.properties['Date of Sale (dd/mm/yyyy)']}</div>
          <div>Size: {hoverInfo.properties['Property Size Description']}</div>
        </div>
      )}
    </div>
  );
} 