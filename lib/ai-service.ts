import { GoogleGenerativeAI } from '@google/generative-ai';

// Import types for server-side usage
import type { SqlValue, QueryResult } from './sqlite';

export interface TableSchema {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: SqlValue;
  pk: number;
}

export interface AIContext {
  databaseId: string;
  selectedTable?: string;
  tableSchema: TableSchema[]; // Schema for selected table only
  allTableSchemas: Record<string, TableSchema[]>; // All table schemas
  tables: Array<{ name: string }>;
  recentQueries: string[];
  queryResults: QueryResult[];
  conversationId?: string; // Track conversation state
  step?: 'initial' | 'awaiting_execution' | 'analyzing_results'; // Conversation step
}

export interface AIResponse {
  content: string;
  query?: string;
  analysisResults?: QueryResult[];
  executedQueries?: Array<{
    query: string;
    result: QueryResult;
  }>;
  actionType: 'query' | 'analysis' | 'explanation';
}

export interface AnalysisFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface EnhancedTableSchema {
  columns: TableSchema[];
  foreignKeys: Array<{
    from: string;
    toTable: string;
    toColumn: string;
  }>;
  indexes: unknown[];
}

class AIService {
  private genAI?: GoogleGenerativeAI;
  private model?: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;
  private isInitialized: boolean = false;

  constructor() {
    // Don't initialize immediately to avoid server-side issues
    this.initializeAsync().catch(error => {
      console.error('AI service initialization failed:', error);
    });
  }

