# 🤖 AI Integration Guide - Sequatic

## Overview

Sequatic now features a powerful AI assistant powered by Google's Gemini AI, integrated directly into the SQL playground. The AI provides two distinct modes for different use cases.

## 🚀 Setup Instructions

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment
Add your API key to `.env.local`:
```bash
GOOGLE_AI_API_KEY="your_gemini_api_key_here"
```

### 3. Test the Integration
1. Start the development server: `npm run dev`
2. Navigate to the SQL playground
3. Load the sample database using `sample-database.sql`
4. Start chatting with the AI assistant!

## 🎯 AI Modes

### 🤖 Ask Mode
**Perfect for**: Learning, quick questions, and SQL help

**Features**:
- Direct SQL query generation
- Educational explanations
- Best practices guidance
- Query optimization tips
- Syntax help

**Example Questions**:
- "How do I join two tables?"
- "Generate a query to find users who made orders in the last 30 days"
- "What's the difference between INNER JOIN and LEFT JOIN?"

### ⚡ Agentic Mode
**Perfect for**: Data analysis, insights, and advanced database exploration

**Features**:
- **Real database analysis** - AI can read and analyze your actual data
- Performance recommendations
- Data pattern recognition
- Statistical insights
- Automated query execution for analysis

**Example Requests**:
- "Analyze the users table and give me insights"
- "What are the sales trends in my orders data?"
- "Find patterns in product categories and sales"
- "Suggest database optimizations"

## 🔧 Key Features

### Query Generation & Execution
- AI generates contextually relevant SQL queries
- **"Insert Query" button** - Directly adds AI-generated queries to your editor
- Copy queries to clipboard
- Query validation and optimization

### Database-Aware Analysis (Agentic Mode)
- AI can execute `SELECT` queries on your database
- Real-time data analysis and insights
- Statistical summaries and patterns
- Data visualization in chat

### Conversation Context
- AI remembers your current database schema
- Context-aware suggestions based on selected tables
- Query history integration

## 📊 Sample Test Scenarios

### 1. Basic Query Generation (Ask Mode)
```
User: "Show me all active users"
AI Response: Generates SELECT query with explanation
```

### 2. Data Analysis (Agentic Mode)
```
User: "Analyze the orders table"
AI Response: 
- Executes analytical queries
- Shows data distribution
- Provides insights and recommendations
- Displays results in formatted tables
```

### 3. Performance Optimization
```
User: "How can I optimize queries on the products table?"
AI Response: 
- Analyzes table structure
- Suggests indexes
- Recommends query patterns
- Shows performance tips
```

## 🛡️ Security Features

- **Query Validation**: Only `SELECT` queries allowed in agentic mode
- **Read-only Analysis**: AI cannot modify your data
- **Error Handling**: Graceful handling of API failures
- **Rate Limiting**: Built-in protection against API abuse

## 🎨 UI Features

### Chat Interface
- **Dual-mode toggle**: Switch between Ask and Agentic modes
- **Markdown support**: Rich formatting for AI responses
- **Code highlighting**: SQL queries beautifully formatted
- **Analysis tables**: Structured display of data analysis results
- **Responsive design**: Works on all screen sizes

### Integration Points
- **Monaco Editor**: Direct query insertion
- **Table Explorer**: AI knows your selected tables
- **Schema Awareness**: AI understands your database structure

## 🔧 Technical Architecture

### Backend Components
- **`/lib/ai-service.ts`**: Core AI service with Gemini integration
- **`/app/api/ai/chat/route.ts`**: API endpoint for AI requests
- **Database Functions**: Integration with existing SQLite manager

### Frontend Components
- **`AIChatInterface.tsx`**: Main chat interface
- **Query Integration**: Seamless editor integration
- **Result Display**: Rich formatting for analysis results

### Data Flow
1. User types message in chat
2. AI service processes with database context
3. Gemini generates response
4. Agentic mode can execute analysis queries
5. Results displayed with rich formatting

## 🚨 Troubleshooting

### Common Issues

**1. API Key Not Working**
- Verify the key is correct in `.env.local`
- Restart the development server
- Check console for error messages

**2. AI Not Responding**
- Check internet connection
- Verify Gemini API quota
- Look for error messages in chat

**3. Analysis Not Working**
- Ensure you're in Agentic mode
- Select a table first
- Try simple analysis requests

### Debug Mode
Check browser console for detailed error logs:
```javascript
// Open browser dev tools and check console
console.log('AI Error:', error);
```

## 🌟 Best Practices

### For Ask Mode
- Be specific about what you want to learn
- Ask for explanations along with queries
- Request examples and use cases

### For Agentic Mode
- Select relevant tables before asking for analysis
- Use descriptive analysis requests
- Ask for specific types of insights

### Query Integration
- Always review AI-generated queries before execution
- Test queries on sample data first
- Use the "Insert Query" button for convenience

## 🔮 Future Enhancements

The AI integration is designed to be extensible. Planned features include:

- **Advanced Function Calling**: More sophisticated analysis functions
- **Query Optimization**: Automatic performance analysis
- **Schema Generation**: AI-assisted database design
- **Export Features**: Save analysis results
- **Custom Prompts**: User-defined AI behaviors

## 📖 Example Usage

### Sample Database Setup
```sql
-- Use the provided sample-database.sql file
-- Contains users, products, and orders tables
-- Perfect for testing AI features
```

### Example Conversations

**Ask Mode:**
```
User: "How do I find the top 5 best-selling products?"
AI: Provides query with explanation and best practices
```

**Agentic Mode:**
```
User: "What insights can you give me about customer behavior?"
AI: Analyzes orders table, shows patterns, provides recommendations
```

---

## 🎉 Ready to Get Started!

1. Add your Gemini API key to `.env.local`
2. Load the sample database
3. Start exploring with the AI assistant
4. Try both Ask and Agentic modes
5. Experiment with different types of questions

The AI assistant is your companion for SQL learning, data analysis, and database optimization. Have fun exploring your data! 🚀
