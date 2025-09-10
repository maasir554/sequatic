'use client';

import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';

interface SampleQueriesSidebarProps {
  onInsertSampleQuery: (queryType: string) => void;
}

export const SampleQueriesSidebar = ({ onInsertSampleQuery }: SampleQueriesSidebarProps) => {
  const sampleQueries = [
    { type: 'create_table', label: 'CREATE TABLE' },
    { type: 'insert_data', label: 'INSERT DATA' },
    { type: 'select_data', label: 'SELECT DATA' },
    { type: 'update_data', label: 'UPDATE DATA' },
    { type: 'delete_data', label: 'DELETE DATA' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Code className="w-4 h-4" />
        Sample Queries
      </h3>
      
      <div className="space-y-2">
        {sampleQueries.map((query) => (
          <Button
            key={query.type}
            variant="ghost"
            size="sm"
            onClick={() => onInsertSampleQuery(query.type)}
            className="w-full justify-start text-xs"
          >
            {query.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
