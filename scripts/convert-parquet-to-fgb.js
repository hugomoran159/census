const { load } = require('@loaders.gl/core');
const { ParquetLoader } = require('@loaders.gl/parquet');
const { geojson } = require('flatgeobuf');
const fs = require('fs');
const path = require('path');

async function convertToFlatGeobuf() {
  try {
    // Load Parquet file
    const parquetData = await load('public/static/property_sales_20250221_123605.parquet', ParquetLoader);
    
    // Convert to GeoJSON features
    const features = parquetData.data
      .filter(row => {
        const lon = Number(row.longitude);
        const lat = Number(row.latitude);
        return !isNaN(lon) && !isNaN(lat) && 
               lon >= -11 && lon <= -5 && 
               lat >= 51 && lat <= 56;
      })
      .map(row => ({
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

    const featureCollection = {
      type: 'FeatureCollection',
      features
    };

    // Convert to FlatGeobuf
    const fgb = await geojson.serialize(featureCollection);
    
    // Save to file
    fs.writeFileSync(
      path.join(process.cwd(), 'public/static/property_sales.fgb'),
      Buffer.from(fgb)
    );
    console.log('Successfully converted to FlatGeobuf');

  } catch (error) {
    console.error('Error converting to FlatGeobuf:', error);
  }
}

convertToFlatGeobuf(); 