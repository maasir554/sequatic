'use client';

import { AlertCircle, CheckCircle, Database } from 'lucide-react';
import { QueryResult } from '@/lib/sqlite';

interface QueryResultsDisplayProps {
  results: QueryResult[];
  error: string | null;
}

export const QueryResultsDisplay = ({ results, error }: QueryResultsDisplayProps) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Query Error</span>
        </div>
        <pre className="text-red-700 text-sm whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Execute a query to see results here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Query {index + 1} - {result.values.length} rows returned
              </span>
            </div>
          </div>
          
          {result.columns.length > 0 && result.values.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {result.columns.map((column, colIndex) => (
                      <th
                        key={colIndex}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {result.values.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100"
                        >
                          {cell === null ? (
                            <span className="text-gray-400 italic">NULL</span>
                          ) : (
                            String(cell)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Query executed successfully (no data returned)
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
