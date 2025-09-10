'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type * as monaco from 'monaco-editor';
import { indexedDBManager } from '@/lib/indexeddb';
import { sqliteManager, QueryResult, SqlValue } from '@/lib/sqlite';
import {
  ColumnDef,
  CellContext,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

interface TableInfo {
  name: string;
}

interface TableSchema {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: SqlValue;
  pk: number;
}

export const useSQLPlayground = (databaseId: string, databaseName: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(() => searchParams.get('table') || null);
  const [tableSchema, setTableSchema] = useState<TableSchema[]>([]);
  const [tableData, setTableData] = useState<QueryResult | null>(null);
  const [viewMode, setViewMode] = useState<'query' | 'table'>(() => 
    (searchParams.get('view') as 'query' | 'table') || 'query'
  );
  const [editorTheme, setEditorTheme] = useState<'vs-light' | 'vs-dark' | 'hc-black' | 'github-dark'>(() =>
    (searchParams.get('theme') as 'vs-light' | 'vs-dark' | 'hc-black' | 'github-dark') || 'github-dark'
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const executeQueryRef = useRef<(() => void) | null>(null);

  // Function to update URL with current state
  const updateURL = useCallback((updates: {
    query?: string;
    table?: string | null;
    view?: 'query' | 'table';
    theme?: 'vs-light' | 'vs-dark' | 'hc-black' | 'github-dark';
  }) => {
    const params = new URLSearchParams(searchParams);
    
    // Always keep the database ID
    params.set('db', databaseId);
    
    // Update query if provided and not empty
    if (updates.query !== undefined) {
      if (updates.query.trim()) {
        params.set('q', updates.query.trim());
      } else {
        params.delete('q');
      }
    }
    
    // Update table if provided
    if (updates.table !== undefined) {
      if (updates.table) {
        params.set('table', updates.table);
      } else {
        params.delete('table');
      }
    }
    
    // Update view mode if provided
    if (updates.view !== undefined) {
      if (updates.view !== 'query') {
        params.set('view', updates.view);
      } else {
        params.delete('view');
      }
    }
    
    // Update theme if provided and not default
    if (updates.theme !== undefined) {
      if (updates.theme !== 'github-dark') {
        params.set('theme', updates.theme);
      } else {
        params.delete('theme');
      }
    }
    
    const newURL = `/playground?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  }, [searchParams, databaseId, router]);

  // Wrapper functions that update both state and URL
  const setQueryWithURL = useCallback((newQuery: string) => {
    setQuery(newQuery);
    updateURL({ query: newQuery });
  }, [updateURL]);

  const setSelectedTableWithURL = useCallback((tableName: string | null) => {
    setSelectedTable(tableName);
    updateURL({ table: tableName });
  }, [updateURL]);

  const setViewModeWithURL = useCallback((mode: 'query' | 'table') => {
    setViewMode(mode);
    updateURL({ view: mode });
  }, [updateURL]);

  const setEditorThemeWithURL = useCallback((theme: 'vs-light' | 'vs-dark' | 'hc-black' | 'github-dark') => {
    setEditorTheme(theme);
    updateURL({ theme });
  }, [updateURL]);

  const loadTableSchema = useCallback(async (tableName: string) => {
    try {
      const schema = await sqliteManager.getTableSchema(databaseId, tableName);
      setTableSchema(schema);
      setSelectedTable(tableName);
      updateURL({ table: tableName });
    } catch (error: unknown) {
      console.error('Failed to load table schema:', error);
    }
  }, [databaseId, updateURL]);

  const loadTableData = useCallback(async (tableName: string) => {
    try {
      const result = await sqliteManager.executeQuery(databaseId, `SELECT * FROM "${tableName}" LIMIT 1000`);
      setTableData(result);
      setSelectedTable(tableName);
      setViewMode('table');
      setPagination({ pageIndex: 0, pageSize: 10 });
      
      // Update URL with table and view mode
      updateURL({ table: tableName, view: 'table' });
    } catch (error: unknown) {
      console.error('Failed to load table data:', error);
      setError('Failed to load table data');
    }
  }, [databaseId, updateURL]);

  const executeQuery = useCallback(async () => {
    if (!query.trim()) {
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResults([]);

    try {
      const queryResults = await sqliteManager.executeMultipleQueries(databaseId, query);
      setResults(queryResults);

      const data = sqliteManager.exportDatabase(databaseId);
      await indexedDBManager.saveDatabase(databaseId, databaseName, data);

      const modifyingKeywords = ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
      const isModifyingQuery = modifyingKeywords.some(keyword => 
        query.toUpperCase().includes(keyword)
      );

      // Load tables
      try {
        const tableList = await sqliteManager.getTableInfo(databaseId);
        setTables(tableList);
      } catch (error: unknown) {
        console.error('Failed to load tables:', error);
      }

      if (isModifyingQuery && selectedTable && tableData) {
        await loadTableData(selectedTable);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Query execution failed';
      setError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  }, [query, databaseId, databaseName, selectedTable, tableData, loadTableData]);

  // Update the ref whenever executeQuery changes
  useEffect(() => {
    executeQueryRef.current = executeQuery;
  }, [executeQuery]);

  const insertSampleQuery = (queryType: string) => {
    let sampleQuery = '';
    
    switch (queryType) {
      case 'create_table':
        sampleQuery = `CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;
        break;
      case 'insert_data':
        sampleQuery = `INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com');`;
        break;
      case 'select_data':
        sampleQuery = `SELECT * FROM users 
WHERE created_at >= date('now', '-7 days') 
ORDER BY created_at DESC;`;
        break;
      case 'update_data':
        sampleQuery = `UPDATE users 
SET email = 'newemail@example.com' 
WHERE name = 'John Doe';`;
        break;
      case 'delete_data':
        sampleQuery = `DELETE FROM users 
WHERE created_at < date('now', '-30 days');`;
        break;
    }
    
    setQuery(sampleQuery);
    editorRef.current?.focus();
  };

  const exportDatabase = () => {
    try {
      const data = sqliteManager.exportDatabase(databaseId);
      const buffer = new ArrayBuffer(data.length);
      const view = new Uint8Array(buffer);
      view.set(data);
      const blob = new Blob([buffer], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${databaseName}.sqlite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('Failed to export database:', error);
      alert('Failed to export database');
    }
  };

  const handleEditorMount = async (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Try multiple approaches to ensure the keyboard shortcut works
    
    // Approach 1: Using addAction
    editor.addAction({
      id: 'execute-query',
      label: 'Execute Query',
      keybindings: [
        (await import('monaco-editor')).KeyMod.CtrlCmd | (await import('monaco-editor')).KeyCode.Enter
      ],
      run: () => {
        executeQueryFromShortcut(editor);
      }
    });
    
    // Approach 2: Using addCommand as backup
    const monaco = await import('monaco-editor');
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      executeQueryFromShortcut(editor);
    });
    
    // Approach 3: Using DOM event listener as final fallback
    const editorElement = editor.getDomNode();
    if (editorElement) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          console.log('🚀 Cmd+Enter via DOM event triggered!');
          executeQueryFromShortcut(editor);
        }
      };
      
      editorElement.addEventListener('keydown', handleKeyDown);
      
      // Store cleanup function
      editor.onDidDispose(() => {
        editorElement.removeEventListener('keydown', handleKeyDown);
      });
    }
  };
  
  const executeQueryFromShortcut = (editor: monaco.editor.IStandaloneCodeEditor) => {
    const currentQuery = editor.getValue();
    
    if (!currentQuery.trim()) {
      return;
    }
    
    // Use the ref to get the latest executeQuery function
    if (executeQueryRef.current) {
      executeQueryRef.current();
    }
  };

  // Function to generate DELETE query for a specific row
  const generateDeleteQuery = useCallback((row: Record<string, SqlValue>) => {
    if (!selectedTable || !tableData?.columns) return '';
    
    // Create WHERE clause based on all column values to ensure precise deletion
    const whereConditions = tableData.columns
      .map(column => {
        const value = row[column];
        if (value === null || value === undefined) {
          return `"${column}" IS NULL`;
        }
        if (typeof value === 'string') {
          // Escape single quotes in strings
          const escapedValue = value.replace(/'/g, "''");
          return `"${column}" = '${escapedValue}'`;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
          return `"${column}" = ${value}`;
        }
        // For other types, convert to string and treat as string
        const escapedValue = String(value).replace(/'/g, "''");
        return `"${column}" = '${escapedValue}'`;
      })
      .join(' AND ');
    
    return `DELETE FROM "${selectedTable}" WHERE ${whereConditions};`;
  }, [selectedTable, tableData]);

  // Function to handle delete button click
  const handleDeleteRow = useCallback((row: Record<string, SqlValue>) => {
    const deleteQuery = generateDeleteQuery(row);
    if (deleteQuery) {
      // Switch to query view and set the DELETE query in the editor
      updateURL({ 
        query: deleteQuery, 
        view: 'query',
        table: null // Clear table selection to focus on query
      });
      setQuery(deleteQuery);
      setViewMode('query');
    }
  }, [generateDeleteQuery, updateURL]);

  // Create dynamic columns for table data
  const tableColumns = useMemo<ColumnDef<Record<string, SqlValue>>[]>(() => {
    if (!tableData || !tableData.columns || !tableData.columns.length) {
      return [];
    }
    
    const columns: ColumnDef<Record<string, SqlValue>>[] = tableData.columns.map((column) => ({
      accessorKey: column,
      header: column,
      cell: (info: CellContext<Record<string, SqlValue>, SqlValue>) => {
        const value = info.getValue();
        if (value === null || value === undefined) {
          return 'NULL';
        }
        if (typeof value === 'boolean') {
          return value ? 'true' : 'false';
        }
        if (typeof value === 'number') {
          return value.toString();
        }
        return String(value);
      },
      size: Math.max(100, Math.min(200, column.length * 10)),
      enableSorting: true,
      meta: {
        headerClassName: 'font-semibold bg-gray-50',
        cellClassName: 'text-sm',
      },
    } as ColumnDef<Record<string, SqlValue>>));
    
    return columns;
  }, [tableData]);

  // Convert table data to format expected by react-table
  const tableRows = useMemo(() => {
    if (!tableData) {
      return [];
    }
    
    // Handle empty table case (no columns means empty table, which is valid)
    if (!tableData.columns || !Array.isArray(tableData.columns) || tableData.columns.length === 0) {
      return [];
    }
    
    if (!tableData.values || !Array.isArray(tableData.values)) {
      console.error('Invalid values in tableData:', tableData.values);
      return [];
    }
    
    const rows = tableData.values.map((row, rowIndex) => {
      const rowData: Record<string, SqlValue> = {};
      
      tableData.columns.forEach((column, colIndex) => {
        if (colIndex < row.length) {
          rowData[column] = row[colIndex];
        }
      });
      rowData._id = String(rowIndex);
      return rowData;
    });
    
    return rows;
  }, [tableData]);

  const table = useReactTable({
    columns: tableColumns,
    data: tableRows,
    pageCount: Math.ceil((tableRows?.length || 0) / pagination.pageSize),
    getRowId: (row) => row._id as string,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const storedDb = await indexedDBManager.getDatabase(databaseId);
        if (!storedDb) {
          throw new Error('Database not found');
        }

        await sqliteManager.createDatabase(databaseId, storedDb.data);
        
        // Load tables
        try {
          const tableList = await sqliteManager.getTableInfo(databaseId);
          setTables(tableList);
          
          // If there's a table in URL params and view mode is table, load the table data
          const urlTable = searchParams.get('table');
          const urlView = searchParams.get('view');
          
          if (urlTable && urlView === 'table') {
            // Load table data for the specified table
            try {
              const result = await sqliteManager.executeQuery(databaseId, `SELECT * FROM "${urlTable}" LIMIT 1000`);
              setTableData(result);
              setPagination({ pageIndex: 0, pageSize: 10 });
            } catch (error: unknown) {
              console.error('Failed to load table data from URL:', error);
            }
          }
          
          // If there's a table in URL params, load its schema
          if (urlTable) {
            try {
              const schema = await sqliteManager.getTableSchema(databaseId, urlTable);
              setTableSchema(schema);
            } catch (error: unknown) {
              console.error('Failed to load table schema from URL:', error);
            }
          }
        } catch (error: unknown) {
          console.error('Failed to load tables:', error);
        }
      } catch (error: unknown) {
        console.error('Failed to load database:', error);
        setError('Failed to load database');
      }
    };

    initializeDatabase();
    
    return () => {
      sqliteManager.closeDatabase(databaseId);
    };
  }, [databaseId, searchParams]);

  return {
    // State
    query,
    results,
    error,
    isExecuting,
    tables,
    selectedTable,
    tableSchema,
    tableData,
    viewMode,
    editorTheme,
    tableColumns,
    tableRows,
    table,
    
    // Actions
    setQuery: setQueryWithURL,
    setSelectedTable: setSelectedTableWithURL,
    setViewMode: setViewModeWithURL,
    setEditorTheme: setEditorThemeWithURL,
    executeQuery,
    loadTableSchema,
    loadTableData,
    insertSampleQuery,
    exportDatabase,
    handleEditorMount,
    handleDeleteRow,
  };
};
