import { useState, useEffect } from 'react'
import { tableFromIPC, Table } from 'apache-arrow'

// Define a type for the initialized module
interface GeoArrowModule {
  initialized: boolean
}

// This is a simplified hook for Arrow data
export function useGeoArrow(): GeoArrowModule {
  const [module, setModule] = useState<GeoArrowModule>({
    initialized: false
  })

  useEffect(() => {
    let isMounted = true

    async function initialize() {
      try {
        if (isMounted) {
          setModule({
            initialized: true
          })
        }
      } catch (error) {
        console.error('Failed to initialize GeoArrow:', error)
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [])

  return module
}

// Helper function to load an Arrow file
export async function loadArrowFile(url: string): Promise<Table | null> {
  try {
    console.log('Fetching Arrow file from:', url)
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    console.log('Arrow file fetched, size:', uint8Array.byteLength)
    
    try {
      // Convert directly to Arrow Table
      const table = tableFromIPC(uint8Array)
      console.log('Successfully converted to Table')
      
      // Verify the table has the expected methods
      if (typeof table.getChild === 'function') {
        console.log('Table has getChild method, conversion successful')
      } else {
        console.warn('Table does not have getChild method, may not be fully compatible')
      }
      
      return table
    } catch (error) {
      console.error('Error processing Arrow data:', error)
      return null
    }
  } catch (error) {
    console.error('Error loading Arrow file:', error)
    return null
  }
} 