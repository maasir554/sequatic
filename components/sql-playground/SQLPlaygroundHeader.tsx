'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Download, LogOut, User } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SQLPlaygroundHeaderProps {
  databaseName: string;
  userDisplayName?: string;
  onBackToDashboard: () => void;
  onExportDatabase: () => void;
}

export const SQLPlaygroundHeader = ({
  databaseName,
  userDisplayName,
  onBackToDashboard,
  onExportDatabase,
}: SQLPlaygroundHeaderProps) => {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/landing' });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="flex items-center gap-2 h-8 px-3 text-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="h-5 w-px bg-gray-300" />
            
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-900 text-sm">{databaseName}</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportDatabase}
              className="flex items-center gap-2 h-8 px-3 text-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </Button>
            
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <User className="w-3.5 h-3.5" />
              <span className="max-w-24 truncate">{userDisplayName || 'User'}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 h-8 px-3 text-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
