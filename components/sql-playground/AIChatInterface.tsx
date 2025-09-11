'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  User, 
  Copy, 
  Brain,
  Play
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: 'ask' | 'agentic';
  query?: string; // Generated SQL query
}

interface AIChatInterfaceProps {
  isCollapsed: boolean;
  onQueryGenerated: (query: string) => void;
  selectedTable?: string;
  tableSchema?: Array<{ name: string; type: string; pk: number }>;
}

export const AIChatInterface = ({ 
  isCollapsed, 
  onQueryGenerated, 
  selectedTable, 
  tableSchema 
}: AIChatInterfaceProps) => {
  // tableSchema will be used for advanced AI analysis features in future updates
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 **Welcome to your AI SQL Assistant!**

I'm here to help you write, optimize, and understand SQL queries. I have two powerful modes:

### 🤖 **Ask Mode**
- Get direct SQL help and query generation
- Perfect for quick questions and learning
- Simple, focused responses

### ⚡ **Agentic Mode**  
- Advanced AI analysis and optimization
- Performance recommendations
- Database structure insights
- Proactive suggestions

**Getting Started:**
1. Select a mode above
2. Ask me anything about SQL
3. Use generated queries directly in your editor

*Ready to supercharge your SQL workflow? Ask me anything!*`,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMode, setChatMode] = useState<'ask' | 'agentic'>('ask');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateMockResponse = (userMessage: string, mode: 'ask' | 'agentic'): { content: string; query?: string } => {
    // This is a mock implementation - in real app you'd call your AI API
    const mockQueries = [
      "SELECT * FROM users WHERE created_at >= DATE('now', '-30 days');",
      "SELECT COUNT(*) as total_records FROM " + (selectedTable || 'your_table') + ";",
      "SELECT column_name, COUNT(*) FROM " + (selectedTable || 'your_table') + " GROUP BY column_name ORDER BY COUNT(*) DESC LIMIT 10;",
      "UPDATE " + (selectedTable || 'your_table') + " SET status = 'active' WHERE last_login > DATE('now', '-7 days');",
      "SELECT AVG(price) as average_price, category FROM products GROUP BY category;"
    ];

    const randomQuery = mockQueries[Math.floor(Math.random() * mockQueries.length)];

    if (mode === 'ask') {
      return {
        content: `I'll help you with that SQL query! Here's what I recommend:

\`\`\`sql
${randomQuery}
\`\`\`

**Query Explanation:**
- This query will help you ${userMessage.toLowerCase()}
- It uses modern SQL syntax for optimal performance
- Results will be returned in ascending order

**Next Steps:**
1. Click "Insert Query" to add it to your editor
2. Review the query before execution
3. Execute when ready

*Need any modifications to this query?*`,
        query: randomQuery
      };
    } else {
      return {
        content: `🔍 **AI Analysis Complete**

Based on your request "*${userMessage}*", I've analyzed your database structure and created an optimized solution:

\`\`\`sql
${randomQuery}
\`\`\`

### 🚀 **Performance Recommendations:**

- **Index Optimization**: Consider adding an index on frequently queried columns
- **Query Performance**: This query is optimized for performance with estimated execution time **<50ms**
- **Resource Usage**: Low memory footprint, suitable for large datasets

### 📊 **Analysis Summary:**

| Metric | Value |
|--------|-------|
| Complexity | Low |
| Performance | High |
| Readability | Excellent |

### 💡 **Additional Suggestions:**

> **Pro Tip**: For even better performance, consider using prepared statements if this query will be executed frequently.

Would you like me to:
- Explain the optimization strategy in detail?
- Suggest alternative approaches?
- Add error handling to the query?`,
        query: randomQuery
      };
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      mode: chatMode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = generateMockResponse(inputMessage, chatMode);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        mode: chatMode,
        query: response.query
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  const insertQuery = (query: string) => {
    onQueryGenerated(query);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (isCollapsed) {
    return (
      <div className="w-16 flex-shrink-0">
        <div className="sticky top-4 space-y-4">
          {/* AI Chat Icon */}
          <div className="group relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-purple-400/30">
              <Image 
                src="/sequatic-flat-white.svg" 
                alt="Sequatic AI" 
                width={24} 
                height={24} 
                className="drop-shadow-sm"
              />
            </div>
            <div className="absolute left-16 top-0 z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
              <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-64">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <Image 
                      src="/sequatic-flat-blue.svg" 
                      alt="Sequatic AI" 
                      width={16} 
                      height={16}
                    />
                    AI SQL Assistant
                  </h4>
                  <p className="text-xs text-gray-600">
                    Get AI-powered help with SQL queries, data analysis, and optimization suggestions.
                  </p>
                  <div className="flex gap-1 mt-2">
                    <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200">Ask Mode</Badge>
                    <Badge className="text-xs bg-purple-50 text-purple-700 border-purple-200">Agentic</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-200" title="Quick Query">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-200" title="AI Analysis">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 lg:w-[400px] xl:w-[450px] flex-shrink-0 h-full flex flex-col">
      {/* Fixed Header */}
      <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-t-xl shadow-lg border border-purple-200/60 border-b-0 backdrop-blur-sm flex-shrink-0">
        <div className="p-4 border-b border-purple-200/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                <Image 
                  src="/sequatic-flat-white.svg" 
                  alt="Sequatic AI" 
                  width={20} 
                  height={20} 
                  className="drop-shadow-sm w-full"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">AI SQL Assistant</h3>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChatMode('ask')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                chatMode === 'ask'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MessageSquare className="w-2 h-2" />
              Ask Mode
            </button>
            <button
              onClick={() => setChatMode('agentic')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                chatMode === 'agentic'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Brain className="w-2 h-2" />
              Agentic
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Chat Messages Area */}
      <div className="flex-1 bg-white border-l border-r border-purple-200/60 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-500' 
                      : ''
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Image 
                        src="/sequatic-flat-white.svg" 
                        alt="Sequatic AI" 
                        width={16} 
                        height={16} 
                        className="drop-shadow-sm w-full"
                      />
                    )}
                  </div>
                  
                  <div className={`flex-1 space-y-2 ${message.role === 'user' ? 'items-end' : 'items-start'} min-w-0`}>
                    <div className={`max-w-[85%] p-3 rounded-xl overflow-hidden ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-gray-50 text-gray-800'
                    }`}>
                      {message.role === 'user' ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                          {message.content}
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-full overflow-hidden prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-800 prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-800 prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: ({ className, children, ...props }: React.HTMLProps<HTMLElement> & { className?: string }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match;
                                return isInline ? (
                                  <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800 text-xs break-all" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <div className="relative w-full">
                                    <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto text-xs w-full max-w-full">
                                      <code className="break-all whitespace-pre-wrap" {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                    <div className="absolute top-2 right-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                      {match[1]}
                                    </div>
                                  </div>
                                );
                              },
                              p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 break-words">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 break-words">{children}</ol>,
                              li: ({ children }) => <li className="text-sm break-words">{children}</li>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 mb-2 break-words">
                                  {children}
                                </blockquote>
                              ),
                              h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-800 break-words">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-800 break-words">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-gray-800 break-words">{children}</h3>,
                              strong: ({ children }) => <strong className="font-bold text-gray-900 break-words">{children}</strong>,
                              em: ({ children }) => <em className="italic text-gray-700 break-words">{children}</em>,
                              table: ({ children }) => (
                                <div className="overflow-x-auto mb-2">
                                  <table className="min-w-full text-xs border-collapse border border-gray-300">
                                    {children}
                                  </table>
                                </div>
                              ),
                              thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
                              tbody: ({ children }) => <tbody>{children}</tbody>,
                              tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
                              th: ({ children }) => <th className="border border-gray-300 px-2 py-1 text-left font-semibold">{children}</th>,
                              td: ({ children }) => <td className="border border-gray-300 px-2 py-1 break-words">{children}</td>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {message.query && message.role === 'assistant' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => insertQuery(message.query!)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Insert Query
                            </Button>
                            <Button
                              onClick={() => copyMessage(message.query!)}
                              variant="outline"
                              size="sm"
                              className="text-xs px-3 py-1.5 rounded-lg"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-2 text-xs text-gray-500 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.mode && (
                        <Badge className={`text-xs ${
                          message.mode === 'ask' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {message.mode === 'ask' ? 'Ask' : 'Agentic'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Image 
                      src="/sequatic-flat-white.svg" 
                      alt="Sequatic AI" 
                      width={16} 
                      height={16} 
                      className="drop-shadow-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 p-3 rounded-xl max-w-[85%]">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200" />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-400" />
                        </div>
                        <span>AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </ScrollArea>
      </div>

      {/* Fixed Footer - Input Area */}
      <div className="bg-white rounded-b-xl shadow-lg border border-purple-200/60 border-t-0 backdrop-blur-sm flex-shrink-0">
        <div className="p-4 border-t border-purple-200/30 bg-white/50">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask me anything about SQL${selectedTable ? ` for ${selectedTable}` : ''}...`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm text-sm"
                rows={2}
                disabled={isGenerating}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                ⌘+↵
              </div>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isGenerating}
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                chatMode === 'ask'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {chatMode === 'ask' ? (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-blue-500" />
                  <span>Ask mode: Get direct SQL help</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-purple-500" />
                  <span>Agentic mode: AI analysis & optimization</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
