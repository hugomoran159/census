import duckdb
import json
import os
import subprocess
from datetime import datetime

# Connect to DuckDB
con = duckdb.connect()

# Read Parquet file and convert to GeoJSON format
query = '''
WITH raw_data AS (
    SELECT *,
        CAST(REPLACE(REPLACE("Price (€)", '€', ''), ',', '') AS DECIMAL(15,2)) as price_decimal
    FROM 'property_sales.parquet'
),
validated_data AS (
    SELECT *,
        CASE 
            WHEN "Date of Sale (dd/mm/yyyy)" IS NULL THEN 0
            WHEN TRY_STRPTIME("Date of Sale (dd/mm/yyyy)", '%d/%m/%Y') IS NULL THEN 0
            -- Accept dates between 2010 and 2030
            WHEN EXTRACT(YEAR FROM TRY_STRPTIME("Date of Sale (dd/mm/yyyy)", '%d/%m/%Y')) < 2010 THEN 0
            WHEN EXTRACT(YEAR FROM TRY_STRPTIME("Date of Sale (dd/mm/yyyy)", '%d/%m/%Y')) > 2030 THEN 0
            ELSE 1
        END as is_valid_date
    FROM raw_data
),
processed_data AS (
    SELECT 
        *,
        "Date of Sale (dd/mm/yyyy)" as sale_date
    FROM validated_data
    WHERE "Longitude" IS NOT NULL 
    AND "Latitude" IS NOT NULL
    -- Ensure coordinates are within Ireland's bounds
    AND "Longitude" BETWEEN -10.5 AND -5.5
    AND "Latitude" BETWEEN 51.4 AND 55.4
    -- Ensure date is valid
    AND is_valid_date = 1
    -- Ensure price is valid
    AND price_decimal > 0
)
SELECT 
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE is_valid_date = 0) as invalid_dates,
    MIN("Date of Sale (dd/mm/yyyy)") as min_date,
    MAX("Date of Sale (dd/mm/yyyy)") as max_date,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM TRY_STRPTIME("Date of Sale (dd/mm/yyyy)", '%d/%m/%Y')) > 2025) as future_dates
FROM validated_data;
'''

# Print data validation results
validation_results = con.execute(query).fetchone()
print("\nData Validation Results:")
print(f"Total records: {validation_results[0]}")
print(f"Invalid dates: {validation_results[1]}")
print(f"Date range: {validation_results[2]} to {validation_results[3]}")
print(f"Dates past 2025: {validation_results[4]}")

# Now proceed with the GeoJSON conversion
query = '''
WITH processed_data AS (
    SELECT 
        *,
        CAST(REPLACE(REPLACE("Price (€)", '€', ''), ',', '') AS DECIMAL(15,2)) as price_decimal,
        "Date of Sale (dd/mm/yyyy)" as sale_date
    FROM 'property_sales.parquet'
    WHERE "Longitude" IS NOT NULL 
    AND "Latitude" IS NOT NULL
    AND "Longitude" BETWEEN -10.5 AND -5.5
    AND "Latitude" BETWEEN 51.4 AND 55.4
    AND TRY_STRPTIME("Date of Sale (dd/mm/yyyy)", '%d/%m/%Y') IS NOT NULL
    -- Accept dates between 2010 and 2030
    AND EXTRACT(YEAR FROM TRY_STRPTIME("Date of Sale (dd/mm/yyyy)", '%d/%m/%Y')) BETWEEN 2010 AND 2030
    AND CAST(REPLACE(REPLACE("Price (€)", '€', ''), ',', '') AS DECIMAL(15,2)) > 0
)
SELECT json_object(
    'type', 'Feature',
    'geometry', json_object(
        'type', 'Point',
        'coordinates', [
            ROUND(CAST("Longitude" AS DOUBLE), 6),
            ROUND(CAST("Latitude" AS DOUBLE), 6)
        ]
    ),
    'properties', json_object(
        'county', "County",
        'date', sale_date,
        'type', "Description of Property",
        'price', price_decimal,
        'size', "Property Size Description",
        'address', formatted_address
    )
) as feature
FROM processed_data
ORDER BY TRY_STRPTIME(sale_date, '%d/%m/%Y');
'''

