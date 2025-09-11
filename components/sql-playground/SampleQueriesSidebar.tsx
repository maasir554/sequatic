'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Code, ChevronDown, ChevronRight } from 'lucide-react';
import { SqlValue } from '@/lib/sqlite';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TableSchema {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: SqlValue;
  pk: number;
}

interface SampleQueriesSidebarProps {
  selectedTable: string | null;
  tableSchema: TableSchema[];
  onInsertSampleQuery: (query: string) => void;
}

export const SampleQueriesSidebar = ({ selectedTable, tableSchema, onInsertSampleQuery }: SampleQueriesSidebarProps) => {
  const [isQueriesOpen, setIsQueriesOpen] = useState(true);
  
  // Helper function to generate appropriate placeholder values based on column type
  const getPlaceholderValue = (column: TableSchema) => {
    const type = column.type.toUpperCase();
    
    if (type.includes('INT') || type.includes('NUMERIC') || type.includes('REAL') || type.includes('FLOAT') || type.includes('DOUBLE')) {
      return '999';
    }
    if (type.includes('TEXT') || type.includes('VARCHAR') || type.includes('CHAR')) {
      return "'value'";
    }
    if (type.includes('BOOL')) {
      return 'true';
    }
    if (type.includes('DATE')) {
      return "'2024-01-01'";
    }
    if (type.includes('TIME')) {
      return "'12:00:00'";
    }
    // Default to string for unknown types
    return "'value'";
  };

  // Generate CREATE TABLE query
  const generateCreateTableQuery = () => {
    if (!selectedTable || tableSchema.length === 0) {
      return `CREATE TABLE new_table (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`;
    }

    const columns = tableSchema.map(column => {
      let columnDef = `  ${column.name} ${column.type}`;
      
      if (column.pk === 1) {
        columnDef += ' PRIMARY KEY';
      }
      if (column.notnull === 1 && column.pk !== 1) {
        columnDef += ' NOT NULL';
      }
      if (column.dflt_value !== null) {
        columnDef += ` DEFAULT ${column.dflt_value}`;
      }
      
      return columnDef;
    }).join(',\n');

    return `CREATE TABLE ${selectedTable}_copy (\n${columns}\n);`;
  };

  // Generate INSERT query
  const generateInsertQuery = () => {
    if (!selectedTable || tableSchema.length === 0) {
      return `INSERT INTO table_name (column1, column2) VALUES ('value', 999);`;
    }

    // Filter out primary key columns since they're usually auto-generated
    const nonPkColumns = tableSchema.filter(col => col.pk !== 1);
    
    // If all columns are primary keys (edge case), include them
    const columnsToUse = nonPkColumns.length > 0 ? nonPkColumns : tableSchema;
    
    const columns = columnsToUse.map(col => col.name).join(', ');
    const values = columnsToUse.map(col => getPlaceholderValue(col)).join(', ');

    return `INSERT INTO ${selectedTable} (${columns}) VALUES (${values});`;
  };

  // Generate SELECT query
  const generateSelectQuery = () => {
    if (!selectedTable || tableSchema.length === 0) {
      return `SELECT * FROM table_name WHERE condition = 'value';`;
    }

    const firstColumn = tableSchema[0];
    return `SELECT * FROM ${selectedTable} WHERE ${firstColumn.name} = ${getPlaceholderValue(firstColumn)};`;
  };

  // Generate UPDATE query
  const generateUpdateQuery = () => {
    if (!selectedTable || tableSchema.length === 0) {
      return `UPDATE table_name SET column1 = 'new_value' WHERE id = 999;`;
    }

    // Find a non-primary key column for SET clause
    const updateColumn = tableSchema.find(col => col.pk !== 1) || tableSchema[0];
    const whereColumn = tableSchema.find(col => col.pk === 1) || tableSchema[0];

    return `UPDATE ${selectedTable} SET ${updateColumn.name} = ${getPlaceholderValue(updateColumn)} WHERE ${whereColumn.name} = ${getPlaceholderValue(whereColumn)};`;
  };

  // Generate DELETE query
  const generateDeleteQuery = () => {
    if (!selectedTable || tableSchema.length === 0) {
      return `DELETE FROM table_name WHERE id = 999;`;
    }

    const whereColumn = tableSchema.find(col => col.pk === 1) || tableSchema[0];
    return `DELETE FROM ${selectedTable} WHERE ${whereColumn.name} = ${getPlaceholderValue(whereColumn)};`;
  };

  const sampleQueries = [
    { generator: generateCreateTableQuery, label: 'CREATE TABLE' },
    { generator: generateInsertQuery, label: 'INSERT DATA' },
    { generator: generateSelectQuery, label: 'SELECT DATA' },
    { generator: generateUpdateQuery, label: 'UPDATE DATA' },
    { generator: generateDeleteQuery, label: 'DELETE DATA' },
  ];

  return (
    <Collapsible open={isQueriesOpen} onOpenChange={setIsQueriesOpen}>
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-lg border border-gray-200/60 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200/50 mb-4">
        <CollapsibleTrigger asChild>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50/30 p-4 w-full transition-all duration-200 active:scale-[0.98] group">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-yellow-500/10 group-hover:from-blue-500/20 group-hover:to-yellow-500/20 transition-colors duration-200">
              <Code className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="group-hover:text-slate-900 transition-colors duration-200">Sample Queries</span>
              {selectedTable && (
                <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-100 to-blue-100 border border-yellow-200/50">
                  <span className="text-xs font-medium text-slate-700">{selectedTable}</span>
                </div>
              )}
            </div>
            <div className="p-1 rounded-full group-hover:bg-white/60 transition-all duration-200">
              {isQueriesOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
              )}
            </div>
          </h3>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 pt-0">
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2">
              {sampleQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => onInsertSampleQuery(query.generator())}
                  className="w-full justify-start text-xs font-medium rounded-xl px-4 py-3 h-auto transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50/50 hover:shadow-sm hover:border-blue-200/50 border border-transparent active:scale-[0.97] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-yellow-500 group-hover:shadow-sm transition-all duration-200"></div>
                    <span className="text-slate-700 group-hover:text-slate-900 transition-colors duration-200">{query.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
