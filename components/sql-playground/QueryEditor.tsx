'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import githubDark from 'monaco-themes/themes/GitHub Dark.json';

interface QueryEditorProps {
  query: string;
  isExecuting: boolean;
  editorTheme: 'vs-light' | 'vs-dark' | 'hc-black' | 'github-dark';
  onQueryChange: (value: string) => void;
  onExecuteQuery: () => void;
  onThemeChange: (theme: 'vs-light' | 'vs-dark' | 'hc-black' | 'github-dark') => void;
  onEditorMount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

export const QueryEditor = ({
  query,
  isExecuting,
  editorTheme,
  onQueryChange,
  onExecuteQuery,
  onThemeChange,
  onEditorMount,
}: QueryEditorProps) => {
  const handleEditorWillMount = (monaco: typeof import('monaco-editor')) => {
    // Define GitHub Dark theme
    monaco.editor.defineTheme('github-dark', githubDark as monaco.editor.IStandaloneThemeData);
  };

  const handleEditorMount = async (editor: monaco.editor.IStandaloneCodeEditor) => {
    await onEditorMount(editor);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">SQL Query Editor</h2>
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <Select value={editorTheme} onValueChange={onThemeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs-light">Light Theme</SelectItem>
              <SelectItem value="vs-dark">Dark Theme</SelectItem>
              <SelectItem value="hc-black">High Contrast</SelectItem>
              <SelectItem value="github-dark">GitHub Dark</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={onExecuteQuery}
            disabled={isExecuting || !query.trim()}
            className="flex items-center gap-2"
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isExecuting ? 'Executing...' : 'Execute Query'}
          </Button>
        </div>
      </div>

      <div className="border border-gray-300 rounded-md overflow-hidden">
        <Editor
          height="200px"
          language="sql"
          theme={editorTheme}
          value={query}
          onChange={(value) => onQueryChange(value || '')}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Press Ctrl+Enter (Cmd+Enter on Mac) to execute query
      </div>
    </div>
  );
};
