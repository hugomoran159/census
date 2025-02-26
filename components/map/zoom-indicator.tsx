'use client'

import React from 'react'

interface ZoomIndicatorProps {
  zoom: number
}

export const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({ zoom }) => {
  // Format the zoom level to 1 decimal place
  const formattedZoom = zoom.toFixed(1)
  
  return (
    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-md z-10">
      <div className="flex items-center space-x-2">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-gray-600 dark:text-gray-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Zoom: {formattedZoom}
        </span>
      </div>
    </div>
  )
} 