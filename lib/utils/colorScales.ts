import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';

// Define color scale options with proper type
export type ColorScaleKey = 'viridis' | 'inferno' | 'plasma' | 'magma' | 'primary';

export const COLOR_SCALES: Record<ColorScaleKey, [number, number, number, number][]> = {
  viridis: [
    [68, 1, 84, 255],   // Dark purple
    [59, 82, 139, 255], // Blue
    [33, 144, 141, 255], // Teal
    [93, 201, 99, 255], // Green
    [253, 231, 37, 255]  // Yellow
  ],
  inferno: [
    [0, 0, 4, 255],     // Black
    [87, 16, 110, 255], // Purple
    [187, 55, 84, 255], // Pink
    [249, 142, 9, 255], // Orange
    [252, 255, 164, 255] // Yellow
  ],
  plasma: [
    [13, 8, 135, 255],   // Dark blue
    [126, 3, 168, 255],  // Purple
    [204, 71, 120, 255], // Pink
    [248, 149, 64, 255], // Orange
    [240, 249, 33, 255]  // Yellow
  ],
  magma: [
    [0, 0, 4, 255],      // Black
    [81, 18, 124, 255],  // Purple
    [183, 55, 121, 255], // Pink
    [252, 137, 97, 255], // Orange
    [252, 253, 191, 255] // Light yellow
  ],
  // Use CSS variables for a custom theme
  primary: [
    [210, 16, 15, 255],  // Using --foreground (dark)
    [4, 90, 58, 255],    // Using --primary
    [4, 90, 65, 255],    // Using --accent
    [27, 87, 67, 255],   // Using --chart-4
    [173, 58, 39, 255]   // Using --chart-5
  ]
};

// Available properties for coloring
export const COLOR_PROPERTIES = [
  'Price (€)',
  'County',
  'Date of Sale (dd/mm/yyyy)'
];

// Function to get color based on value, property, and scale
export function getColorForValue(
  value: any, 
  min: number, 
  max: number, 
  colorScale: ColorScaleKey = 'viridis',
  property: string = 'Price (€)'
): [number, number, number, number] {
  // Default color for null/undefined values
  if (value === null || value === undefined) {
    return [128, 128, 128, 100]; // Semi-transparent gray
  }

  // Handle non-numeric properties
  if (property === 'County') {
    // Simple hash function for strings
    const stringValue = String(value);
    let hash = 0;
    
    // Simple hash calculation
    for (let i = 0; i < stringValue.length; i++) {
      hash = ((hash << 5) - hash) + stringValue.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    const normalizedHash = (Math.abs(hash) % 100) / 100;
    return interpolateColorScale(normalizedHash, COLOR_SCALES[colorScale]);
  }
  
  // Handle date properties
  if (property.includes('Date')) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return [128, 128, 128, 100]; // Invalid date
    }
    const normalizedDate = (date.getTime() - min) / (max - min);
    return interpolateColorScale(normalizedDate, COLOR_SCALES[colorScale]);
  }

  // Handle numeric properties (default)
  const normalizedValue = (Number(value) - min) / (max - min);
  return interpolateColorScale(normalizedValue, COLOR_SCALES[colorScale]);
}

// Helper function to interpolate between colors in a scale
function interpolateColorScale(
  normalizedValue: number, 
  colorScale: [number, number, number, number][]
): [number, number, number, number] {
  // Clamp value between 0 and 1
  const value = Math.max(0, Math.min(1, normalizedValue));
  
  // Create a scale function using d3
  const colorScaleFunc = scaleLinear<string>()
    .domain(colorScale.map((_, i) => i / (colorScale.length - 1)))
    .range(colorScale.map(color => `rgb(${color[0]}, ${color[1]}, ${color[2]})`));
  
  // Get the interpolated color
  const color = rgb(colorScaleFunc(value));
  
  // Return as RGBA array
  return [
    Math.round(color.r), 
    Math.round(color.g), 
    Math.round(color.b), 
    255
  ];
} 