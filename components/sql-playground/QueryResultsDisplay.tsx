'use client';

import { AlertCircle, CheckCircle, Database, Clock, TrendingUp, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { QueryResult } from '@/lib/sqlite';
import { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QueryResultsDisplayProps {
  results: QueryResult[];
  error: string | null;
}

export const QueryResultsDisplay = ({ results, error }: QueryResultsDisplayProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [lastUpdateType, setLastUpdateType] = useState<'success' | 'error' | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Trigger animation when results or error change
  useEffect(() => {
    if (results.length > 0 || error) {
      setLastUpdateType(error ? 'error' : 'success');
      setShowAnimation(true);
      
      // Hide animation after 1 second for success, 3 seconds for errors
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, error ? 3000 : 1000);
      
      return () => clearTimeout(timer);
    }
  }, [results, error]);

  // Success/Error animation overlay
  const AnimationOverlay = () => {
    if (!showAnimation || !lastUpdateType) return null;
    
    return (
      <div className={`absolute inset-0 pointer-events-none z-10 rounded-xl overflow-hidden ${
        lastUpdateType === 'success' 
          ? 'bg-gradient-to-br from-green-400/80 to-emerald-500/80 backdrop-blur-sm animate-pulse border-2 border-green-500/50' 
          : 'bg-gradient-to-br from-red-500/80 to-orange-500/80 backdrop-blur-sm animate-pulse border-2 border-red-500/50'
      }`}>
        {/* Intense flash overlay for success */}
        {lastUpdateType === 'success' && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-300/90 to-emerald-400/90 animate-ping" />
        )}
        
        <div className={`absolute top-0 left-0 w-full h-2 ${
          lastUpdateType === 'success' 
            ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-400' 
            : 'bg-gradient-to-r from-red-500 to-orange-500'
        } animate-pulse shadow-lg`} />
        
        <div className={`absolute top-4 right-4 p-3 rounded-full ${
          lastUpdateType === 'success' 
            ? 'bg-green-500/90 border-2 border-green-300 shadow-xl shadow-green-500/30' 
            : 'bg-red-500/90 border-2 border-red-300 shadow-xl shadow-red-500/30'
        } animate-bounce`}>
          {lastUpdateType === 'success' ? (
            <CheckCircle className="w-6 h-6 text-white drop-shadow-lg" />
          ) : (
            <AlertCircle className="w-6 h-6 text-white drop-shadow-lg" />
          )}
        </div>
        
        {/* Success text overlay */}
        {lastUpdateType === 'success' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-green-500/50 shadow-xl animate-bounce">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-green-800 font-bold text-lg">Query Executed Successfully!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render content based on state
  const renderContent = () => {
    if (error) {
      return (
        <div className="relative">
          <div className="bg-gradient-to-br from-red-50 to-orange-50/50 border border-red-200/60 rounded-xl p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3 text-red-800 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-semibold text-lg">Query Error</span>
            </div>
            <div className="bg-white/70 rounded-lg border border-red-200/30 p-4">
              <pre className="text-red-700 text-sm whitespace-pre-wrap font-mono leading-relaxed">{error}</pre>
            </div>
          </div>
          <AnimationOverlay />
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="relative">
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/60 shadow-lg backdrop-blur-sm">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-slate-500/10 rounded-full animate-pulse" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-slate-100 to-blue-100 border border-slate-200/50">
                <Database className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <p className="mt-6 text-slate-600 font-medium text-lg">Execute a query to see results here</p>
            <p className="mt-2 text-slate-500 text-sm">Your query results will appear with beautiful animations</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative space-y-4">
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="group">
              <div className="bg-white border border-slate-200/60 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200/50 transition-all duration-300">
                {/* Header with enhanced styling */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50/50 px-6 py-4 border-b border-slate-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-lg font-semibold text-green-800">
                          Query {index + 1} Success
                        </span>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <BarChart3 className="w-4 h-4" />
                            <span className="font-medium">{result.values.length} rows</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">{result.columns.length} columns</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Just now</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Table content */}
                {result.columns.length > 0 && result.values.length > 0 ? (
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-50 to-blue-50/30">
                          <tr>
                            {result.columns.map((column, colIndex) => (
                              <th
                                key={colIndex}
                                className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200/50 bg-gradient-to-b from-transparent to-slate-50/50"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{column}</span>
                                  <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                          {result.values.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-slate-50/50 transition-all duration-200 group/row">
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-6 py-4 text-sm text-slate-900 border-b border-slate-100/50 font-medium"
                                >
                                  {cell === null ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-500 italic text-xs font-medium border border-slate-200/50">
                                      NULL
                                    </span>
                                  ) : (
                                    <span className="group-hover/row:text-slate-900 transition-colors duration-200">
                                      {String(cell)}
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 border border-green-200/50">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">Query executed successfully</span>
                      <span className="text-slate-600 text-sm">(no data returned)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <AnimationOverlay />
      </div>
    );
  };

  return (
    <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)} className="h-full flex flex-col">
      {/* Sticky Header */}
      <CollapsibleTrigger asChild>
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200/50 px-6 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors duration-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-sm"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Query Results</h3>
              {results.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {results.length} {results.length === 1 ? 'query' : 'queries'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {results.length > 0 && (
                <div className="text-xs text-slate-500">
                  {isCollapsed ? 'Click to expand' : 'Click to collapse'}
                </div>
              )}
              <div className="p-1 rounded-full hover:bg-slate-200/50 transition-colors duration-200">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleTrigger>

      {/* Collapsible Content - Now properly sized for parent scrolling */}
      <CollapsibleContent className="flex-1 min-h-0 overflow-visible">
        <div className="p-6">
          {renderContent()}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
