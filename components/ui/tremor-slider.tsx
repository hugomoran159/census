"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ariaLabelThumb?: string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ariaLabelThumb, ...props }, forwardedRef) => {
  const value = props.value || props.defaultValue
  return (
    <SliderPrimitive.Root
      ref={forwardedRef}
      className={cn(
        // base
        "relative flex cursor-pointer touch-none select-none",
        // orientation
        "data-[orientation='horizontal']:w-full data-[orientation='horizontal']:items-center",
        "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-fit data-[orientation='vertical']:justify-center",
        // disabled
        "data-[disabled]:pointer-events-none",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          // base
          "relative grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
          // orientation
          "data-[orientation='horizontal']:h-1.5 data-[orientation='horizontal']:w-full",
          "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            // base
            "absolute rounded-full bg-primary dark:bg-primary",
            // orientation
            "data-[orientation='horizontal']:h-full",
            "data-[orientation='vertical']:w-full",
            // disabled
            "data-[disabled]:bg-gray-300 dark:data-[disabled]:bg-gray-700",
          )}
        />
      </SliderPrimitive.Track>
      {value?.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            // base
            "block h-4 w-4 shrink-0 rounded-full border-2 shadow transition-colors",
            // border color
            "border-primary dark:border-primary",
            // background color
            "bg-background dark:bg-background",
            // hover
            "hover:border-primary/80",
            // disabled
            "data-[disabled]:pointer-events-none data-[disabled]:bg-gray-200 dark:data-[disabled]:border-gray-800 dark:data-[disabled]:bg-gray-600",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "outline-offset-0",
          )}
          aria-label={ariaLabelThumb}
        />
      ))}
    </SliderPrimitive.Root>
  )
})

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider } 