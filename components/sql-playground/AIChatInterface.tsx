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
import { QueryResult, SqlValue } from '@/lib/sqlite';

interface TableSchema {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: SqlValue;
  pk: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: 'ask' | 'agentic';
  query?: string; // Generated SQL query
  analysisResults?: QueryResult[];
  executedQueries?: Array<{
    query: string;
    result: QueryResult;
  }>;
  conversationId?: string; // Track multi-step conversations
}

interface AIChatInterfaceProps {
  isCollapsed: boolean;
  onQueryGenerated: (query: string) => void;
  selectedTable?: string;
  tableSchema?: TableSchema[];
  databaseId: string;
  databaseName: string;
  tables?: Array<{ name: string }>;
  recentQueries?: string[];
  onTableDataRefresh?: (tableName: string) => void; // New callback for refreshing table data
}

export const AIChatInterface = ({ 
  isCollapsed, 
  onQueryGenerated, 
  selectedTable, 
  tableSchema, 
  databaseId,
  databaseName,
  tables = [],
  recentQueries = [],
  onTableDataRefresh
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
- **Fully autonomous**: Generates queries, executes them locally, and analyzes results
- **Real-time workflow**: Question → SQL Generation → Local Execution → Analysis → Insights
- **Intelligent insights**: Provides detailed analysis based on actual query results
- **Follow-up suggestions**: Recommends related questions and optimizations

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

  const callAIAPI = async (userMessage: string, mode: 'ask' | 'agentic') => {
    const context = {
      databaseId,
      selectedTable: selectedTable || undefined,
      tableSchema: tableSchema || [],
      allTableSchemas: {}, // Will be populated by AI service
      tables,
      recentQueries: recentQueries || [],
      queryResults: []
    };

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          mode,
          context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ details: 'Unknown error' }));
        
        // Special handling for server overload (503)
        if (response.status === 503 || errorData.details?.includes('overloaded')) {
          return {
            content: `🚧 **Gemini servers are busy right now**

The AI service is experiencing high traffic. Here are some things you can try:

**Immediate Options:**
1. Wait 1-2 minutes and try again
2. Use the sample queries below
3. Explore your database manually

**Sample SQL to try:**
\`\`\`sql
SELECT * FROM ${selectedTable || 'your_table'} LIMIT 5;
\`\`\`

${selectedTable ? `
**For table "${selectedTable}":**
\`\`\`sql
-- Count rows
SELECT COUNT(*) as total_rows FROM "${selectedTable}";

-- See structure
PRAGMA table_info("${selectedTable}");

-- Sample data
SELECT * FROM "${selectedTable}" LIMIT 10;
\`\`\`
` : ''}

The service should be back up soon! 🔄`,
            query: selectedTable ? `SELECT * FROM "${selectedTable}" LIMIT 10;` : undefined,
            actionType: 'explanation' as const
          };
        }
        
        // Handle rate limits (429)
        if (response.status === 429) {
          return {
            content: `⏱️ **Rate limit exceeded**

Your API usage has exceeded the current quota. Here's what you can do:

**Immediate Solutions:**
1. **Wait a few minutes** and try again
2. **Upgrade your Gemini API quota** at [Google AI Studio](https://aistudio.google.com/)
3. **Enable billing** on your Google Cloud project

**Meanwhile, try these SQL queries:**
\`\`\`sql
-- Basic exploration
SELECT * FROM ${selectedTable || 'your_table'} LIMIT 5;

-- Count records
SELECT COUNT(*) FROM ${selectedTable || 'your_table'};
\`\`\`

${selectedTable && tableSchema && tableSchema.length > 0 ? `
**Your "${selectedTable}" table structure:**
${tableSchema.map(col => `- \`${col.name}\` (${col.type})${col.pk ? ' [PK]' : ''}${col.notnull ? ' [NOT NULL]' : ''}`).join('\n')}
` : ''}

Try the AI assistant again once your quota resets! 🔄`,
            query: selectedTable ? `SELECT COUNT(*) FROM "${selectedTable}";` : undefined,
            actionType: 'explanation' as const
          };
        }
        
        // Handle API key issues (401)
        if (response.status === 401) {
          return {
            content: `🔑 **API Authentication Error**

There's an issue with your Gemini API key. Please check:

1. **Verify your API key** in the environment variables
2. **Ensure the key is active** at [Google AI Studio](https://aistudio.google.com/)
3. **Restart the development server** after updating the key

**You can still use SQL manually:**
\`\`\`sql
SELECT * FROM ${selectedTable || 'your_table'} LIMIT 10;
\`\`\`

Fix your API key and try again! 🔧`,
            actionType: 'explanation' as const
          };
        }
        
        throw new Error(errorData.details || `AI request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI API Error:', error);
      
      // Check if error is related to server overload or network issues
      if (error instanceof Error) {
        if (error.message.includes('overloaded') || error.message.includes('503')) {
          return {
            content: `🚧 **Service Temporarily Overloaded**

The AI servers are experiencing high traffic right now.

**Quick SQL Help:**
\`\`\`sql
-- Explore your data
SELECT * FROM ${selectedTable || 'your_table'} LIMIT 5;

-- Get table info
PRAGMA table_info("${selectedTable || 'your_table'}");
\`\`\`

**Try again in a few minutes!** The service usually recovers quickly. 🔄`,
            query: selectedTable ? `SELECT * FROM "${selectedTable}" LIMIT 5;` : undefined,
            actionType: 'explanation' as const
          };
        }
        
        if (error.message.includes('fetch') || error.message.includes('network')) {
          return {
            content: `🌐 **Connection Error**

Unable to reach the AI service. This could be due to:

- Network connectivity issues
- Server maintenance
- Firewall restrictions

**You can still work with SQL:**
\`\`\`sql
SELECT * FROM ${selectedTable || 'your_table'} LIMIT 10;
\`\`\`

Check your connection and try again! 🔌`,
            actionType: 'explanation' as const
          };
        }
        
        if (error.message.includes('Rate limit')) {
          return {
            content: `🚫 **Rate Limit Exceeded**

The Gemini API has reached its quota limit. Here are your options:

### Immediate Solutions:
1. **Wait a few minutes** and try again
2. **Upgrade your Gemini API quota** at [Google AI Studio](https://aistudio.google.com/)
3. **Enable billing** on your Google Cloud project

### Meanwhile, here's a helpful SQL response:

${mode === 'ask' ? `For "${userMessage}", here's a general approach:

\`\`\`sql
-- Example query pattern
SELECT * FROM ${selectedTable || 'your_table'} 
WHERE condition = 'value'
ORDER BY column_name;
\`\`\`

**Tips:**
- Always test queries on sample data first
- Use WHERE clauses to filter results
- Consider adding LIMIT for large datasets` : `Analysis request: "${userMessage}"

**Quick Tips:**
- Use COUNT(*) to get row counts
- Try GROUP BY for data aggregation  
- Use MIN/MAX/AVG for statistics
- Consider indexing frequently queried columns`}

*Try again once your API quota is restored!*`,
            query: selectedTable ? `SELECT * FROM "${selectedTable}" LIMIT 10;` : undefined,
            actionType: 'explanation' as const
          };
        }
      }
      
      // Generic error fallback
      return {
        content: `⚠️ **AI Service Temporarily Unavailable**

There was an issue connecting to the AI service.

**You can still use SQL manually:**
- Try basic queries like \`SELECT * FROM ${selectedTable || 'table_name'}\`
- Use the Monaco editor for syntax highlighting
- Check the database schema in the left panel

${selectedTable ? `
**Quick queries for "${selectedTable}":**
\`\`\`sql
SELECT COUNT(*) FROM "${selectedTable}";
SELECT * FROM "${selectedTable}" LIMIT 5;
\`\`\`
` : ''}

Try the AI assistant again in a few minutes! 🔄`,
        query: selectedTable ? `SELECT * FROM "${selectedTable}" LIMIT 5;` : undefined,
        actionType: 'explanation' as const
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
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsGenerating(true);

    try {
      if (chatMode === 'agentic') {
        // NEW: Frontend-only agentic workflow
        await handleAgenticWorkflow(currentMessage);
      } else {
        // Regular ask mode
        const response = await callAIAPI(currentMessage, chatMode);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          mode: chatMode,
          query: response.query,
          analysisResults: response.analysisResults
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Error**: ${error instanceof Error ? error.message : 'Failed to process your request'}
        
Please try again or rephrase your question.`,
        timestamp: new Date(),
        mode: chatMode
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Frontend-only agentic workflow
  const handleAgenticWorkflow = async (userQuestion: string) => {
    try {
      // Step 1: Get SQL query from AI
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '🤖 **Step 1:** Analyzing your question and generating SQL query...',
        timestamp: new Date(),
        mode: 'agentic'
      }]);

      const queryResponse = await callAIAPI(userQuestion, 'ask'); // Use ask mode to get clean SQL
      
      // Extract SQL query from response - IMPROVED EXTRACTION LOGIC
      let sqlQuery: string | undefined;
      
      console.log('Full AI response:', queryResponse.content);
      
      // Method 1: Look for SQL code blocks (most reliable)
      const sqlMatches = queryResponse.content.match(/```sql\n([\s\S]*?)\n```/g);
      if (sqlMatches) {
        sqlQuery = sqlMatches[0].replace(/```sql\n|\n```/g, '').trim();
        console.log('Extracted from code block:', sqlQuery);
      }
      
      // Method 2: Use the query property if available
      if (!sqlQuery && queryResponse.query) {
        sqlQuery = queryResponse.query.trim();
        console.log('Extracted from query property:', sqlQuery);
      }
      
      // Method 3: Look for complete SQL statements in the text
      if (!sqlQuery) {
        const lines = queryResponse.content.split('\n');
        let foundSelectLine = '';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Look for the start of any SQL statement
          if (line.toLowerCase().startsWith('select ') || 
              line.toLowerCase().startsWith('delete ') ||
              line.toLowerCase().startsWith('insert ') ||
              line.toLowerCase().startsWith('update ') ||
              line.toLowerCase().includes('select count(') ||
              line.toLowerCase().includes('delete from ') ||
              line.toLowerCase().includes('insert into ') ||
              line.toLowerCase().includes('update ')) {
            foundSelectLine = line;
            
            // Check if this looks like a complete query
            const isCompleteQuery = line.toLowerCase().includes(' from ') || 
                                   line.toLowerCase().includes(' into ') ||
                                   line.toLowerCase().includes(' set ') ||
                                   line.endsWith(';');
            
            if (isCompleteQuery) {
              sqlQuery = line;
              break;
            } else {
              // Multi-line query - collect following lines
              for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim();
                if (nextLine && !nextLine.startsWith('//') && !nextLine.startsWith('*') && !nextLine.toLowerCase().startsWith('explanation')) {
                  foundSelectLine += ' ' + nextLine;
                  if (nextLine.toLowerCase().includes(' from ') || 
                      nextLine.toLowerCase().includes(' where ') ||
                      nextLine.toLowerCase().includes(' values ') ||
                      nextLine.toLowerCase().includes(' set ') ||
                      nextLine.endsWith(';')) {
                    break;
                  }
                }
              }
              sqlQuery = foundSelectLine;
              break;
            }
          }
        }
        
        if (sqlQuery) {
          console.log('Extracted from text parsing:', sqlQuery);
        }
      }
      
      // Method 4: Advanced pattern matching for all SQL operations
      if (!sqlQuery) {
        // Patterns for different SQL operations
        const patterns = [
          // SELECT queries
          /SELECT\s+[^;]+?FROM\s+[^;]+?(?:WHERE\s+[^;]+?)?(?:;|$)/gi,
          // DELETE queries  
          /DELETE\s+FROM\s+[^;]+?(?:WHERE\s+[^;]+?)?(?:;|$)/gi,
          // INSERT queries
          /INSERT\s+INTO\s+[^;]+?(?:VALUES\s*\([^;]+?\)|\([^;]+?\)\s+VALUES\s*\([^;]+?\)|SELECT\s+[^;]+?)?(?:;|$)/gi,
          // UPDATE queries
          /UPDATE\s+[^;]+?SET\s+[^;]+?(?:WHERE\s+[^;]+?)?(?:;|$)/gi
        ];
        
        for (const pattern of patterns) {
          const match = queryResponse.content.match(pattern);
          if (match && match[0]) {
            sqlQuery = match[0].trim().replace(/;$/, '');
            console.log('Extracted using advanced pattern:', sqlQuery);
            break;
          }
        }
      }

      // Validate that we have a complete SQL query
      const isValidSQL = sqlQuery && 
                        (
                          (sqlQuery.toLowerCase().includes('select') && sqlQuery.toLowerCase().includes('from')) ||
                          (sqlQuery.toLowerCase().includes('delete') && sqlQuery.toLowerCase().includes('from')) ||
                          (sqlQuery.toLowerCase().includes('insert') && sqlQuery.toLowerCase().includes('into')) ||
                          (sqlQuery.toLowerCase().includes('update') && sqlQuery.toLowerCase().includes('set'))
                        ) &&
                        sqlQuery.length > 10; // Basic length check

      if (isValidSQL) {
        console.log('Valid SQL query found:', sqlQuery);
        
        // Clean up the query (remove extra spaces, ensure proper format)
        sqlQuery = sqlQuery!
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim()
          .replace(/;$/, ''); // Remove trailing semicolon for consistency
        
        // Step 2: Execute query on frontend
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🤖 **Step 2:** Executing query to get real data...\n\n\`\`\`sql\n${sqlQuery!}\n\`\`\``,
          timestamp: new Date(),
          mode: 'agentic'
        }]);

        const { sqliteManager } = await import('@/lib/sqlite');
        const queryResults = await sqliteManager.executeQuery(databaseId, sqlQuery!);

        // Save database changes to IndexedDB for persistence
        const { indexedDBManager } = await import('@/lib/indexeddb');
        const dbData = sqliteManager.exportDatabase(databaseId);
        await indexedDBManager.saveDatabase(databaseId, databaseName, dbData);

        // Check if this is a modifying query and refresh table data if needed
        const modifyingKeywords = ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
        const isModifyingQuery = modifyingKeywords.some(keyword => 
          sqlQuery!.toUpperCase().includes(keyword)
        );
        
        if (isModifyingQuery && selectedTable && onTableDataRefresh) {
          // Trigger table data refresh to show immediate changes
          onTableDataRefresh(selectedTable);
        }

        // If it's a CREATE/DROP table query, we should refresh the tables list too
        // For now, this will be handled by the parent component's regular refresh mechanism

        // Step 3: Send results back to AI for analysis
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🤖 **Step 3:** Query executed successfully! Got ${queryResults.values.length} rows. Analyzing results...`,
          timestamp: new Date(),
          mode: 'agentic'
        }]);

        // Create analysis prompt with results
        const analysisPrompt = `Based on the user question: "${userQuestion}"

I executed this SQL query:
\`\`\`sql
${sqlQuery!}
\`\`\`

Results:
- Columns: ${queryResults.columns.join(', ')}
- Rows returned: ${queryResults.values.length}
${queryResults.values.length > 0 ? `- Data: ${queryResults.values.map(row => row.join(' | ')).slice(0, 3).join('\n')}` : '- No data returned'}

Please provide a comprehensive analysis of these results. Answer the user's original question with specific data points and insights. Be specific about the numbers and what they mean.`;

        const analysisResponse = await callAIAPI(analysisPrompt, 'agentic');

        // Step 4: Display final analysis
        const finalMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚡ **Agentic Analysis Complete**

${analysisResponse.content}

---
**Query Executed:**
\`\`\`sql
${sqlQuery!}
\`\`\`

**Results:** ${queryResults.values.length} rows returned`,
          timestamp: new Date(),
          mode: 'agentic',
          query: sqlQuery!,
          executedQueries: [{
            query: sqlQuery!,
            result: queryResults
          }]
        };

        setMessages(prev => [...prev, finalMessage]);
        
      } else {
        console.log('No valid SQL found, forcing query generation');
        
        // Enhanced prompt to force complete SQL generation
        const forceQueryPrompt = `User question: "${userQuestion}"

Generate a COMPLETE executable SQL query to answer this question. The query must:
1. Start with SELECT
2. Include FROM clause with table name
3. Include WHERE clause if filtering is needed
4. Be a single, complete SQL statement

Only respond with the SQL query, nothing else. Make it executable.

Example format: SELECT COUNT(*) FROM table_name WHERE condition = 'value';`;

        const forcedResponse = await callAIAPI(forceQueryPrompt, 'ask');
        
        // Try to extract SQL again with the forced response
        const forcedSqlMatches = forcedResponse.content.match(/```sql\n([\s\S]*?)\n```/g);
        if (forcedSqlMatches) {
          const forcedQuery = forcedSqlMatches[0].replace(/```sql\n|\n```/g, '').trim();
          console.log('Forced query generated:', forcedQuery);
          
          // Validate the forced query
          if (forcedQuery.toLowerCase().includes('select') && 
              forcedQuery.toLowerCase().includes('from')) {
            // Execute the forced query
            sqlQuery = forcedQuery;
            
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: `🤖 **Step 2:** Executing generated query...\n\n\`\`\`sql\n${sqlQuery!}\n\`\`\``,
              timestamp: new Date(),
              mode: 'agentic'
            }]);

            const { sqliteManager } = await import('@/lib/sqlite');
            const queryResults = await sqliteManager.executeQuery(databaseId, sqlQuery!);

            // Save database changes to IndexedDB for persistence
            const { indexedDBManager } = await import('@/lib/indexeddb');
            const dbData = sqliteManager.exportDatabase(databaseId);
            await indexedDBManager.saveDatabase(databaseId, databaseName, dbData);

            // Check if this is a modifying query and refresh table data if needed
            const modifyingKeywords = ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
            const isModifyingQuery = modifyingKeywords.some(keyword => 
              sqlQuery!.toUpperCase().includes(keyword)
            );
            
            if (isModifyingQuery && selectedTable && onTableDataRefresh) {
              // Trigger table data refresh to show immediate changes
              onTableDataRefresh(selectedTable);
            }

            // If it's a CREATE/DROP table query, we should refresh the tables list too
            // For now, this will be handled by the parent component's regular refresh mechanism

            const finalMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: `⚡ **Agentic Analysis Complete**

**Answer:** Based on the query execution, ${queryResults.values.length > 0 ? 
  `the result is: **${queryResults.values[0][0]}**` : 
  'no matching records were found'}.

---
**Query Executed:**
\`\`\`sql
${sqlQuery!}
\`\`\``,
              timestamp: new Date(),
              mode: 'agentic',
              query: sqlQuery!,
              executedQueries: [{
                query: sqlQuery!,
                result: queryResults
              }]
            };

            setMessages(prev => [...prev, finalMessage]);
            return; // Exit the function here
          }
        }
        
        // Last resort - show error
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ **SQL Extraction Failed**

