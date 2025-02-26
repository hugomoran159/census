import * as duckdb from '@duckdb/duckdb-wasm';

// We need to declare these types for the URL imports
declare global {
  interface ImportMeta {
    url: string;
  }
}

// This function initializes DuckDB and returns the database instance
export async function initDuckDB(): Promise<duckdb.AsyncDuckDB> {
  // We need to use a different approach for Next.js
  // First, we need to dynamically import the DuckDB module
  const duckdbModule = await import('@duckdb/duckdb-wasm');
  
  try {
    // Use the CDN bundles instead of direct imports
    const bundles: duckdb.DuckDBBundles = {
      mvp: {
        mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm',
        mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js',
      },
      eh: {
        mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-eh.wasm',
        mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js',
      },
    };
    
    // Select a bundle based on browser checks
    const bundle = await duckdbModule.selectBundle(bundles);
    
    // Instantiate the asynchronous version of DuckDB-Wasm
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdbModule.ConsoleLogger();
    const db = new duckdbModule.AsyncDuckDB(logger, worker);
    
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    console.log('DuckDB instantiated successfully');
    
    return db;
  } catch (error) {
    console.error('Failed to initialize DuckDB:', error);
    throw error;
  }
}

// Helper function to create a connection to the database
export async function createConnection(db: duckdb.AsyncDuckDB): Promise<duckdb.AsyncDuckDBConnection> {
  return await db.connect();
}

// Helper function to run a query and return the results
export async function runQuery(
  connection: duckdb.AsyncDuckDBConnection,
  query: string
): Promise<any[]> {
  try {
    const result = await connection.query(query);
    return result.toArray();
  } catch (error) {
    console.error('Error running query:', error);
    throw error;
  }
} 