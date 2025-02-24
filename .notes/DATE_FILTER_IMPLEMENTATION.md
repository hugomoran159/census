# Date Filter Implementation Plan

## Overview
Add a date range filter to the property sales map using deck.gl's DataFilterExtension, shadcn's slider component, and Framer Motion for animations.

## Components Structure

### 1. DateRangeFilter Component
- Container for the entire filter UI
- Manages date range state
- Dispatches filter updates to Redux store
- Layout with title, sliders, and date display

### 2. DateSlider Component
- Wrapper around shadcn slider
- Handles date conversion between timestamps and slider values
- Shows current date value
- Animated date display using Framer Motion

## Implementation Steps

### Phase 1: Basic Setup
1. Install required dependencies:
   ```bash
   npm install @deck.gl/extensions framer-motion
   npx shadcn@latest add slider
   ```

2. Create new Redux slice for filter state:
   - Add dateRange reducer
   - Add actions for updating date range
   - Connect to existing map state

### Phase 2: Date Filter Extension
1. Add DataFilterExtension to MVTLayer:
   - Convert sale dates to Unix timestamps
   - Configure filter size and range
   - Add getFilterValue accessor
   - Handle date range updates

2. Create utility functions:
   - Date conversion helpers
   - Range validation
   - Format display dates

### Phase 3: UI Components
1. Create DateRangeFilter component:
   ```tsx
   components/
   └── filters/
       ├── DateRangeFilter.tsx
       └── DateSlider.tsx
   ```

2. Implement DateSlider features:
   - Double slider for range selection
   - Date formatting and display
   - Framer Motion animations
   - Responsive layout

### Phase 4: Integration
1. Add filter components to MapView
2. Connect Redux state
3. Handle filter updates
4. Add loading states and error handling

## Technical Details

### Date Handling
- Convert all dates to Unix timestamps for filtering
- Use `filterRange` prop for date boundaries
- Handle timezone considerations
- Format display dates in Irish locale

### State Management
```typescript
interface FilterState {
  dateRange: {
    start: number;  // Unix timestamp
    end: number;    // Unix timestamp
  };
  enabled: boolean;
}
```

### DataFilterExtension Configuration
```typescript
new DataFilterExtension({
  filterSize: 1,
  fp64: true  // For precise timestamp handling
})
```

### Animation Specifications
- Smooth transitions for date display
- Slider thumb animations
- Loading state animations
- Error state handling

## UI/UX Considerations
1. Clear date range display
2. Intuitive slider interaction
3. Immediate visual feedback
4. Responsive design
5. Accessibility features

## Testing Strategy
1. Unit tests for date utilities
2. Component tests for sliders
3. Integration tests for filter behavior
4. Performance testing with large datasets

## Future Enhancements
1. Preset date ranges (Last month, Last year, etc.)
2. Custom date input option
3. Animation speed controls
4. Filter statistics display 