import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

// Define the possible types that SQLite can return
export type SqlValue = string | number | boolean | null | Uint8Array;

export interface QueryResult {
  columns: string[];
  values: SqlValue[][];
  rowsAffected?: number;
}

export interface QueryError {
  message: string;
  line?: number;
  column?: number;
}

class SQLiteManager {
  private SQL: SqlJsStatic | null = null;
  private databases: Map<string, Database> = new Map();

  async initialize(): Promise<void> {
    if (this.SQL) return;

    try {
      // Use local files served from public directory
      this.SQL = await initSqlJs({
        locateFile: (file) => {
          // Serve WASM files from the public directory
          return `/${file}`;
        }
      });
    } catch (error) {
      console.error('Failed to initialize SQL.js:', error);
      throw new Error('Failed to initialize SQLite engine');
    }
  }

  async createDatabase(id: string, data?: Uint8Array): Promise<Database> {
    await this.initialize();
    
    if (!this.SQL) {
      throw new Error('SQLite engine not initialized');
    }

    const db = new this.SQL.Database(data);
    this.databases.set(id, db);
    return db;
  }

  getDatabase(id: string): Database | null {
    return this.databases.get(id) || null;
  }

  async executeQuery(databaseId: string, query: string): Promise<QueryResult> {
    const db = this.getDatabase(databaseId);
    if (!db) {
      throw new Error('Database not found');
    }

    try {
      const stmt = db.prepare(query);
      let columns: string[] = [];
      const values: SqlValue[][] = [];

      // Execute the statement and get the first row to determine columns
      if (stmt.step()) {
        // Get column names from the statement
        columns = stmt.getColumnNames();
        
        // If getColumnNames() returns empty, try alternative method
        if (columns.length === 0) {
          // Use exec() method as fallback to get proper column info
          stmt.free();
          const execResult = db.exec(query);
          if (execResult.length > 0) {
            return {
              columns: execResult[0].columns,
              values: execResult[0].values
            };
          }
        } else {
          // Get the first row
          values.push(stmt.get());
          
          // Get remaining rows
          while (stmt.step()) {
            values.push(stmt.get());
          }
        }
      }

      stmt.free();
      return {
        columns,
        values
      };
    } catch (error: unknown) {
      const errorObj = error as Error & { line?: number; column?: number };
      throw {
        message: errorObj.message || 'Query execution failed',
        line: errorObj.line,
        column: errorObj.column
      } as QueryError;
    }
  }

  async executeMultipleQueries(databaseId: string, queries: string): Promise<QueryResult[]> {
    const db = this.getDatabase(databaseId);
    if (!db) {
      throw new Error('Database not found');
    }

    const results: QueryResult[] = [];
    
    try {
      // Split queries by semicolon and filter out empty ones
      const queryList = queries
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      for (const query of queryList) {
        const result = await this.executeQuery(databaseId, query);
        results.push(result);
      }

      return results;
    } catch (error: unknown) {
      const errorObj = error as Error & { line?: number; column?: number };
      throw {
        message: errorObj.message || 'Query execution failed',
        line: errorObj.line,
        column: errorObj.column
      } as QueryError;
    }
  }

  exportDatabase(databaseId: string): Uint8Array {
    const db = this.getDatabase(databaseId);
    if (!db) {
      throw new Error('Database not found');
    }

    return db.export();
  }

  closeDatabase(databaseId: string): void {
    const db = this.getDatabase(databaseId);
    if (db) {
      db.close();
      this.databases.delete(databaseId);
    }
  }

  closeAllDatabases(): void {
    for (const [id, db] of this.databases) {
      db.close();
    }
    this.databases.clear();
  }

  async getTableInfo(databaseId: string): Promise<{ name: string }[]> {
    const result = await this.executeQuery(
      databaseId,
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    return result.values.map(row => ({ name: row[0] as string }));
  }

  async getTableSchema(databaseId: string, tableName: string): Promise<{
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: SqlValue;
    pk: number;
  }[]> {
    const result = await this.executeQuery(
      databaseId,
      `PRAGMA table_info("${tableName}")`
    );
    return result.values.map(row => ({
      cid: row[0] as number,
      name: row[1] as string,
      type: row[2] as string,
      notnull: row[3] as number,
      dflt_value: row[4],
      pk: row[5] as number
    }));
  }
}

export const sqliteManager = new SQLiteManager();
