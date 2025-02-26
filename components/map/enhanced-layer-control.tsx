'use client'

import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { 
  LayerType, 
  selectAllLayers, 
  toggleLayerVisibility,
  setLayerOpacity,
  toggleLayerHighlight
} from '@/features/map/mapSlice'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Eye, EyeOff, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

const layerIcons = {
  'property-sales': '🏠',
  'property-rentals': '🔑',
  'planning-permissions': '📋',
  'admin-zones': '🗺️',
  'property-sales-scatter': '📍',
  'property-sales-heatmap': '🔥',
  'property-sales-cluster': '🔷'
}

const layerDescriptions = {
  'property-sales': 'Property sales data across Ireland',
  'property-rentals': 'Rental properties available in the market',
  'planning-permissions': 'Planning applications and permissions',
  'admin-zones': 'Administrative boundaries and zones',
  'property-sales-scatter': 'Property sales as scatter points with clustering',
  'property-sales-heatmap': 'Property sales as a heatmap visualization',
  'property-sales-cluster': 'Property sales clustered in hexagonal bins'
}

export function EnhancedLayerControl() {
  const dispatch = useAppDispatch()
  const layers = useAppSelector(selectAllLayers)
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({})
  
  const handleToggleLayer = (layerId: LayerType) => {
    dispatch(toggleLayerVisibility(layerId))
  }
  
  const handleOpacityChange = (layerId: LayerType, opacity: number[]) => {
    dispatch(setLayerOpacity({ layerId, opacity: opacity[0] }))
  }
  
  const handleHighlightLayer = (layerId: LayerType) => {
    dispatch(toggleLayerHighlight(layerId))
  }
  
  const toggleLayerExpanded = (layerId: string) => {
    setExpandedLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }))
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Map Layers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {Object.entries(layers).map(([layerId, layerState]) => (
            <div key={layerId} className="rounded-md border">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => toggleLayerExpanded(layerId)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl" aria-hidden="true">
                    {layerIcons[layerId as keyof typeof layerIcons] || '📍'}
                  </span>
                  <div>
                    <h4 className="text-sm font-medium">{formatLayerName(layerId)}</h4>
                    <p className="text-xs text-muted-foreground">
                      {layerDescriptions[layerId as keyof typeof layerDescriptions] || 'Map layer'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={layerState.visible}
                    onCheckedChange={() => handleToggleLayer(layerId as LayerType)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Toggle ${formatLayerName(layerId)}`}
                  />
                  {expandedLayers[layerId] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              
              <AnimatePresence>
                {expandedLayers[layerId] && layerState.visible && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 border-t">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`opacity-${layerId}`}>Opacity</Label>
                            <span className="text-xs text-muted-foreground">{Math.round(layerState.opacity * 100)}%</span>
                          </div>
                          <Slider 
                            id={`opacity-${layerId}`}
                            min={0} 
                            max={1} 
                            step={0.01}
                            value={[layerState.opacity]}
                            onValueChange={(value) => handleOpacityChange(layerId as LayerType, value)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`highlight-${layerId}`}>Highlight</Label>
                          <Switch 
                            id={`highlight-${layerId}`}
                            checked={layerState.highlighted}
                            onCheckedChange={() => handleHighlightLayer(layerId as LayerType)}
                          />
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleLayer(layerId as LayerType)
                          }}
                        >
                          {layerState.visible ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Hide Layer
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Show Layer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function formatLayerName(layerId: string): string {
  return layerId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
} 