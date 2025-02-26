import { useState, useEffect } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { initDuckDB, createConnection, runQuery } from '../utils/duckdb';

interface UseDuckDBResult {
  db: duckdb.AsyncDuckDB | null;
  connection: duckdb.AsyncDuckDBConnection | null;
  loading: boolean;
  error: Error | null;
  executeQuery: (query: string) => Promise<any[]>;
}

export function useDuckDB(): UseDuckDBResult {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [connection, setConnection] = useState<duckdb.AsyncDuckDBConnection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setLoading(true);
        // Initialize DuckDB
        const duckDB = await initDuckDB();
        if (!isMounted) return;
        
        setDb(duckDB);
        
        // Create a connection
        const conn = await createConnection(duckDB);
        if (!isMounted) return;
        
        setConnection(conn);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing DuckDB:', err);
        if (!isMounted) return;
        
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      isMounted = false;
      // Close the connection and terminate the database when component unmounts
      if (connection) {
        connection.close();
      }
      if (db) {
        db.terminate();
      }
    };
  }, []);

  // Function to execute queries
  const executeQuery = async (query: string): Promise<any[]> => {
    if (!connection) {
      throw new Error('DuckDB connection not established');
    }
    
    try {
      return await runQuery(connection, query);
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    }
  };

  return { db, connection, loading, error, executeQuery };
} 