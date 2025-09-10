'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Kbd } from '@/components/ui/kbd';
import { Play, Loader2, Code, Palette, Zap, Command } from 'lucide-react';
import Editor from '@monaco-editor/react';
import githubDark from 'monaco-themes/themes/GitHub Dark.json';
import { useState, useEffect } from 'react';

interface QueryEditorProps {
  query: string;
  isExecuting: boolean;
  editorTheme: 'vs-light' | 'vs-dark' | 'hc-black' | 'github-dark' | 'sequatic-pro' | 'sequatic-pro-dark';
  onQueryChange: (value: string) => void;
  onExecuteQuery: () => void;
  onThemeChange: (theme: 'vs-light' | 'vs-dark' | 'hc-black' | 'github-dark' | 'sequatic-pro' | 'sequatic-pro-dark') => void;
  onEditorMount: (editor: Parameters<NonNullable<Parameters<typeof Editor>[0]['onMount']>>[0]) => void;
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
  const [isExecuting_, setIsExecuting_] = useState(false);
  const [lastExecutionTime, setLastExecutionTime] = useState<Date | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Handle execution animation
  useEffect(() => {
    if (isExecuting && !isExecuting_) {
      setIsExecuting_(true);
      setShowSuccessAnimation(false);
    } else if (!isExecuting && isExecuting_) {
      setIsExecuting_(false);
      setLastExecutionTime(new Date());
      setShowSuccessAnimation(true);
      
      // Hide success animation after 2 seconds
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isExecuting, isExecuting_]);

  const handleEditorWillMount = (monaco: Parameters<NonNullable<Parameters<typeof Editor>[0]['beforeMount']>>[0]) => {
    // Define GitHub Dark theme
    monaco.editor.defineTheme('github-dark', githubDark as Parameters<typeof monaco.editor.defineTheme>[1]);
    
    // Define custom professional light theme
    monaco.editor.defineTheme('sequatic-pro', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword.sql', foreground: '0066cc', fontStyle: 'bold' },
        { token: 'string.sql', foreground: '22863a' },
        { token: 'comment.sql', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'number.sql', foreground: 'd73a49' },
      ],
      colors: {
        'editor.background': '#fafbfc',
        'editor.foreground': '#24292e',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editorCursor.foreground': '#044289',
        'editor.selectionBackground': '#0366d625',
        'editorLineNumber.foreground': '#959da5',
        'editorLineNumber.activeForeground': '#044289',
      }
    });

