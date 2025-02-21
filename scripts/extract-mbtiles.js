const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { mkdirp } = require('mkdirp');
const zlib = require('zlib');

const MBTILES_PATH = path.join(process.cwd(), 'public/vector_tiles_20250221_155454/property_sales.mbtiles');
const OUTPUT_DIR = path.join(process.cwd(), 'public/vector_tiles_20250221_155454/property_sales');

async function extractTiles() {
  // Create output directory
  await mkdirp(OUTPUT_DIR);

  // Open MBTiles database
  const db = new sqlite3.Database(MBTILES_PATH, sqlite3.OPEN_READONLY);

  // Get metadata to check compression
  let isGzipped = false;
  await new Promise((resolve, reject) => {
    db.get('SELECT value FROM metadata WHERE name = "format"', (err, row) => {
      if (err) reject(err);
      isGzipped = row?.value === 'pbf.gz' || row?.value === 'gzip';
      resolve();
    });
  });

  console.log(`Tile format: ${isGzipped ? 'gzipped' : 'uncompressed'}`);

  // Get tiles
  db.each('SELECT zoom_level, tile_column, tile_row, tile_data FROM tiles', async (err, row) => {
    if (err) {
      console.error('Error reading tile:', err);
      return;
    }

    try {
      // Convert TMS tile coordinates to XYZ (flip Y coordinate)
      const y = Math.pow(2, row.zoom_level) - 1 - row.tile_row;
      
      // Create zoom/x directory
      const tileDir = path.join(OUTPUT_DIR, row.zoom_level.toString(), row.tile_column.toString());
      await mkdirp(tileDir);

      // Check if data is gzipped by looking at magic numbers
      const isGzippedTile = row.tile_data[0] === 0x1f && row.tile_data[1] === 0x8b;
      
      // Decompress if needed
      let tileData = row.tile_data;
      if (isGzippedTile || isGzipped) {
        try {
          tileData = zlib.gunzipSync(row.tile_data);
        } catch (e) {
          console.error(`Error decompressing tile ${row.zoom_level}/${row.tile_column}/${y}:`, e);
          return;
        }
      }

      // Write tile file
      const tilePath = path.join(tileDir, `${y}.pbf`);
      fs.writeFileSync(tilePath, tileData);
    } catch (error) {
      console.error(`Error processing tile ${row.zoom_level}/${row.tile_column}/${row.tile_row}:`, error);
    }
  }, (err, count) => {
    if (err) {
      console.error('Error processing tiles:', err);
    } else {
      console.log(`Successfully extracted ${count} tiles`);
    }
    db.close();
  });
}

extractTiles().catch(console.error); 