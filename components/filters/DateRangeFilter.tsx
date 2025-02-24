'use client'

import * as React from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { selectDateRange, setDateRange } from '@/features/filters/filtersSlice'
import { DateSlider } from './DateSlider'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const START_DATE = new Date('2010-01-01').getTime()
const END_DATE = new Date('2025-02-24').getTime()

export function DateRangeFilter() {
  const dispatch = useAppDispatch()
  const dateRange = useAppSelector(selectDateRange)

  const handleDateRangeChange = (value: [number, number]) => {
    dispatch(setDateRange({ start: value[0], end: value[1] }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute left-0 right-0 bottom-8 mx-auto w-[800px] z-10"
    >
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-center text-muted-foreground">Property Sales Timeline</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <DateSlider
            min={START_DATE}
            max={END_DATE}
            value={[dateRange.start, dateRange.end]}
            onChange={handleDateRangeChange}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
} 