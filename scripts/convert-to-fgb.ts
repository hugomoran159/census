import { load } from '@loaders.gl/core';
import { ParquetLoader } from '@loaders.gl/parquet';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { geojson } from 'flatgeobuf';
import type { Feature, FeatureCollection, Point } from 'geojson';

interface PropertySale {
  price: number;
  address: string;
}

async function convertToFlatGeobuf() {
  try {
    const filePath = join(process.cwd(), 'public/static/property_sales_20250221_123605.parquet');
    const fileUrl = `file://${filePath}`;

    // Load Parquet file
    const parquetData = await load(fileUrl, ParquetLoader) as any;
    
    // Convert to GeoJSON features
    const features: Feature<Point, PropertySale>[] = parquetData.data
      .filter((row: any) => {
        const lon = Number(row.longitude);
        const lat = Number(row.latitude);
        return !isNaN(lon) && !isNaN(lat) && 
               lon >= -11 && lon <= -5 && 
               lat >= 51 && lat <= 56;
      })
      .map((row: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(row.longitude), Number(row.latitude)]
        },
        properties: {
          price: Number(row.price) || 0,
          address: row.address || ''
        }
      }));

    const featureCollection: FeatureCollection<Point, PropertySale> = {
      type: 'FeatureCollection',
      features
    };

    // Convert to FlatGeobuf
    const fgb = await geojson.serialize(featureCollection);
    
    // Save to file
    writeFileSync(
      join(process.cwd(), 'public/static/property_sales.fgb'),
      Buffer.from(fgb)
    );
    console.log('Successfully converted to FlatGeobuf');

  } catch (error) {
    console.error('Error converting to FlatGeobuf:', error);
  }
}

convertToFlatGeobuf(); 