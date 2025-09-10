'use client';

import { Code, Eye } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'query' | 'table';
  selectedTable: string | null;
  tableDataExists: boolean;
  totalRows: number;
  onViewModeChange: (mode: 'query' | 'table') => void;
  onLoadTableData: () => void;
}

export const ViewModeToggle = ({
  viewMode,
  selectedTable,
  tableDataExists,
  totalRows,
  onViewModeChange,
  onLoadTableData,
}: ViewModeToggleProps) => {
  const handleTableViewClick = () => {
    if (tableDataExists) {
      onViewModeChange('table');
    } else if (selectedTable) {
      onLoadTableData();
    }
  };

  return (
    <div className="flex items-center">
      {/* Modern Tab Design */}
      <div className="flex">
        <button
          onClick={() => onViewModeChange('query')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
            viewMode === 'query'
              ? 'border-blue-500 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <Code className="w-4 h-4" />
          Query Editor
        </button>
        
        <button
          onClick={handleTableViewClick}
          disabled={!selectedTable && !tableDataExists}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            viewMode === 'table'
              ? 'border-blue-500 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          <Eye className="w-4 h-4" />
          Table View
          {tableDataExists && (
            <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs border border-blue-200/50">
              {totalRows} rows
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
