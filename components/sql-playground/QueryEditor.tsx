'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Kbd } from '@/components/ui/kbd';
import { Play, Loader2, Code, Palette, Zap, Command, ChevronDown, ChevronUp, Minimize2, Maximize2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Editor from '@monaco-editor/react';
import githubDark from 'monaco-themes/themes/GitHub Dark.json';
import { useState, useEffect } from 'react';
import { BsFillTerminalFill } from "react-icons/bs";

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
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

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
    <Collapsible open={!isEditorCollapsed} onOpenChange={(open) => setIsEditorCollapsed(!open)}>
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

        <div className="bg-white rounded-lg border border-slate-200/60 overflow-hidden">
          {/* Collapsible Header */}
          <CollapsibleTrigger asChild>
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-4 sm:px-6 py-1 sm:py-2 cursor-pointer hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50/50 transition-all duration-200 border-b border-slate-200/50">
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-2 lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-sm bg-gradient-to-br from-blue-500/10 to-slate-500/10 border border-blue-500/20">
                      <BsFillTerminalFill className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    {isEditorCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-start gap-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-black text-black tracking-tight whitespace-nowrap">SQL Query Console</h2>
                      {isEditorCollapsed && query.trim() && (
                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                          <Code className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{query.split('\n')[0]}...</span>
                        </div>
                      )}
                    </div>
                    
                    {!isEditorCollapsed && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        {lastExecutionTime && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Last executed {lastExecutionTime.toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          {/* Collapsible Editor Content */}
          <CollapsibleContent className="overflow-visible">
            <div className="relative py-2 px-2">
               {/* Controls - Always visible */}
                <div className="flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
                  {/* Compact Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCompactMode(!isCompactMode);
                    }}
                    className="h-8 w-8 p-0 hover:bg-slate-100 rounded-md"
                    title={isCompactMode ? "Expand Editor" : "Compact Editor"}
                  >
                    {isCompactMode ? (
                      <Maximize2 className="w-4 h-4 text-slate-600" />
                    ) : (
                      <Minimize2 className="w-4 h-4 text-slate-600" />
                    )}
                  </Button>

                  {/* Theme Selector - Responsive */}
                  <div className="hidden md:flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-600" />
                    <Select value={editorTheme} onValueChange={onThemeChange}>
                      <SelectTrigger className="w-[160px] lg:w-[180px] bg-white/80 border-slate-200/60 hover:border-blue-300 transition-colors duration-200">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <span>{getThemeIcon()}</span>
                            <span className="font-medium text-sm">{getThemeDisplayName(editorTheme)}</span>
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
                  
                  {/* Execute Button - Responsive */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExecuteQuery();
                    }}
                    disabled={isExecuting || !query.trim()}
                    className=" cursor-pointer relative text-xs overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                      {isExecuting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">Executing...</span>
                        </>
                      ) : (
                        <>
                          <div className="p-1 rounded-full bg-white/20 group-hover/btn:bg-white/30 transition-colors duration-200 text-xs">
                            <Play className="w-1 h-1 fill-current" />
                          </div>
                          <span className="hidden sm:inline">Execute Query</span>
                          <span className="sm:hidden">Run</span>
                          <div className="hidden lg:flex items-center">
                            <Kbd size={'xs'} className="bg-white/20 text-white border-white/30">
                              <Command className="w-2 h-2 mr-1" />
                              ↵
                            </Kbd>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Shimmer effect */}
                    {!isExecuting && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    )}
                  </Button>
                </div>
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              
              <div className="p-1">
                <div className="border border-slate-200/60 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
                  <Editor
                    height={isCompactMode ? "160px" : "220px"}
                    language="sql"
                    theme={editorTheme === 'sequatic-pro' ? 'sequatic-pro' : editorTheme === 'sequatic-pro-dark' ? 'sequatic-pro-dark' : editorTheme}
                    value={query}
                    onChange={(value) => onQueryChange(value || '')}
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: isCompactMode ? 13 : 15,
                      fontFamily: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace",
                      fontLigatures: true,
                      lineNumbers: isCompactMode ? 'off' : 'on',
                      lineNumbersMinChars: 3,
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      padding: { top: isCompactMode ? 12 : 16, bottom: isCompactMode ? 12 : 16 },
                      
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
                      
                      // Responsive options
                      folding: !isCompactMode,
                      glyphMargin: !isCompactMode,
                    }}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
};
