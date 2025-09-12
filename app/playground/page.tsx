'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SQLPlayground } from '@/components/SQLPlayground';
import { Loader2 } from 'lucide-react';
import { indexedDBManager } from '@/lib/indexeddb';

function PlaygroundContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const initializePlayground = async () => {
      try {
        // Check if user is authenticated
        // if (status === 'loading') return;
        // if (status === 'unauthenticated') {
        //   router.push('/login');
        //   return;
        // }

        // Get database ID from URL params
        const databaseId = searchParams.get('db');
        if (!databaseId) {
          router.push('/');
          return;
        }

        // Verify database exists in IndexedDB
        const storedDb = await indexedDBManager.getDatabase(databaseId);
        if (!storedDb) {
          setError('Database requested was not found');
          setLoading(false);
          return;
        }

        setDatabaseInfo({
          id: databaseId,
          name: storedDb.name,
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize playground:', err);
        setError('Failed to load database');
        setLoading(false);
      }
    };

    initializePlayground();
  }, [status, searchParams, router]);

  const handleBackToDashboard = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 via-yellow-600 to-blue-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        
        {/* Error content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {/* Error icon with animation */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <svg className="w-12 h-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error message */}
          <div className="mb-8 space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Oops!
            </h1>
            <h2 className="text-xl font-semibold text-gray-200">
              Something went wrong
            </h2>
            <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl">
              <p className="text-gray-300 text-sm leading-relaxed">
                {error}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBackToDashboard}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-semibold py-3 px-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Back to Dashboard</span>
              </span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white/10  hover:from-blue-700 hover:to-yellow-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </span>
            </button>
          </div>

          {/* Subtle animation indicator */}
          <div className="mt-8 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!databaseInfo) {
    return null;
  }

  return (
    <SQLPlayground
      databaseId={databaseInfo.id}
      databaseName={databaseInfo.name}
      onBackToDashboard={handleBackToDashboard}
    />
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}
