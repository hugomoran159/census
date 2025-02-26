/**
 * Data Source Registry
 * 
 * This module defines the structure for geospatial data sources and their
 * visualization layers. Each data source can have multiple layer types
 * for different visualization purposes.
 */

/**
 * Types of visualization layers supported by the system
 */
export type LayerType = 'scatterplot' | 'path' | 'line' | 'polygon' | 'heatmap' | 'hexagon';

/**
 * Configuration for a visualization layer
 */
export interface LayerConfig {
  type: LayerType;
  geometryColumn: string;
  title: string;
  description?: string;
  defaultEnabled?: boolean;
  visualDefaults: {
    color?: [number, number, number, number];
    opacity?: number;
    radius?: number;
    lineWidth?: number;
    // Other visualization defaults specific to layer type
    [key: string]: any;
  };
}

/**
 * Definition of a geospatial data source
 */
export interface GeoDataSource {
  id: string;
  name: string;
  description: string;
  url: string;
  format: 'geoparquet' | 'parquet' | 'flatgeobuf';
  defaultQuery?: string;
  layers: LayerConfig[];
  metadata: {
    spatialExtent?: [number, number, number, number]; // [minX, minY, maxX, maxY]
    temporalExtent?: [string, string]; // ISO date strings
    attributeSchema: Record<string, string>; // column name -> data type
    tags: string[];
    category: string;
    attribution?: {
      text: string;
      url?: string;
      license?: string;
    };
  };
}

/**
 * Registry of available data sources
 */
export const dataSources: GeoDataSource[] = [
  {
    id: 'property-sales',
    name: 'Property Sales',
    description: 'Residential property sales in Ireland',
    url: 'https://example.com/data/property_sales.parquet',
    format: 'geoparquet',
    defaultQuery: 'SELECT * FROM input LIMIT 1000',
    layers: [
      {
        type: 'scatterplot',
        geometryColumn: 'geometry',
        title: 'Property Points',
        description: 'Individual property locations',
        defaultEnabled: true,
        visualDefaults: {
          color: [255, 0, 0, 255],
          radius: 5,
          opacity: 0.8
        }
      },
      {
        type: 'heatmap',
        geometryColumn: 'geometry',
        title: 'Property Density',
        description: 'Heat map showing property density',
        visualDefaults: {
          intensity: 1,
          threshold: 0.05,
          radiusPixels: 30
        }
      }
    ],
    metadata: {
      spatialExtent: [-10.5, 51.4, -6.0, 55.4], // Ireland approx bounds
      temporalExtent: ['2020-01-01', '2023-12-31'],
      attributeSchema: {
        price: 'DECIMAL',
        date: 'DATE',
        property_type: 'VARCHAR',
        bedrooms: 'INTEGER',
        geometry: 'GEOMETRY'
      },
      tags: ['property', 'sales', 'residential'],
      category: 'real-estate',
      attribution: {
        text: 'Property Price Register Ireland',
        url: 'https://www.propertypriceregister.ie/',
        license: 'Open Data'
      }
    }
  },
  {
    id: 'census-data',
    name: 'Census Data',
    description: 'Irish census data by electoral division',
    url: 'https://example.com/data/census.parquet',
    format: 'geoparquet',
    layers: [
      {
        type: 'polygon',
        geometryColumn: 'geometry',
        title: 'Population Density',
        description: 'Population density by electoral division',
        defaultEnabled: true,
        visualDefaults: {
          color: [0, 128, 255, 200],
          opacity: 0.7,
          lineWidth: 1
        }
      },
      {
        type: 'scatterplot',
        geometryColumn: 'centroid',
        title: 'Population Centers',
        description: 'Population centers by electoral division',
        visualDefaults: {
          color: [0, 0, 255, 255],
          radius: 10,
          opacity: 0.8
        }
      }
    ],
    metadata: {
      spatialExtent: [-10.5, 51.4, -6.0, 55.4], // Ireland approx bounds
      temporalExtent: ['2016-01-01', '2016-12-31'],
      attributeSchema: {
        ed_id: 'VARCHAR',
        population: 'INTEGER',
        households: 'INTEGER',
        avg_age: 'DECIMAL',
        geometry: 'GEOMETRY',
        centroid: 'GEOMETRY'
      },
      tags: ['census', 'demographics', 'population'],
      category: 'demographics',
      attribution: {
        text: 'Central Statistics Office Ireland',
        url: 'https://www.cso.ie/',
        license: 'CC-BY 4.0'
      }
    }
  }
];

/**
 * Get a data source by ID
 */
export function getDataSource(id: string): GeoDataSource | undefined {
  return dataSources.find(ds => ds.id === id);
}

/**
 * Get all data sources by category
 */
export function getDataSourcesByCategory(category: string): GeoDataSource[] {
  return dataSources.filter(ds => ds.metadata.category === category);
}

/**
 * Get all data sources by tag
 */
export function getDataSourcesByTag(tag: string): GeoDataSource[] {
  return dataSources.filter(ds => ds.metadata.tags.includes(tag));
} 