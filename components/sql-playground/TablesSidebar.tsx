'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, Columns, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { SqlValue } from '@/lib/sqlite';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  isCollapsed: boolean;
  onTableSelect: (tableName: string) => void;
  onLoadTableSchema: (tableName: string) => void;
  onLoadTableData: (tableName: string) => void;
}

export const TablesSidebar = ({
  tables,
  selectedTable,
  tableSchema,
  isCollapsed,
  onTableSelect,
  onLoadTableSchema,
  onLoadTableData,
}: TablesSidebarProps) => {
  const [isTablesOpen, setIsTablesOpen] = useState(true);
  const [isSchemaOpen, setIsSchemaOpen] = useState(true);

  return (
    <div className="space-y-4 pt-1">
      {isCollapsed ? (
        /* Collapsed Icon-Only Mode */
        <div className="space-y-3">
          {/* Tables Icon */}
          <div className="relative group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-blue-400/30">
              <Table className="w-6 h-6 text-white" />
            </div>
            <div className="absolute left-16 top-0 z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
              <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-64 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-600" />
                    Tables ({tables.length})
                  </h4>
                  {tables.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No tables found</p>
                  ) : (
                    tables.map((table) => (
                      <div
                        key={table.name}
                        className={`px-3 py-2 rounded-lg text-xs cursor-pointer transition-all duration-200 flex items-center justify-between ${
                          selectedTable === table.name
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-blue-50 text-gray-700'
                        }`}
                        onClick={() => onTableSelect(table.name)}
                      >
                        <span className="font-medium">{table.name}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLoadTableSchema(table.name);
                            }}
                            className={`p-1 rounded ${
                              selectedTable === table.name
                                ? 'hover:bg-white/20 text-white/80'
                                : 'hover:bg-blue-100 text-gray-500'
                            }`}
                            title="Schema"
                          >
                            <Columns className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLoadTableData(table.name);
                            }}
                            className={`p-1 rounded ${
                              selectedTable === table.name
                                ? 'hover:bg-white/20 text-white/80'
                                : 'hover:bg-yellow-100 text-gray-500'
                            }`}
                            title="View Data"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Schema Icon - Only show if there's a selected table with schema */}
          {selectedTable && tableSchema.length > 0 && (
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-yellow-400/30">
                <Columns className="w-6 h-6 text-white" />
              </div>
              <div className="absolute left-16 top-0 z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <h4 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <Columns className="w-4 h-4 text-yellow-600" />
                    Schema: {selectedTable}
                  </h4>
                  <div className="space-y-2">
                    {tableSchema.map((column) => (
                      <div key={column.cid} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800">{column.name}</span>
                          <span className="text-slate-600">{column.type}</span>
                          {column.pk === 1 && (
                            <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs">PK</span>
                          )}
                          {column.notnull === 1 && (
                            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs">NOT NULL</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Expanded Full Mode */
        <>
          {/* Tables List */}
          <Collapsible open={isTablesOpen} onOpenChange={setIsTablesOpen}>
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-lg border border-gray-200/60 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200/50">
          <CollapsibleTrigger asChild>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50/30 p-4 w-full transition-all duration-200 active:scale-[0.98] group">
              <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-200">
                <Table className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
              </div>
              <div className="flex items-center gap-2">
                <span className="group-hover:text-slate-900 transition-colors duration-200">Tables</span>
                <div className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-200/50">
                  <span className="text-xs font-medium text-blue-800">{tables.length}</span>
                </div>
              </div>
              <div className="ml-auto p-1 rounded-full group-hover:bg-white/60 transition-all duration-200">
                {isTablesOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
                )}
              </div>
            </h3>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 pt-0">
              {tables.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Table className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No tables found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2">
                  {tables.map((table) => (
                    <div key={table.name} className="space-y-1">
                      <div
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer group active:scale-[0.97] border ${
                          selectedTable === table.name
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md border-blue-500 shadow-blue-500/20'
                            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 text-gray-700 hover:text-slate-800 border-transparent hover:border-blue-200/50 hover:shadow-sm'
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
                              className={`h-7 w-7 p-0 rounded-lg transition-all duration-200 active:scale-90 ${
                                selectedTable === table.name
                                  ? 'hover:bg-white/20 text-white/80 hover:text-white'
                                  : 'hover:bg-blue-100 hover:text-blue-700 text-gray-500'
                              }`}
                              title="View Schema"
                            >
                              <Columns className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onLoadTableData(table.name);
                              }}
                              className={`h-7 w-7 p-0 rounded-lg transition-all duration-200 active:scale-90 ${
                                selectedTable === table.name
                                  ? 'hover:bg-white/20 text-white/80 hover:text-white'
                                  : 'hover:bg-yellow-100 hover:text-yellow-700 text-gray-500'
                              }`}
                              title="View Data"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Table Schema Display */}
      {selectedTable && tableSchema.length > 0 && (
        <Collapsible open={isSchemaOpen} onOpenChange={setIsSchemaOpen}>
          <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-lg border border-gray-200/60 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-yellow-200/50">
            <CollapsibleTrigger asChild>
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-yellow-50 hover:to-blue-50/30 p-4 w-full transition-all duration-200 active:scale-[0.98] group">
                <div className="p-1.5 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors duration-200">
                  <Columns className="w-4 h-4 text-yellow-600 group-hover:text-yellow-700" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="group-hover:text-slate-900 transition-colors duration-200">Schema</span>
                  <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-yellow-100 border border-blue-200/50">
                    <span className="text-xs font-medium text-slate-700">{selectedTable}</span>
                  </div>
                </div>
                <div className="ml-auto p-1 rounded-full group-hover:bg-white/60 transition-all duration-200">
                  {isSchemaOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-yellow-600 transition-colors duration-200" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-yellow-600 transition-colors duration-200" />
                  )}
                </div>
              </h3>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 pt-0">
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-2">
                  {tableSchema.map((column) => (
                    <div key={column.cid} className="text-xs border border-gray-200/60 rounded-xl px-4 py-3 bg-gradient-to-r from-gray-50/80 to-white overflow-x-auto hover:shadow-sm transition-all duration-200 hover:border-gray-300/60 group">
                      <div className="flex items-center gap-2 min-w-max">
                        <span className="font-semibold text-slate-800 whitespace-nowrap group-hover:text-slate-900 transition-colors duration-200">{column.name}</span>
                        <span className="text-slate-600 whitespace-nowrap font-medium">{column.type}</span>
                        {column.pk === 1 && (
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-0.5 rounded-lg text-xs whitespace-nowrap font-medium shadow-sm">PK</span>
                        )}
                        {column.notnull === 1 && (
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-lg text-xs whitespace-nowrap font-medium shadow-sm">NOT NULL</span>
                        )}
                        {column.dflt_value !== null && (
                          <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-0.5 rounded-lg text-xs whitespace-nowrap font-medium shadow-sm">
                            DEFAULT: {String(column.dflt_value)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
        </>
      )}
    </div>
  );
};
