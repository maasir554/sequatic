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
          <div className="lg:col-span-1">
            <TablesSidebar
              tables={tables}
              selectedTable={selectedTable}
              tableSchema={tableSchema}
              onTableSelect={setSelectedTable}
              onLoadTableSchema={loadTableSchema}
              onLoadTableData={loadTableData}
            />

            {/* Sample Queries */}
            <div className="mt-4">
              <SampleQueriesSidebar onInsertSampleQuery={insertSampleQuery} />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              selectedTable={selectedTable}
              tableDataExists={!!tableData}
              totalRows={tableData?.values.length || 0}
              onViewModeChange={setViewMode}
              onLoadTableData={handleLoadTableDataForView}
            />

            {viewMode === 'query' ? (
              <>
                {/* Query Editor */}
                <QueryEditor
                  query={query}
                  isExecuting={isExecuting}
                  editorTheme={editorTheme}
                  onQueryChange={setQuery}
                  onExecuteQuery={executeQuery}
                  onThemeChange={setEditorTheme}
                  onEditorMount={handleEditorMount}
                />

                {/* Query Results Area */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Results</h3>
                  <QueryResultsDisplay results={results} error={error} />
                </div>
              </>
            ) : (
              /* Table Data View */
              <TableDataView
                selectedTable={selectedTable}
                table={table}
                tableRows={tableRows}
                totalRows={tableData?.values.length || 0}
                onDeleteRow={handleDeleteRow}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