    // Define custom professional dark theme
    monaco.editor.defineTheme('sequatic-pro-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword.sql', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'string.sql', foreground: 'ce9178' },
        { token: 'comment.sql', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'number.sql', foreground: 'b5cea8' },
        { token: 'operator.sql', foreground: 'd4d4d4' },
        { token: 'delimiter.sql', foreground: 'd4d4d4' },
        { token: 'identifier.sql', foreground: '9cdcfe' },
        { token: 'type.sql', foreground: '4ec9b0' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#161b22',
        'editorCursor.foreground': '#58a6ff',
        'editor.selectionBackground': '#264f78',
        'editorLineNumber.foreground': '#7d8590',
        'editorLineNumber.activeForeground': '#58a6ff',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#30363d',
        'editor.selectionHighlightBackground': '#264f7840',
        'editor.wordHighlightBackground': '#264f7840',
        'editor.findMatchBackground': '#9e6a03',
        'editor.findMatchHighlightBackground': '#f2cc6040',
        'editorBracketMatch.background': '#0969da30',
        'editorBracketMatch.border': '#58a6ff',
      }
    });
  };

  const handleEditorMount = async (editor: Parameters<NonNullable<Parameters<typeof Editor>[0]['onMount']>>[0]) => {
    // Get monaco instance from the editor
    const monaco = (window as typeof window & { monaco?: Parameters<NonNullable<Parameters<typeof Editor>[0]['beforeMount']>>[0] }).monaco;
    
    if (monaco) {
      // Add custom keybinding for query execution
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        if (!isExecuting && query.trim()) {
          onExecuteQuery();
        }
      });

      // Add auto-completion for SQL keywords
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
        editor.trigger('editor', 'editor.action.triggerSuggest', {});
      });
    }

    await onEditorMount(editor);
  };

  const getThemeDisplayName = (theme: string) => {
    switch (theme) {
      case 'vs-light': return 'Light';
      case 'vs-dark': return 'Dark';
      case 'hc-black': return 'High Contrast';
      case 'github-dark': return 'GitHub Dark';
      case 'sequatic-pro': return 'Sequatic Pro';
      case 'sequatic-pro-dark': return 'Sequatic Pro Dark';
      default: return theme;
    }
  };

  const getThemeIcon = () => {
    switch (editorTheme) {
      case 'vs-light':
      case 'sequatic-pro':
        return '☀️';
      case 'vs-dark':
      case 'github-dark':
      case 'sequatic-pro-dark':
        return '🌙';
      case 'hc-black':
        return '🔲';
      default:
        return '🎨';
    }
  };

  return (
    <div className="relative group">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 pointer-events-none z-20 rounded-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 animate-pulse" />
          <div className="absolute top-4 right-4 p-2 rounded-full bg-green-500/10 border border-green-500/20 animate-bounce">
            <Zap className="w-5 h-5 text-green-600" />
          </div>
        </div>
      )}

      <div className="bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-slate-500/10 border border-blue-500/20">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">SQL Query Console</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-600 font-medium">Type you SQL commands here applicable to selected database.</span>
                  {lastExecutionTime && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Last executed {lastExecutionTime.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Selector */}
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-600" />
                <Select value={editorTheme} onValueChange={onThemeChange}>
                  <SelectTrigger className="w-[180px] bg-white/80 border-slate-200/60 hover:border-blue-300 transition-colors duration-200">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span>{getThemeIcon()}</span>
                        <span className="font-medium">{getThemeDisplayName(editorTheme)}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200/60">
                    <SelectItem value="sequatic-pro" className="hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <span>⭐</span>
                        <span>Sequatic Pro</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sequatic-pro-dark" className="hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <span>🌟</span>
                        <span>Sequatic Pro Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="vs-light" className="hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <span>☀️</span>
                        <span>Light Theme</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="vs-dark" className="hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <span>🌙</span>
                        <span>Dark Theme</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="github-dark" className="hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <span>🌙</span>
                        <span>GitHub Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hc-black" className="hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <span>🔲</span>
                        <span>High Contrast</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Execute Button */}
              <Button
                onClick={onExecuteQuery}
                disabled={isExecuting || !query.trim()}
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                <div className="flex items-center gap-2 relative z-10">
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <div className="p-1 rounded-full bg-white/20 group-hover/btn:bg-white/30 transition-colors duration-200">
                        <Play className="w-3 h-3 fill-current" />
                      </div>
                      <span>Execute Query</span>
                    </>
                  )}
                </div>
                {/* Shimmer effect */}
                {!isExecuting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Container */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          
          <div className="p-1">
            <div className="border border-slate-200/60 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
              <Editor
                height="220px"
                language="sql"
                theme={editorTheme === 'sequatic-pro' ? 'sequatic-pro' : editorTheme === 'sequatic-pro-dark' ? 'sequatic-pro-dark' : editorTheme}
                value={query}
                onChange={(value) => onQueryChange(value || '')}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  fontFamily: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
                  fontLigatures: true,
                  lineNumbers: 'on',
                  lineNumbersMinChars: 3,
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  padding: { top: 16, bottom: 16 },
                  
                  // Enhanced suggestions
                  suggest: {
                    showKeywords: true,
                    showSnippets: true,
                    showFunctions: true,
                    filterGraceful: true,
                    snippetsPreventQuickSuggestions: false,
                  },
                  
                  // Better scrolling
                  smoothScrolling: true,
                  cursorSmoothCaretAnimation: 'on',
                  cursorBlinking: 'smooth',
                  
                  // Enhanced selection
                  selectionHighlight: true,
                  occurrencesHighlight: 'multiFile',
                  
                  // Better editing
                  formatOnPaste: true,
                  formatOnType: true,
                  autoIndent: 'full',
                  
                  // Professional appearance
                  renderLineHighlight: 'all',
                  renderWhitespace: 'selection',
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Footer with shortcuts */}
        <div className="bg-gradient-to-r from-slate-50/50 to-blue-50/20 px-6 py-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-6 text-slate-600">
              <div className="flex items-center gap-2">
                <Kbd>
                  <Command className="w-3 h-3" /> + Enter
                </Kbd>
                <span>to execute</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <Command className="w-3 h-3" /> + /
                </Kbd>
                <span>to comment</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-slate-700 font-medium">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
