# 🚀 Sequatic - AI-Powered SQL Playground

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WebAssembly-003B57)](https://sqlite.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Integrated-4285f4)](https://ai.google.dev/)

A modern, browser-based SQL playground with **AI-powered assistance** for learning, analyzing, and optimizing databases.

## ✨ Features

### 🎯 Core Features
- **In-Browser SQLite**: Full SQLite database in your browser using WebAssembly
- **Monaco Editor**: Professional code editor with SQL syntax highlighting
- **Real-time Results**: Execute queries and see results instantly
- **Multi-database Support**: Create and manage multiple databases
- **Data Visualization**: Interactive tables with sorting, filtering, and pagination

### 🤖 AI Assistant (NEW!)
- **Dual-Mode AI**: Ask mode for learning, Agentic mode for analysis
- **Smart Query Generation**: Context-aware SQL query creation
- **Real Database Analysis**: AI can read and analyze your actual data
- **Performance Insights**: Optimization recommendations and best practices
- **One-Click Integration**: Insert AI-generated queries directly into editor

### 🛡️ Additional Features
- **Authentication**: Secure user sessions with NextAuth.js
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark/Light Themes**: Multiple editor themes to choose from
- **Export/Import**: Save and load your databases
- **Sample Data**: Pre-built sample databases for testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google AI Studio API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/maasir554/sequatic.git
cd sequatic
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
# Edit .env.local and add your API keys
```

4. **Required Environment Variables**
```bash
# Google AI (Gemini) API Configuration
GOOGLE_AI_API_KEY="your_gemini_api_key_here"
NEXT_PUBLIC_GOOGLE_AI_API_KEY="your_gemini_api_key_here"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"

# Database Configuration (if using MongoDB for user data)
DATABASE_URL="your_mongodb_connection_string"
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open in browser**
Visit [http://localhost:3000](http://localhost:3000)

## 🤖 AI Integration Setup

1. **Get Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Add it to your `.env.local` file

2. **Test AI Features**
   - Load the sample database (`sample-database.sql`)
   - Try asking questions in both Ask and Agentic modes
   - Use the "Insert Query" button to add AI-generated queries

For detailed AI setup instructions, see [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md)

## 📊 Sample Database

Load the included sample database to test AI features:

```sql
-- Contains realistic e-commerce data:
-- - users table (customer information)
-- - products table (inventory data)  
-- - orders table (transaction records)
```

Use the file `sample-database.sql` in your SQL playground.

## 🏗️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **Monaco Editor** - VS Code editor in the browser

### Database & AI
- **SQL.js** - SQLite compiled to WebAssembly
- **IndexedDB** - Browser storage for persistence
- **Google Gemini AI** - Advanced AI assistant
- **React Table** - Powerful data grid component

### Authentication & Backend
- **NextAuth.js** - Authentication solution
- **MongoDB** - User data storage (optional)
- **API Routes** - Serverless backend functions

## 📁 Project Structure

```
sequatic/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── playground/        # SQL playground page
│   └── ...
├── components/            # React components
│   ├── sql-playground/   # Playground-specific components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                  # Utility libraries
│   ├── ai-service.ts     # AI integration
│   ├── sqlite.ts         # SQLite manager
│   └── ...
├── prisma/               # Database schema
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🎯 Usage Examples

### Ask Mode AI Examples
```
"How do I join two tables?"
"Generate a query to find users who made orders in the last 30 days"
"What's the difference between INNER JOIN and LEFT JOIN?"
```

### Agentic Mode AI Examples
```
"Analyze the users table and give me insights"
"What are the sales trends in my orders data?"
"Find patterns in product categories and sales"
"Suggest database optimizations"
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SQL.js](https://sql.js.org/) for SQLite in the browser
- [Google AI](https://ai.google.dev/) for Gemini AI integration
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor

---

**Built with ❤️ for SQL enthusiasts and data analysts**
