'use client';

import { useSession } from 'next-auth/react';
import { useSQLPlayground } from './sql-playground/useSQLPlayground';
import { SQLPlaygroundHeader } from './sql-playground/SQLPlaygroundHeader';
import { TablesSidebar } from './sql-playground/TablesSidebar';
import { SampleQueriesSidebar } from './sql-playground/SampleQueriesSidebar';
import { ViewModeToggle } from './sql-playground/ViewModeToggle';
import { QueryEditor } from './sql-playground/QueryEditor';
import { QueryResultsDisplay } from './sql-playground/QueryResultsDisplay';
import { TableDataView } from './sql-playground/TableDataView';

interface SQLPlaygroundProps {
  databaseId: string;
  databaseName: string;
  onBackToDashboard: () => void;
}

export const SQLPlayground = ({ databaseId, databaseName, onBackToDashboard }: SQLPlaygroundProps) => {
  const { data: session } = useSession();
  const {
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
    tableRows,
    table,
    
    // Actions
    setQuery,
    setSelectedTable,
    setViewMode,
    setEditorTheme,
    executeQuery,
    loadTableSchema,
    loadTableData,
    insertSampleQuery,
    exportDatabase,
    handleEditorMount,
    handleDeleteRow,
  } = useSQLPlayground(databaseId, databaseName);

  const userDisplayName = session?.user?.username || session?.user?.name || undefined;

  const handleLoadTableDataForView = () => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SQLPlaygroundHeader
        databaseName={databaseName}
        userDisplayName={userDisplayName}
        onBackToDashboard={onBackToDashboard}
        onExportDatabase={exportDatabase}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tables and Schema */}
          <div className="lg:col-span-1 max-h-[calc(100vh-8rem)] overflow-y-auto sticky top-4 py-2">
            <div className="space-y-4">
              <TablesSidebar
                tables={tables}
                selectedTable={selectedTable}
                tableSchema={tableSchema}
                onTableSelect={setSelectedTable}
                onLoadTableSchema={loadTableSchema}
                onLoadTableData={loadTableData}
              />

              {/* Sample Queries */}
              <SampleQueriesSidebar 
                selectedTable={selectedTable}
                tableSchema={tableSchema}
                onInsertSampleQuery={insertSampleQuery} 
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Modern Window with Integrated Tabs and Content */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden backdrop-blur-sm max-h-[calc(100vh-8rem)]">
              {/* Integrated Header with Tabs */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/50">
                <ViewModeToggle
                  viewMode={viewMode}
                  selectedTable={selectedTable}
                  tableDataExists={!!tableData}
                  totalRows={tableData?.values.length || 0}
                  onViewModeChange={setViewMode}
                  onLoadTableData={handleLoadTableDataForView}
                />
              </div>

              {/* Content Area with Proper Height Management */}
              <div className="h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
                {viewMode === 'query' ? (
                  <>
                    {/* Query Editor - Integrated Design */}
                    <div className="flex-shrink-0 border-b border-slate-200/50">
                      <QueryEditor
                        query={query}
                        isExecuting={isExecuting}
                        editorTheme={editorTheme}
                        onQueryChange={setQuery}
                        onExecuteQuery={executeQuery}
                        onThemeChange={setEditorTheme}
                        onEditorMount={handleEditorMount}
                      />
                    </div>

                    {/* Query Results Area - Scrollable with More Height */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                      <QueryResultsDisplay results={results} error={error} />
                    </div>
                  </>
                ) : (
                  /* Table Data View - Full Height with Scroll */
                  <div className="flex-1 overflow-hidden">
                    <TableDataView
                      selectedTable={selectedTable}
                      table={table}
                      tableRows={tableRows}
                      totalRows={tableData?.values.length || 0}
                      onDeleteRow={handleDeleteRow}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
