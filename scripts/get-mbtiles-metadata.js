const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const MBTILES_PATH = path.join(process.cwd(), 'public/vector_tiles_20250221_155454/property_sales.mbtiles');

const db = new sqlite3.Database(MBTILES_PATH, sqlite3.OPEN_READONLY);

db.each('SELECT name, value FROM metadata', (err, row) => {
  if (err) {
    console.error('Error reading metadata:', err);
    return;
  }
  console.log(`${row.name}: ${row.value}`);
});

db.close(); 