I couldn't extract a complete SQL query from the AI response. 

**Debug info:**
- Original response: "${queryResponse.content.substring(0, 200)}..."
- Query property: "${queryResponse.query || 'none'}"

**This is a bug in the agentic system. The AI should generate complete executable queries.**

**Manual query from AI:**
${queryResponse.content}`,
          timestamp: new Date(),
          mode: 'agentic',
          query: queryResponse.query
        }]);
      }

    } catch (error) {
      console.error('Agentic workflow error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Agentic workflow failed**

Error: ${error instanceof Error ? error.message : 'Unknown error'}

I'll try to help you with a regular response instead.`,
        timestamp: new Date(),
        mode: 'agentic'
      }]);

      // Fallback to regular response
      const fallbackResponse = await callAIAPI(userQuestion, 'ask');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse.content,
        timestamp: new Date(),
        mode: 'agentic',
        query: fallbackResponse.query
      }]);
    }
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
                    Sequatic AI SQL Assistant
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
                      
                      {message.analysisResults && message.analysisResults.length > 0 && (
                        <div className="mt-3 space-y-3">
                          <div className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                            📊 Analysis Results
                          </div>
                          {message.analysisResults.map((result, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="text-sm font-medium text-gray-600 mb-2">
                                Result {index + 1}
                              </div>
                              {result.columns.length > 0 && result.values.length > 0 && (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs border border-gray-300">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        {result.columns.map((col, colIndex) => (
                                          <th key={colIndex} className="border border-gray-300 px-2 py-1 text-left font-semibold">
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.values.slice(0, 10).map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-b border-gray-200">
                                          {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="border border-gray-300 px-2 py-1 break-words">
                                              {cell?.toString() || 'NULL'}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {result.values.length > 10 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      ... and {result.values.length - 10} more rows
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.executedQueries && message.executedQueries.length > 0 && (
                        <div className="mt-3 space-y-3">
                          <div className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 flex items-center gap-2">
                            ⚡ Executed Queries & Results 
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Agentic Mode
                            </span>
                          </div>
                          {message.executedQueries.map((execution, index) => (
                            <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Play className="w-4 h-4 text-green-600" />
                                Automatically Executed Query {index + 1}
                              </div>
                              
                              {/* Query Display */}
                              <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs mb-3 overflow-x-auto">
                                <code>{execution.query}</code>
                              </div>
                              
                              {/* Results Display */}
                              {execution.result.columns.length > 0 && execution.result.values.length > 0 ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-600 mb-2">
                                    📊 Results ({execution.result.values.length} rows):
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs border border-gray-300 bg-white rounded">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          {execution.result.columns.map((col, colIndex) => (
                                            <th key={colIndex} className="border border-gray-300 px-2 py-1 text-left font-semibold">
                                              {col}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {execution.result.values.slice(0, 10).map((row, rowIndex) => (
                                          <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                            {row.map((cell, cellIndex) => (
                                              <td key={cellIndex} className="border border-gray-300 px-2 py-1 break-words">
                                                {cell?.toString() || 'NULL'}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {execution.result.values.length > 10 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        ... and {execution.result.values.length - 10} more rows
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 italic">
                                  Query executed successfully (no data returned)
                                </div>
                              )}
                              
                              {/* Copy Query Button */}
                              <div className="mt-3 flex gap-2">
                                <Button
                                  onClick={() => insertQuery(execution.query)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Insert Query
                                </Button>
                                <Button
                                  onClick={() => copyMessage(execution.query)}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs px-3 py-1.5 rounded-lg"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy Query
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.query && message.role === 'assistant' && !message.executedQueries && (
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
                  <span>Agentic mode: Autonomous query execution & analysis</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
