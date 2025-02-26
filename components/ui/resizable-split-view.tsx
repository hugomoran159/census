"use client"

import * as React from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { 
  selectSplitViewRatio, 
  selectIsDragging, 
  setSplitViewRatio, 
  setDraggingState 
} from "@/features/ui/uiSlice"

interface ResizableSplitViewProps {
  leftPane: React.ReactNode
  rightPane: React.ReactNode
  className?: string
}

export function ResizableSplitView({
  leftPane,
  rightPane,
  className,
}: ResizableSplitViewProps) {
  const dispatch = useAppDispatch()
  const splitRatio = useAppSelector(selectSplitViewRatio)
  const isDragging = useAppSelector(selectIsDragging)
  
  // Container ref to get dimensions
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  // Calculate exact pixel width for debugging
  const getPixelWidth = () => {
    if (!containerRef.current) return 0
    return (containerRef.current.clientWidth * splitRatio) / 100
  }
  
  // Handle mouse down event to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const startX = e.clientX
    const startRatio = splitRatio
    
    dispatch(setDraggingState(true))
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const containerWidth = containerRef.current.clientWidth
      const deltaX = e.clientX - startX
      const deltaRatio = (deltaX / containerWidth) * 100
      
      dispatch(setSplitViewRatio(startRatio + deltaRatio))
    }
    
    const handleMouseUp = () => {
      dispatch(setDraggingState(false))
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  // Handle touch start event for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    
    const startX = e.touches[0].clientX
    const startRatio = splitRatio
    
    dispatch(setDraggingState(true))
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault() // Prevent scrolling while dragging
      
      if (!containerRef.current) return
      
      const containerWidth = containerRef.current.clientWidth
      const deltaX = e.touches[0].clientX - startX
      const deltaRatio = (deltaX / containerWidth) * 100
      
      dispatch(setSplitViewRatio(startRatio + deltaRatio))
    }
    
    const handleTouchEnd = () => {
      dispatch(setDraggingState(false))
      
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)
    }
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleTouchEnd)
  }
  
  return (
    <div 
      ref={containerRef} 
      className="relative h-full w-full"
    >
      {/* Flex container for panes */}
      <div className="flex h-full w-full">
        {/* Left Pane */}
        <div 
          className="h-full overflow-auto"
          style={{ width: `${splitRatio}%` }}
        >
          {leftPane}
        </div>
        
        {/* Right Pane */}
        <div 
          className="h-full overflow-hidden"
          style={{ width: `${100 - splitRatio}%` }}
        >
          {rightPane}
        </div>
      </div>
      
      {/* Visible border line */}
      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-border pointer-events-none"
        style={{ 
          left: `${splitRatio}%`,
          zIndex: 20
        }}
      />
      
      {/* Custom divider - exactly at the border */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`
          absolute top-0 bottom-0 z-30
          w-[10px] cursor-col-resize
          flex items-center justify-center
          ${isDragging ? "bg-primary/30" : "hover:bg-primary/10"}
        `}
        style={{ 
          left: `${splitRatio}%`,
          transform: "translateX(-50%)",
          touchAction: "none"
        }}
      >
        {isDragging && (
          <div className="h-full w-[2px] bg-primary" />
        )}
      </div>
      
      {/* Debug info - remove in production */}
      <div className="absolute bottom-2 left-2 bg-background/80 text-xs p-1 rounded z-50">
        Split: {splitRatio.toFixed(2)}% | Pixels: {getPixelWidth().toFixed(0)}px
      </div>
    </div>
  )
} 