  private async initializeAsync() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        console.warn('Google AI API key not found. AI features will be limited.');
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.3, // Lower for more consistent SQL generation
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      // Don't throw here, just log the error
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized || !this.model) {
      await this.initializeAsync();
      if (!this.isInitialized || !this.model) {
        throw new Error('AI service is not properly initialized. Please check your API key.');
      }
    }
  }

  private getAnalysisFunctions(): AnalysisFunction[] {
    return [
      {
        name: "analyzeTable",
        description: "Analyze a specific table to get statistics, data distribution, and insights",
        parameters: {
          type: "object",
          properties: {
            tableName: {
              type: "string",
              description: "Name of the table to analyze"
            },
            analysisType: {
              type: "string",
              enum: ["basic", "detailed", "distribution", "summary"],
              description: "Type of analysis to perform"
            }
          },
          required: ["tableName"]
        }
      },
      {
        name: "executeAnalysisQuery",
        description: "Execute a specific SQL query for data analysis (read-only operations)",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "SQL query to execute for analysis"
            },
            purpose: {
              type: "string",
              description: "Purpose or goal of this analysis query"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "getTableSample",
        description: "Get a sample of data from a table for analysis",
        parameters: {
          type: "object",
          properties: {
            tableName: {
              type: "string",
              description: "Name of the table to sample"
            },
            limit: {
              type: "number",
              description: "Number of rows to sample (default: 10)"
            }
          },
          required: ["tableName"]
        }
      },
      {
        name: "compareTables",
        description: "Compare structure or data between multiple tables",
        parameters: {
          type: "object",
          properties: {
            tables: {
              type: "array",
              items: { type: "string" },
              description: "Names of tables to compare"
            },
            comparisonType: {
              type: "string",
              enum: ["structure", "data", "both"],
              description: "Type of comparison to perform"
            }
          },
          required: ["tables"]
        }
      }
    ];
  }

  private async executeAnalysisFunction(
    functionName: string, 
    parameters: Record<string, unknown>, 
    context: AIContext
  ): Promise<QueryResult[]> {
    // Analysis functions only work on client side
    if (typeof window === 'undefined') {
      return [];
    }
    
    const { sqliteManager } = await import('./sqlite');
    const { databaseId } = context;
    
    try {
      switch (functionName) {
        case 'analyzeTable':
          const tableName = parameters.tableName as string;
          const analysisType = (parameters.analysisType as string) || 'basic';
          return await this.analyzeTable(databaseId, tableName, analysisType);
        
        case 'executeAnalysisQuery':
          // Validate that query is read-only (starts with SELECT)
          const queryStr = parameters.query as string;
          const query = queryStr.trim().toUpperCase();
          if (!query.startsWith('SELECT') && !query.startsWith('WITH')) {
            throw new Error('Only SELECT queries are allowed for analysis');
          }
          const result = await sqliteManager.executeQuery(databaseId, queryStr);
          return [result];
        
        case 'getTableSample':
          const sampleTableName = parameters.tableName as string;
          const limit = (parameters.limit as number) || 10;
          const sampleResult = await sqliteManager.executeQuery(
            databaseId,
            `SELECT * FROM "${sampleTableName}" LIMIT ${limit}`
          );
          return [sampleResult];
        
        case 'compareTables':
          const tables = parameters.tables as string[];
          const comparisonType = (parameters.comparisonType as string) || 'structure';
          return await this.compareTables(databaseId, tables, comparisonType);
        
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`Error executing ${functionName}:`, error);
      throw error;
    }
  }

  private async analyzeTable(databaseId: string, tableName: string, analysisType: string): Promise<QueryResult[]> {
    // Only works on client side
    if (typeof window === 'undefined') {
      return [];
    }
    
    const { sqliteManager } = await import('./sqlite');
    const results: QueryResult[] = [];
    
    // Basic table info
    const countResult = await sqliteManager.executeQuery(
      databaseId,
      `SELECT COUNT(*) as row_count FROM "${tableName}"`
    );
    results.push(countResult);

    if (analysisType === 'detailed' || analysisType === 'distribution') {
      // Get column statistics
      const schemaResult = await sqliteManager.executeQuery(
        databaseId,
        `PRAGMA table_info("${tableName}")`
      );
      results.push(schemaResult);

      // Sample data for distribution analysis
      if (analysisType === 'distribution') {
        const sampleResult = await sqliteManager.executeQuery(
          databaseId,
          `SELECT * FROM "${tableName}" LIMIT 100`
        );
        results.push(sampleResult);
      }
    }

    return results;
  }

  private async compareTables(databaseId: string, tables: string[], comparisonType: string): Promise<QueryResult[]> {
    // Only works on client side
    if (typeof window === 'undefined') {
      return [];
    }
    
    const { sqliteManager } = await import('./sqlite');
    const results: QueryResult[] = [];
    
    for (const table of tables) {
      if (comparisonType === 'structure' || comparisonType === 'both') {
        const schemaResult = await sqliteManager.executeQuery(
          databaseId,
          `PRAGMA table_info("${table}")`
        );
        results.push({
          ...schemaResult,
          columns: ['table_name', ...schemaResult.columns],
          values: schemaResult.values.map((row: SqlValue[]) => [table, ...row])
        });
      }
      
      if (comparisonType === 'data' || comparisonType === 'both') {
        const countResult = await sqliteManager.executeQuery(
          databaseId,
          `SELECT '${table}' as table_name, COUNT(*) as row_count FROM "${table}"`
        );
        results.push(countResult);
      }
    }
    
    return results;
  }

  // Add function to execute SQL queries for agentic mode
  private async executeSQLQuery(databaseId: string, query: string): Promise<QueryResult> {
    // Only works on client side
    if (typeof window === 'undefined') {
      throw new Error('SQL execution is only available on the client side');
    }
    
    const { sqliteManager } = await import('./sqlite');
    
    try {
      const result = await sqliteManager.executeQuery(databaseId, query);
      return result;
    } catch (error) {
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper function to determine if a question requires data analysis/query execution
  private requiresDataAnalysis(message: string): boolean {
    const analysisKeywords = [
      'how many', 'count', 'total', 'sum', 'average', 'mean', 'max', 'min',
      'show me', 'list', 'find', 'get', 'display', 'what are', 'which',
      'largest', 'smallest', 'highest', 'lowest', 'most', 'least',
      'between', 'greater than', 'less than', 'equal to', 'contains',
      'like', 'similar', 'where', 'having', 'group by', 'order by',
      'recent', 'latest', 'oldest', 'first', 'last', 'top', 'bottom'
    ];
    
    const lowerMessage = message.toLowerCase();
    return analysisKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // New method to analyze query results and provide natural language insights
  async analyzeQueryResults(
    originalQuestion: string,
    executedQuery: string,
    queryResults: QueryResult,
    context: AIContext
  ): Promise<AIResponse> {
    await this.ensureInitialized();

    if (!this.model) {
      return {
        content: `**Query Results Analysis**

I was unable to analyze the results due to AI service issues. However, here's what was executed:

\`\`\`sql
${executedQuery}
\`\`\`

**Results Summary:**
- Columns: ${queryResults.columns.join(', ')}
- Rows returned: ${queryResults.values.length}

The query executed successfully and returned ${queryResults.values.length} rows of data.`,
        actionType: 'analysis'
      };
    }

    // Build comprehensive context for analysis
    const systemPrompt = this.buildSystemPrompt('agentic', context);
    
    // Format results for AI analysis
    const resultsPreview = queryResults.values.length > 0 
      ? queryResults.values.slice(0, 20).map(row => 
          row.map(cell => cell?.toString() || 'NULL').join(' | ')
        ).join('\n')
      : 'No data returned';

    const analysisPrompt = `${systemPrompt}

QUERY RESULT ANALYSIS TASK:

Original User Question: "${originalQuestion}"

Executed SQL Query:
\`\`\`sql
${executedQuery}
\`\`\`

Query Results:
- Columns: ${queryResults.columns.join(', ')}
- Total Rows: ${queryResults.values.length}
- Sample Data (first 20 rows):
${resultsPreview}
${queryResults.values.length > 20 ? `... and ${queryResults.values.length - 20} more rows` : ''}

INSTRUCTIONS:
1. Answer the original user question based on the actual query results
2. Provide key insights and findings from the data
3. Explain what the numbers/data mean in business context
4. Suggest follow-up questions or related analyses
5. Be specific and reference actual data values
6. If the results are empty, explain why and suggest alternatives

Format your response in a natural, conversational way as if you're a data analyst explaining findings.`;

    try {
      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      const content = response.text();

      return {
        content,
        query: executedQuery,
        executedQueries: [{
          query: executedQuery,
          result: queryResults
        }],
        actionType: 'analysis'
      };
    } catch (error) {
      console.error('Result analysis error:', error);
      
      // Fallback analysis
      const fallbackContent = `**Query Results Analysis**

Based on your question "${originalQuestion}", I executed:

\`\`\`sql
${executedQuery}
\`\`\`

**Results:**
- **${queryResults.values.length}** rows returned
- **Columns:** ${queryResults.columns.join(', ')}

${queryResults.values.length > 0 ? 
  `**Key Findings:**
${queryResults.values.slice(0, 5).map((row, i) => 
  `${i + 1}. ${queryResults.columns.map((col, j) => `${col}: ${row[j]}`).join(', ')}`
).join('\n')}

${queryResults.values.length > 5 ? `... and ${queryResults.values.length - 5} more results` : ''}` :
  '**No data found** - The query executed successfully but returned no results. You might want to check your filter conditions or try a broader search.'
}

The query executed successfully and provides insights into your database.`;

      return {
        content: fallbackContent,
        query: executedQuery,
        executedQueries: [{
          query: executedQuery,
          result: queryResults
        }],
        actionType: 'analysis'
      };
    }
  }

  private buildSystemPrompt(mode: 'ask' | 'agentic', context: AIContext): string {
    const basePrompt = `You are Sequatic AI, an expert SQL assistant integrated into a web-based SQLite playground. You help users write SQL queries, analyze databases, and understand their data.

Current Database Context:
- Database ID: ${context.databaseId}
- Available Tables: ${context.tables.map(t => t.name).join(', ') || 'None'}
- Selected Table: ${context.selectedTable || 'None'}

${Object.keys(context.allTableSchemas).length > 0 ? `
Complete Database Schema:
${Object.entries(context.allTableSchemas).map(([tableName, schema]) => 
  `Table "${tableName}":
${schema.map(col => `  • ${col.name} (${col.type})${col.pk ? ' [PRIMARY KEY]' : ''}${col.notnull ? ' [NOT NULL]' : ''}`).join('\n')}`
).join('\n\n')}
` : ''}

${context.selectedTable && context.tableSchema.length > 0 ? `
Currently Selected Table "${context.selectedTable}":
${context.tableSchema.map(col => `  • ${col.name} (${col.type})${col.pk ? ' [PRIMARY KEY]' : ''}${col.notnull ? ' [NOT NULL]' : ''}`).join('\n')}
` : ''}

Guidelines:
- Always provide helpful, accurate SQL advice
- Generate syntactically correct SQLite queries
- Use the complete database schema to suggest JOINs and relationships
- Explain complex concepts clearly
- Be concise but thorough
- Focus on best practices and optimization`;

    if (mode === 'ask') {
      return `${basePrompt}

Mode: ASK - Direct SQL help and query generation
- Provide direct answers to SQL questions
- Generate queries based on user requests
- Offer explanations and learning resources
- Focus on education and instruction`;
    } else {
      return `${basePrompt}

Mode: AGENTIC - Advanced database analysis and insights
- You are truly autonomous and can execute SQL queries automatically
- When users ask questions that require data, generate AND execute the appropriate SQL queries
- Provide actual answers based on executed query results, not just query suggestions
- Use function calls to gather data when needed
- Make recommendations for optimization based on real data analysis
- Execute queries in the background to provide comprehensive answers

IMPORTANT FOR AGENTIC MODE:
- When a user asks "how many flights have capacity larger than 300", you should:
  1. Generate the SQL query: SELECT COUNT(*) FROM flights WHERE capacity > 300
  2. Execute the query automatically using the execute_sql function
  3. Provide the actual count in your response
  4. Include insights about the result

Available Functions:
- execute_sql(query): Execute any SQL query and get real results
- ${this.getAnalysisFunctions().map(f => f.name).join(', ')}

Function Definitions:
{
  "execute_sql": {
    "description": "Execute a SQL query and return the actual results",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "The SQL query to execute"
        }
      },
      "required": ["query"]
    }
  }
}`;
    }
  }

  private async getAllTableSchemas(databaseId: string, tables: Array<{ name: string }>): Promise<Record<string, TableSchema[]>> {
    const allSchemas: Record<string, TableSchema[]> = {};
    
    // Only works on client side
    if (typeof window === 'undefined') {
      return allSchemas;
    }
    
    try {
      const { sqliteManager } = await import('./sqlite');
      for (const table of tables) {
        try {
          const schema = await sqliteManager.getTableSchema(databaseId, table.name);
          allSchemas[table.name] = schema;
        } catch (error) {
          console.warn(`Failed to get schema for table ${table.name}:`, error);
          // Continue with other tables even if one fails
        }
      }
    } catch (error) {
      console.error('Failed to fetch table schemas:', error);
    }
    
    return allSchemas;
  }

  private async getEnhancedSchemaInfo(databaseId: string, tables: Array<{ name: string }>): Promise<Record<string, EnhancedTableSchema>> {
    const enhancedSchemas: Record<string, EnhancedTableSchema> = {};
    
    // Only works on client side
    if (typeof window === 'undefined') {
      return enhancedSchemas;
    }
    
    try {
      const { sqliteManager } = await import('./sqlite');
      for (const table of tables) {
        try {
          // Get basic schema
          const schema = await sqliteManager.getTableSchema(databaseId, table.name);
          
          // Get foreign key information
          const foreignKeys = await sqliteManager.executeQuery(
            databaseId,
            `PRAGMA foreign_key_list("${table.name}")`
          );
          
          // Get indexes for better understanding of relationships
          const indexes = await sqliteManager.executeQuery(
            databaseId,
            `PRAGMA index_list("${table.name}")`
          );
          
          enhancedSchemas[table.name] = {
            columns: schema,
            foreignKeys: foreignKeys.values.map((row: SqlValue[]) => ({
              from: String(row[3] || ''),
              toTable: String(row[2] || ''),
              toColumn: String(row[4] || '')
            })),
            indexes: indexes.values
          };
        } catch (error) {
          console.warn(`Failed to get enhanced schema for ${table.name}:`, error);
          enhancedSchemas[table.name] = { columns: [], foreignKeys: [], indexes: [] };
        }
      }
    } catch (error) {
      console.error('Failed to fetch enhanced table schemas:', error);
    }
    
    return enhancedSchemas;
  }

  private buildDataPopulationPrompt(context: AIContext): string {
    const schemaInfo = Object.entries(context.allTableSchemas)
      .map(([tableName, schema]) => {
        const columns = schema.map(col => {
          const constraints = [];
          if (col.pk) constraints.push('PRIMARY KEY');
          if (col.notnull) constraints.push('NOT NULL');
          return `    ${col.name} ${col.type}${constraints.length ? ' (' + constraints.join(', ') + ')' : ''}`;
        }).join('\n');
        
        return `TABLE: ${tableName}\n${columns}`;
      }).join('\n\n');

    return `You are a SQL data generation expert. Create INSERT statements to populate ALL tables with realistic dummy data.

DATABASE SCHEMA:
${schemaInfo}

REQUIREMENTS:
1. Generate 5-10 rows per table
2. Maintain referential integrity (foreign keys must reference existing primary keys)
3. Use realistic sample data appropriate for each column type
4. Insert data in the correct order (parent tables before child tables)
5. For ID fields, use sequential integers starting from 1
6. For foreign keys, reference actual IDs from parent tables

IMPORTANT RULES:
- Start with tables that have no foreign key dependencies
- Then populate tables that reference the previously populated tables
- Use realistic names, emails, dates, and other data
- Ensure all NOT NULL constraints are satisfied
- Format as executable SQL statements

Generate the complete set of INSERT statements:`;
  }

  async processMessage(
    message: string,
    mode: 'ask' | 'agentic',
    context: AIContext
  ): Promise<AIResponse> {
    // Ensure AI service is initialized
    await this.ensureInitialized();

    // Check if this is a data population request
    const isDataPopulationRequest = message.toLowerCase().includes('populate') || 
                                   message.toLowerCase().includes('dummy data') ||
                                   message.toLowerCase().includes('insert data') ||
                                   message.toLowerCase().includes('sample data');

    // Enhance context with all table schemas for comprehensive AI analysis
    const enhancedContext = {
      ...context,
      allTableSchemas: context.allTableSchemas || await this.getAllTableSchemas(context.databaseId, context.tables)
    };

    if (!this.model) {
      return this.getFallbackResponse(message, mode, enhancedContext);
    }

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let prompt: string;
        
        if (isDataPopulationRequest && Object.keys(enhancedContext.allTableSchemas).length > 0) {
          // Use specialized prompt for data population
          prompt = this.buildDataPopulationPrompt(enhancedContext) + `\n\nUser Request: ${message}`;
          
          const result = await this.model!.generateContent(prompt);
          const response = await result.response;
          const content = response.text();

          // Extract SQL queries from the response
          const sqlMatches = content.match(/```sql\n([\s\S]*?)\n```/g);
          const query = sqlMatches ? sqlMatches[0].replace(/```sql\n|\n```/g, '').trim() : undefined;

          return {
            content,
            query,
            actionType: 'query' // Data population is a query action
          };
        } else {
          // Use regular system prompt
          const systemPrompt = this.buildSystemPrompt(mode, enhancedContext);
          
          if (mode === 'ask') {
            // Simple Q&A mode - no function calling
            prompt = `${systemPrompt}

User Question: ${message}

Please provide a helpful response. If generating SQL queries, format them properly and explain what they do.`;

            const result = await this.model!.generateContent(prompt);
            const response = await result.response;
            const content = response.text();

            // Extract SQL queries from the response
            const sqlMatches = content.match(/```sql\n([\s\S]*?)\n```/g);
            const query = sqlMatches ? sqlMatches[0].replace(/```sql\n|\n```/g, '').trim() : undefined;

            return {
              content,
              query,
              actionType: 'explanation'
            };
          } else {
            // Agentic mode - Generate comprehensive response (execution happens on frontend)
            prompt = `${systemPrompt}

User Request: ${message}

For agentic mode, provide a comprehensive response with insights, analysis, and recommendations based on the database schema. If this requires data analysis, generate appropriate SQL queries but focus on providing intelligent insights about what the query would reveal and how to interpret the results.`;

            const result = await this.model!.generateContent(prompt);
            const response = await result.response;
            const content = response.text();

            // Extract SQL queries from response if any
            const sqlMatches = content.match(/```sql\n([\s\S]*?)\n```/g);
            const query = sqlMatches ? sqlMatches[0].replace(/```sql\n|\n```/g, '').trim() : undefined;

            return {
              content,
              query,
              actionType: 'explanation'
            };
          }
        }
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Check if it's a server overload error (503) or rate limit (429)
        if (lastError.message.includes('503') || 
            lastError.message.includes('overloaded') ||
            lastError.message.includes('Service Unavailable') ||
            lastError.message.includes('429') || 
            lastError.message.includes('RATE_LIMIT_EXCEEDED')) {
          
          console.log(`Attempt ${attempt}/${maxRetries}: Gemini servers ${lastError.message.includes('503') ? 'overloaded' : 'rate limited'}, retrying...`);
          
          if (attempt < maxRetries) {
            // Wait with exponential backoff: 2^attempt seconds
            const waitTime = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          } else {
            // All retries failed, return helpful fallback
            return {
              content: lastError.message.includes('503') ? 
                this.getServerOverloadFallback(message, mode, context) :
                this.getRateLimitFallback(message, mode, context),
              query: this.getSuggestedQuery(context),
              actionType: 'explanation'
            };
          }
        } else {
          // Different error, don't retry
          throw lastError;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError!;
  }

  private getFallbackResponse(message: string, mode: 'ask' | 'agentic', context: AIContext): AIResponse {
    return {
      content: `⚠️ **AI Service Initialization Failed**

The AI assistant couldn't be initialized properly. You can still use SQL manually:

${mode === 'ask' ? this.getAskModeFallback(message, context) : this.getAgenticModeFallback(message, context)}

Please check your API configuration and try again.`,
      query: this.getSuggestedQuery(context),
      actionType: 'explanation'
    };
  }

  private getServerOverloadFallback(message: string, mode: 'ask' | 'agentic', context: AIContext): string {
    return `🚧 **Gemini servers are currently experiencing high traffic**

I'm unable to process your request right now due to server overload, but here's what I can help you with:

${mode === 'ask' ? this.getAskModeFallback(message, context) : this.getAgenticModeFallback(message, context)}

**Please try again in a few minutes when the servers are less busy.** 🔄`;
  }

  private getRateLimitFallback(message: string, mode: 'ask' | 'agentic', context: AIContext): string {
    return `⏱️ **Rate limit exceeded - API quota reached**

Your API usage has exceeded the current quota. Here's what you can do:

**Immediate help:**
${mode === 'ask' ? this.getAskModeFallback(message, context) : this.getAgenticModeFallback(message, context)}

**Long-term solutions:**
- Upgrade your Gemini API quota at [Google AI Studio](https://aistudio.google.com/)
- Enable billing on your Google Cloud project
- Wait for the quota to reset (usually hourly)`;
  }

  private getAskModeFallback(message: string, context: AIContext): string {
    const lowerMessage = message.toLowerCase();
    const selectedTable = context.selectedTable || 'your_table';
    
    if (lowerMessage.includes('select') || lowerMessage.includes('query') || lowerMessage.includes('show')) {
      return `📝 **Basic SELECT Query Help:**
      
\`\`\`sql
SELECT column1, column2 
FROM ${selectedTable} 
WHERE condition;
\`\`\`

**Common patterns:**
- \`SELECT * FROM ${selectedTable}\` - Get all data
- \`SELECT COUNT(*) FROM ${selectedTable}\` - Count rows
- \`WHERE column = 'value'\` - Filter results
- \`ORDER BY column ASC/DESC\` - Sort results
- \`LIMIT 10\` - Limit results`;
    }
    
    if (lowerMessage.includes('join')) {
      return `🔗 **JOIN Query Help:**
      
\`\`\`sql
SELECT t1.column, t2.column
FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.foreign_key;
\`\`\`

**JOIN types:**
- \`INNER JOIN\` - Only matching records
- \`LEFT JOIN\` - All records from left table
- \`RIGHT JOIN\` - All records from right table
- \`FULL OUTER JOIN\` - All records from both tables`;
    }

    if (lowerMessage.includes('insert') || lowerMessage.includes('add') || lowerMessage.includes('create')) {
      return `➕ **INSERT Query Help:**
      
\`\`\`sql
INSERT INTO ${selectedTable} (column1, column2) 
VALUES ('value1', 'value2');
\`\`\`

**Multiple rows:**
\`\`\`sql
INSERT INTO ${selectedTable} (column1, column2) 
VALUES 
  ('value1', 'value2'),
  ('value3', 'value4');
\`\`\``;
    }
    
    return `💡 **Common SQL Operations:**

**Basic Queries:**
- \`SELECT * FROM ${selectedTable}\`
- \`SELECT COUNT(*) FROM ${selectedTable}\`
- \`SELECT DISTINCT column FROM ${selectedTable}\`

**Filtering & Sorting:**
- \`WHERE column = 'value'\`
- \`WHERE column LIKE '%pattern%'\`
- \`ORDER BY column ASC/DESC\`
- \`LIMIT 10\``;
  }

  private getAgenticModeFallback(message: string, context: AIContext): string {
    const selectedTable = context.selectedTable || 'your_table';
    const tablesList = context.tables.map(t => t.name).join(', ');
    const hasSchemas = Object.keys(context.allTableSchemas || {}).length > 0;
    
    return `📊 **Database Analysis (Offline Mode)**

**Your Database Context:**
- **Tables:** ${tablesList || 'None loaded'}
- **Selected Table:** ${context.selectedTable || 'None'}

${hasSchemas ? `
**Available Table Structures:**
${Object.entries(context.allTableSchemas).slice(0, 3).map(([tableName, schema]) => 
  `• **${tableName}**: ${schema.slice(0, 3).map(col => col.name).join(', ')}${schema.length > 3 ? '...' : ''}`
).join('\n')}
${Object.keys(context.allTableSchemas).length > 3 ? '• ...and more tables' : ''}
` : ''}

**Suggested Analysis Queries:**
\`\`\`sql
-- Table overview
SELECT COUNT(*) as total_rows FROM ${selectedTable};

-- Data sample
SELECT * FROM ${selectedTable} LIMIT 10;

${hasSchemas && Object.keys(context.allTableSchemas).length > 1 ? `
-- Cross-table analysis (example)
SELECT t1.*, t2.*
FROM ${Object.keys(context.allTableSchemas)[0]} t1
JOIN ${Object.keys(context.allTableSchemas)[1]} t2 ON t1.id = t2.id;
` : ''}
\`\`\`

**Try these analysis approaches:**
- Count records in each table
- Check for data quality issues
- Look for relationships between tables
- Analyze data distributions

-- Column statistics (if numeric columns exist)
SELECT 
  COUNT(*) as total_rows,
  COUNT(DISTINCT id) as unique_ids
FROM ${selectedTable};
\`\`\`

${context.selectedTable && context.tableSchema.length > 0 ? `
**Your Table Schema (${context.selectedTable}):**
${context.tableSchema.map(col => `- \`${col.name}\` (${col.type})${col.pk ? ' [PRIMARY KEY]' : ''}${col.notnull ? ' [NOT NULL]' : ''}`).join('\n')}
` : ''}

Try these queries to explore your data while the AI servers recover! 🔍`;
  }

  private getSuggestedQuery(context: AIContext): string | undefined {
    if (!context.selectedTable) {
      if (context.tables.length > 0) {
        return `SELECT name FROM sqlite_master WHERE type='table';`;
      }
      return undefined;
    }
    
    // If we have schema information, create a more intelligent query
    const tableSchema = context.allTableSchemas?.[context.selectedTable] || context.tableSchema;
    if (tableSchema && tableSchema.length > 0) {
      const columns = tableSchema.slice(0, 3).map(col => col.name).join(', ');
      return `SELECT ${columns} FROM "${context.selectedTable}" LIMIT 10;`;
    }
    
    // Fallback to basic query
    return `SELECT * FROM "${context.selectedTable}" LIMIT 10;`;
  }

  private shouldPerformAnalysis(message: string, context: AIContext): boolean {
    const analysisKeywords = [
      'analyze', 'analysis', 'statistics', 'stats', 'distribution', 'summary',
      'insight', 'pattern', 'trend', 'overview', 'examine', 'investigate',
      'compare', 'count', 'average', 'sum', 'min', 'max', 'median'
    ];
    
    const lowerMessage = message.toLowerCase();
    return analysisKeywords.some(keyword => lowerMessage.includes(keyword)) && 
           context.selectedTable !== null;
  }
}

export const aiService = new AIService();
