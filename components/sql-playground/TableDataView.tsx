'use client';

import { Table, Trash2 } from 'lucide-react';
import { DataGrid, DataGridContainer } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table as ReactTable, ColumnDef } from '@tanstack/react-table';
import { SqlValue } from '@/lib/sqlite';
import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from '@tanstack/react-table';

interface TableDataViewProps {
  selectedTable: string | null;
  table: ReactTable<Record<string, SqlValue>>;
  tableRows: Record<string, SqlValue>[];
  totalRows: number;
  onDeleteRow: (row: Record<string, SqlValue>) => void;
}

export const TableDataView = ({
  selectedTable,
  table,
  tableRows,
  totalRows,
  onDeleteRow,
}: TableDataViewProps) => {
  // Create extended columns with delete action
  const extendedColumns = useMemo(() => {
    const originalColumns = table.getAllColumns().map(col => col.columnDef);
    
    // Add delete action column
    const deleteColumn: ColumnDef<Record<string, SqlValue>> = {
      id: 'delete',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => onDeleteRow(row.original)}
          className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          title={`Delete this row from ${selectedTable}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
      size: 80,
      enableSorting: false,
      meta: {
        headerClassName: 'font-semibold bg-gray-50',
        cellClassName: 'text-center',
      },
    };
    
    return [...originalColumns, deleteColumn];
  }, [table, onDeleteRow, selectedTable]);

  // Create new table instance with extended columns
  const extendedTable = useReactTable({
    columns: extendedColumns,
    data: tableRows,
    pageCount: Math.ceil((tableRows?.length || 0) / 10),
    getRowId: (row) => row._id as string,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Table className="w-5 h-5" />
          {selectedTable} Data
        </h3>
        <div className="text-sm text-gray-600">
          {totalRows} total rows
        </div>
      </div>
      
      {tableRows.length > 0 ? (
        <DataGrid
          table={extendedTable}
          recordCount={tableRows.length}
          tableLayout={{
            width: 'auto',
          }}
        >
          <div className="w-full space-y-2.5">
            <DataGridContainer>
              <ScrollArea>
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </DataGridContainer>
            <DataGridPagination />
          </div>
        </DataGrid>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Table className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No data available</p>
          <p className="text-sm">Select a table from the sidebar to view its data</p>
        </div>
      )}
    </div>
  );
};