# Execute query and write to GeoJSON
features = con.execute(query).fetchall()
geojson = {
    'type': 'FeatureCollection',
    'features': [json.loads(row[0]) for row in features]
}

# Additional validation of the GeoJSON data
print("\nGeoJSON Validation:")
invalid_features = []
for i, feature in enumerate(geojson['features']):
    props = feature['properties']
    if not props.get('date'):
        invalid_features.append(f"Feature {i}: Missing date")
    try:
        date = datetime.strptime(props['date'], '%d/%m/%Y')
        year = date.year
        if year < 2010 or year > 2030:
            invalid_features.append(f"Feature {i}: Date out of range - {props['date']} (year: {year})")
    except (ValueError, TypeError):
        invalid_features.append(f"Feature {i}: Invalid date format - {props.get('date')}")

if invalid_features:
    print("Found invalid features:")
    for error in invalid_features[:10]:  # Show first 10 errors
        print(error)
    if len(invalid_features) > 10:
        print(f"...and {len(invalid_features) - 10} more errors")
else:
    print("All features have valid dates")

# Write GeoJSON to file
with open('property_sales.geojson', 'w') as f:
    json.dump(geojson, f)

print('\nGeoJSON conversion complete!')

# Debug: Check if GeoJSON file exists and print its size
if os.path.exists('property_sales.geojson'):
    file_size = os.path.getsize('property_sales.geojson')
    print(f'GeoJSON file size: {file_size / (1024*1024):.2f} MB')
    
    # Print statistics
    total_features = len(geojson['features'])
    print(f'\nTotal features: {total_features}')
    
    # Count by county and year
    counties = {}
    years = {}
    for f in geojson['features']:
        county = f['properties']['county']
        date = datetime.strptime(f['properties']['date'], '%d/%m/%Y')
        year = date.year
        
        counties[county] = counties.get(county, 0) + 1
        years[year] = years.get(year, 0) + 1
    
    print('\nFeatures by county:')
    for county, count in sorted(counties.items()):
        print(f'{county}: {count}')
        
    print('\nFeatures by year:')
    for year, count in sorted(years.items()):
        print(f'{year}: {count}')

    # Print sample feature
    if geojson['features']:
        print('\nSample feature:')
        print(json.dumps(geojson['features'][0], indent=2))
else:
    print('Error: GeoJSON file not created!')
    exit(1)

# Generate MBTiles file with optimized settings
tippecanoe_cmd = [
    'tippecanoe',
    '-o', 'property_sales.mbtiles',
    '-zg',  # Automatically choose zoom levels
    '-l', 'property_sales',
    '--drop-densest-as-needed',
    '--extend-zooms-if-still-dropping',
    '--force',
    '--minimum-zoom=4',
    '--maximum-zoom=14',
    '--cluster-distance=50',
    '--simplification=10',
    '--accumulate-attribute=price:sum',  # Aggregate prices in clusters
    '--accumulate-attribute=date:comma',  # Keep dates in clusters using comma separation
    '--maximum-tile-bytes=5000000',  # Limit tile size to 5MB
    '--no-tile-size-limit',  # Allow large tiles when necessary
    '--no-feature-limit',  # Remove feature limit per tile
    '--no-line-simplification',  # Since we only have points
    '--no-tiny-polygon-reduction',  # Since we only have points
    '--read-parallel',  # Use multiple cores for reading
    '--use-attribute-for-id=date',  # Use date as feature ID to help with clustering
    'property_sales.geojson'
]

print('\nGenerating MBTiles file...')
print(f'Running command: {" ".join(tippecanoe_cmd)}')

try:
    result = subprocess.run(tippecanoe_cmd, check=True, capture_output=True, text=True)
    print('Tippecanoe output:', result.stdout)
    if result.stderr:
        print('Tippecanoe errors:', result.stderr)
    print('MBTiles file created successfully!')
    
except subprocess.CalledProcessError as e:
    print('Error running tippecanoe:')
    print(f'Exit code: {e.returncode}')
    print(f'stdout: {e.stdout}')
    print(f'stderr: {e.stderr}')
    exit(1) 