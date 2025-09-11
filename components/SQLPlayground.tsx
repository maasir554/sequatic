'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSQLPlayground } from './sql-playground/useSQLPlayground';
import { SQLPlaygroundHeader } from './sql-playground/SQLPlaygroundHeader';
import { TablesSidebar } from './sql-playground/TablesSidebar';
import { SampleQueriesSidebar } from './sql-playground/SampleQueriesSidebar';
import { AIChatInterface } from './sql-playground/AIChatInterface';
import { ViewModeToggle } from './sql-playground/ViewModeToggle';
import { QueryEditor } from './sql-playground/QueryEditor';
import { QueryResultsDisplay } from './sql-playground/QueryResultsDisplay';
import { TableDataView } from './sql-playground/TableDataView';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface SQLPlaygroundProps {
  databaseId: string;
  databaseName: string;
  onBackToDashboard: () => void;
}

export const SQLPlayground = ({ databaseId, databaseName, onBackToDashboard }: SQLPlaygroundProps) => {
  const { data: session } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIChatCollapsed, setIsAIChatCollapsed] = useState(false);
  
  // Keyboard shortcuts for toggling panels
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        event.preventDefault();
        setIsAIChatCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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

  const handleAIQueryGenerated = (query: string) => {
    setQuery(query);
    setViewMode('query');
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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 relative">
          {/* Collapsible Left Sidebar */}
          <div className={`transition-all duration-300 ease-in-out ${
            isSidebarCollapsed 
              ? 'w-16 flex-shrink-0' 
              : 'w-72 lg:w-80 flex-shrink-0'
          }`}>
            {/* Collapse Toggle Button - Always pinned at top */}
            <div className="sticky top-4 z-30 mb-4">
              <Button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                variant="outline"
                size="sm"
                className={`transition-all duration-200 hover:shadow-md border-2 ${
                  isSidebarCollapsed 
                    ? 'w-12 h-12 p-0 rounded-xl border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-white' 
                    : 'w-full h-12 overflow-hidden justify-start bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300'
                }`}
                title={isSidebarCollapsed ? 'Expand Sidebar (⌘+B)' : 'Collapse Sidebar (⌘+B)'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5 text-blue-600" />
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <PanelLeftClose className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Collapse Sidebar</span>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border">
                      ⌘+B
                    </div>
                  </div>
                )}
              </Button>
            </div>

            {/* Scrollable Content Area */}
            <div className={`${
              isSidebarCollapsed 
                ? '' // No height restriction for collapsed mode
                : 'max-h-[calc(100vh-10rem)] overflow-y-auto' // Adjusted for smaller header
            }`}>
              <div className="space-y-4">
                <TablesSidebar
                  tables={tables}
                  selectedTable={selectedTable}
                  tableSchema={tableSchema}
                  isCollapsed={isSidebarCollapsed}
                  onTableSelect={setSelectedTable}
                  onLoadTableSchema={loadTableSchema}
                  onLoadTableData={loadTableData}
                />

                {!isSidebarCollapsed && (
                  <SampleQueriesSidebar 
                    selectedTable={selectedTable}
                    tableSchema={tableSchema}
                    onInsertSampleQuery={insertSampleQuery} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">{/* min-w-0 prevents flex overflow */}
            {/* Modern Window with Integrated Tabs and Content */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden backdrop-blur-sm max-h-[calc(100vh-7rem)]">
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
              <div className="h-[calc(100vh-10rem)] overflow-hidden flex flex-col">
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

          {/* AI Chat Interface - Right Sidebar */}
          <div className={`transition-all duration-300 ease-in-out ${
            isAIChatCollapsed 
              ? 'w-16 flex-shrink-0' 
              : 'w-96 lg:w-[400px] xl:w-[450px] flex-shrink-0'
          }`}>
            {/* AI Chat Toggle Button - Always pinned at top */}
            <div className="sticky top-4 z-30 mb-2">
              <Button
                onClick={() => setIsAIChatCollapsed(!isAIChatCollapsed)}
                variant="outline"
                size="default"
                className={`transition-all duration-200 hover:shadow-md border-2 text-xs ${
                  isAIChatCollapsed 
                    ? 'w-12 h-12 p-0 rounded-xl border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-white' 
                    : 'w-full h-10 overflow-hidden justify-start bg-white hover:bg-purple-50 border-slate-200 hover:border-purple-300'
                }`}
                title={isAIChatCollapsed ? 'Expand AI Chat (⌘+I)' : 'Collapse AI Chat (⌘+I)'}
              >
                {isAIChatCollapsed ? (
                  <PanelRightOpen className="w-5 h-5 text-purple-600" />
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <PanelRightClose className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Collapse AI Chat</span>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border">
                      ⌘+I
                    </div>
                  </div>
                )}
              </Button>
            </div>

            {/* AI Chat Content */}
            <div className={`${
              isAIChatCollapsed 
                ? '' // No height restriction for collapsed mode
                : 'h-[calc(100vh-10rem)]' // Fixed height for new flex layout - adjusted for smaller header
            }`}>
              <AIChatInterface
                isCollapsed={isAIChatCollapsed}
                onQueryGenerated={handleAIQueryGenerated}
                selectedTable={selectedTable || undefined}
                tableSchema={tableSchema}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
