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
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">{databaseName}</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportDatabase}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{userDisplayName || 'User'}</span>
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
  );
};
