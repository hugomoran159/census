'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '@/components/ui/tremor-slider'
import { formatDate, timestampToDate } from '@/lib/utils/dates'

interface DateSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
}

export function DateSlider({ min, max, value, onChange, step = 86400000 }: DateSliderProps) {
  const [displayValue, setDisplayValue] = React.useState(value)
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const handleValueChange = (newValue: number[]) => {
    const typedValue = newValue as [number, number]
    setIsDragging(true)
    setDisplayValue(typedValue)
    // Update filter immediately while dragging
    onChange(typedValue)
  }

  const handleValueCommit = (newValue: [number, number]) => {
    setIsDragging(false)
    // No need to call onChange here since we're updating in real-time
  }

  return (
    <div className="w-full px-8">
      <div className="relative h-16">
        {/* Date Labels */}
        <div className="absolute top-0 left-0 right-0 flex justify-between mb-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={displayValue[0]}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium text-muted-foreground"
            >
              {formatDate(timestampToDate(displayValue[0]))}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={displayValue[1]}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium text-muted-foreground"
            >
              {formatDate(timestampToDate(displayValue[1]))}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Slider */}
        <div className="absolute bottom-0 left-0 right-0">
          <Slider
            min={min}
            max={max}
            step={step}
            value={displayValue}
            onValueChange={handleValueChange}
            onValueCommit={handleValueCommit}
            className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-[1.5px] [&_[role=slider]]:border-background [&_[role=slider]]:shadow-sm [&_[role=slider]]:ring-2 [&_[role=slider]]:ring-background/10 [&_[role=slider]]:hover:bg-primary/90 [&_[role=slider]]:focus:ring-2 [&_[role=slider]]:focus:ring-primary/20 [&_[role=track]]:h-[2px] [&_[role=track]]:bg-border [&_[role=range]]:bg-primary [&_[role=slider]]:transition-colors"
            ariaLabelThumb="Date range"
          />
        </div>
      </div>
    </div>
  )
} 