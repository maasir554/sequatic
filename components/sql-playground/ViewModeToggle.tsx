'use client';

import { Button } from '@/components/ui/button';
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
    <div className="flex items-center gap-2 mb-6">
      <Button
        variant={viewMode === 'query' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('query')}
        className="flex items-center gap-2"
      >
        <Code className="w-4 h-4" />
        Query Editor
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={handleTableViewClick}
        disabled={!selectedTable && !tableDataExists}
        className="flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Table View
        {tableDataExists && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs ml-1">
            {totalRows} rows
          </span>
        )}
      </Button>
    </div>
  );
};
