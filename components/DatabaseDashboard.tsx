'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User, Database, Plus, Calendar, HardDrive, Play, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { indexedDBManager, DatabaseInfo } from '@/lib/indexeddb';
import { sqliteManager } from '@/lib/sqlite';

export const DatabaseDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/landing' });
  };

  const loadDatabases = async () => {
    try {
      const dbList = await indexedDBManager.getAllDatabases();
      setDatabases(dbList);
    } catch (error) {
      console.error('Failed to load databases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewDatabase = async () => {
    if (!newDatabaseName.trim()) return;

    setIsCreating(true);
    try {
      // Check if database name already exists
      const exists = await indexedDBManager.databaseExists(newDatabaseName);
      if (exists) {
        alert('A database with this name already exists');
        return;
      }

      // Generate unique ID
      const databaseId = `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create empty SQLite database
      await sqliteManager.createDatabase(databaseId);
      const data = sqliteManager.exportDatabase(databaseId);
      
      // Save to IndexedDB
      await indexedDBManager.saveDatabase(databaseId, newDatabaseName.trim(), data);
      
      // Refresh the list
      await loadDatabases();
      
      // Reset form
      setNewDatabaseName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create database:', error);
      alert('Failed to create database. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteDatabase = async (databaseId: string, databaseName: string) => {
    if (!confirm(`Are you sure you want to delete "${databaseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await indexedDBManager.deleteDatabase(databaseId);
      sqliteManager.closeDatabase(databaseId);
      await loadDatabases();
    } catch (error) {
      console.error('Failed to delete database:', error);
      alert('Failed to delete database. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadDatabases();
  }, []);

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
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Databases</h1>
            <p className="text-gray-600">
              Manage your SQLite databases stored locally in your browser
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Database
          </Button>
        </div>

        {/* Create Database Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Database</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={newDatabaseName}
                onChange={(e) => setNewDatabaseName(e.target.value)}
                placeholder="Enter database name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && createNewDatabase()}
              />
              <Button
                onClick={createNewDatabase}
                disabled={!newDatabaseName.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewDatabaseName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Databases Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading databases...</p>
          </div>
        ) : databases.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No databases yet</h3>
            <p className="text-gray-500 mb-6">Create your first database to get started</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Database
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {databases.map((db) => (
              <div
                key={db.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{db.name}</h3>
                      <p className="text-sm text-gray-500">SQLite Database</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDatabase(db.id, db.name)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(db.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HardDrive className="w-4 h-4" />
                    <span>Size: {formatFileSize(db.size)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => router.push(`/playground?db=${db.id}`)}
                  className="w-full flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Open Database
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
