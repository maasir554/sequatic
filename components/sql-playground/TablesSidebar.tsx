'use client';

import { Button } from '@/components/ui/button';
import { Table, Columns, Eye } from 'lucide-react';
import { SqlValue } from '@/lib/sqlite';

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

interface TablesSidebarProps {
  tables: TableInfo[];
  selectedTable: string | null;
  tableSchema: TableSchema[];
  onTableSelect: (tableName: string) => void;
  onLoadTableSchema: (tableName: string) => void;
  onLoadTableData: (tableName: string) => void;
}

export const TablesSidebar = ({
  tables,
  selectedTable,
  tableSchema,
  onTableSelect,
  onLoadTableSchema,
  onLoadTableData,
}: TablesSidebarProps) => {
  return (
    <div className="space-y-4">
      {/* Tables List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Table className="w-4 h-4" />
          Tables
        </h3>
        
        {tables.length === 0 ? (
          <p className="text-sm text-gray-500">No tables found</p>
        ) : (
          <div className="space-y-2">
            {tables.map((table) => (
              <div key={table.name} className="space-y-1">
                <div
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
                    selectedTable === table.name
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => onTableSelect(table.name)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{table.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadTableSchema(table.name);
                        }}
                        className="h-6 w-6 p-0 hover:bg-blue-200"
                        title="View Schema"
                      >
                        <Columns className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadTableData(table.name);
                        }}
                        className="h-6 w-6 p-0 hover:bg-green-200"
                        title="View Data"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table Schema Display */}
      {selectedTable && tableSchema.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Columns className="w-4 h-4" />
            Schema: {selectedTable}
          </h3>
          
          <div className="space-y-2">
            {tableSchema.map((column) => (
              <div key={column.cid} className="text-xs border rounded p-2 bg-gray-50">
                <div className="font-medium text-gray-900">{column.name}</div>
                <div className="text-gray-600">{column.type}</div>
                <div className="flex gap-2 mt-1">
                  {column.pk === 1 && (
                    <span className="bg-blue-100 text-blue-800 px-1 rounded text-xs">PK</span>
                  )}
                  {column.notnull === 1 && (
                    <span className="bg-red-100 text-red-800 px-1 rounded text-xs">NOT NULL</span>
                  )}
                  {column.dflt_value !== null && (
                    <span className="bg-gray-100 text-gray-800 px-1 rounded text-xs">
                      DEFAULT: {String(column.dflt_value)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
