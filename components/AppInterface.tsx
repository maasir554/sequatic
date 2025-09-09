'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Database, Play, Code, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const AppInterface = () => {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/landing' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/sequatic-detailed.svg"
                  alt="Sequatic"
                  width={32}
                  height={32}
                />
                <span className="font-black italic font-hero-heading text-blue-600 text-lg">
                  Sequatic
                </span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Welcome, {session?.user?.username || session?.user?.name || 'User'}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Database Tools
              </h2>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Code className="w-4 h-4" />
                  SQL Editor
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Query Assistant
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  Schema Builder
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                  Create New Table
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                  Import CSV Data
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                  Export Database
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Welcome to Sequatic! 🚀
              </h1>
              <p className="text-blue-100 mb-6">
                Start building and querying your database with natural language or SQL.
              </p>
              <div className="flex gap-4">
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Tutorial
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  View Documentation
                </Button>
              </div>
            </div>

            {/* Query Interface */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Query Interface</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Natural Language
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    SQL
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me anything about your data... e.g., 'Show me all users who signed up last month'"
                    className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Tip: You can ask questions in plain English or write SQL directly
                  </div>
                  <Button
                    onClick={() => setIsLoading(true)}
                    disabled={!query.trim() || isLoading}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isLoading ? 'Processing...' : 'Run Query'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
              <div className="text-center py-12 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Run a query to see results here</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
