'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  User, 
  Database, 
  Plus, 
  HardDrive, 
  Play, 
  Trash2, 
  AlertTriangle, 
  MoreVertical,
  Search,
  Copy,
  Download,
  Eye,
  Zap,
  Sparkles,
  Clock,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { indexedDBManager, DatabaseInfo } from '@/lib/indexeddb';
import { sqliteManager } from '@/lib/sqlite';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const DatabaseDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDatabases, setFilteredDatabases] = useState<DatabaseInfo[]>([]);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [databaseToDelete, setDatabaseToDelete] = useState<{id: string, name: string} | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Logout confirmation state
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/landing' });
    setIsLogoutDialogOpen(false);
  };

  const loadDatabases = async () => {
    try {
      const dbList = await indexedDBManager.getAllDatabases();
      setDatabases(dbList);
      setFilteredDatabases(dbList);
    } catch (error) {
      console.error('Failed to load databases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    const filtered = databases.filter(db =>
      db.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDatabases(filtered);
  }, [databases, searchQuery]);

  // Copy database ID to clipboard
  const copyDatabaseId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  };

  // Get database status badge
  const getDatabaseStatus = (db: DatabaseInfo) => {
    const daysSinceCreated = Math.floor((Date.now() - db.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated === 0) return { label: 'New', color: 'bg-green-100 text-green-800' };
    if (daysSinceCreated <= 7) return { label: 'Recent', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Active', color: 'bg-gray-100 text-gray-800' };
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
    setDatabaseToDelete({ id: databaseId, name: databaseName });
    setDeleteDialogOpen(true);
    setDeleteConfirmationText('');
  };

  const confirmDeleteDatabase = async () => {
    if (!databaseToDelete || deleteConfirmationText !== databaseToDelete.name) {
      return;
    }

    setIsDeleting(true);
    try {
      await indexedDBManager.deleteDatabase(databaseToDelete.id);
      sqliteManager.closeDatabase(databaseToDelete.id);
      await loadDatabases();
      
      // Reset state
      setDeleteDialogOpen(false);
      setDatabaseToDelete(null);
      setDeleteConfirmationText('');
    } catch (error) {
      console.error('Failed to delete database:', error);
      alert('Failed to delete database. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDatabaseToDelete(null);
    setDeleteConfirmationText('');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src="/sequatic-detailed.svg"
                    alt="Sequatic"
                    width={32}
                    height={32}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="font-black italic font-hero-heading text-blue-600 text-lg group-hover:text-blue-700 transition-colors duration-300">
                  Sequatic
                </span>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50/80 rounded-xl px-4 py-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Welcome, {session?.user?.username || session?.user?.name || 'User'}</span>
              </div>
              
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline max-w-32 truncate">{session?.user?.username || session?.user?.name || 'User'}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-200/50 bg-white/95 backdrop-blur-sm">
                  <div className="px-2 py-1.5 text-sm text-gray-600">
                    <div className="font-medium text-gray-900">{session?.user?.username || session?.user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">Signed in</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsLogoutDialogOpen(true)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
              Your Databases
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your SQLite databases along with AI
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                <Database className="w-3 h-3 mr-1" />
                {databases.length} Database{databases.length !== 1 ? 's' : ''}
              </Badge>
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <Zap className="w-3 h-3 mr-1" />
                Local Storage
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search databases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full sm:w-80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
              />
            </div>
            
            {/* Create Database Button */}
            <Button
              onClick={() => setShowCreateForm(true)}
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl group"
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="font-medium">Create Database</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Create Database Form */}
        {showCreateForm && (
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Database</h2>
                  <p className="text-gray-600">Give your database a memorable name</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newDatabaseName}
                    onChange={(e) => setNewDatabaseName(e.target.value)}
                    placeholder="Enter database name (e.g., 'MyProjectDB')..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && createNewDatabase()}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={createNewDatabase}
                    disabled={!newDatabaseName.trim() || isCreating}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create
                      </div>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewDatabaseName('');
                    }}
                    className="px-6 py-3 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modern Databases Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 h-48">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDatabases.length === 0 ? (
          <div className="text-center py-16">
            {searchQuery ? (
              <div className="max-w-md mx-auto">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No databases found</h3>
                <p className="text-gray-500 mb-6">
                  No databases match your search for &ldquo;{searchQuery}&rdquo;
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="rounded-xl"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                  <Database className="relative w-20 h-20 mx-auto text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No databases yet</h3>
                <p className="text-gray-500 mb-8 text-lg">
                  Create your first database to start building amazing applications
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Database
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatabases.map((db) => {
              const status = getDatabaseStatus(db);
              return (
                <div
                  key={db.id}
                  className="group relative overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Glass Card */}
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-500 group-hover:transform group-hover:-translate-y-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Database className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${status.color}`}>
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-700 transition-colors duration-300">
                            {db.name}
                          </h3>
                          <p className="text-sm text-gray-500">SQLite Database</p>
                        </div>
                      </div>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-200/50 bg-white/95 backdrop-blur-sm">
                          <DropdownMenuItem 
                            onClick={() => copyDatabaseId(db.id)}
                            className="cursor-pointer rounded-lg"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer rounded-lg">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer rounded-lg">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200/50" />
                          <DropdownMenuItem 
                            onClick={() => deleteDatabase(db.id, db.name)}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Database
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Created: {formatDate(db.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HardDrive className="w-4 h-4 text-green-500" />
                        <span>Size: {formatFileSize(db.size)}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => router.push(`/playground?db=${db.id}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group/btn relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        <span className="font-medium">Open Database</span>
                      </div>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of Sequatic?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account and redirected to the landing page. 
              Any unsaved work will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-xl"
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Database
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the database{' '}
              <span className="font-semibold text-gray-900">&ldquo;{databaseToDelete?.name}&rdquo;</span>{' '}
              and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label htmlFor="delete-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              To confirm, type the database name: <span className="font-semibold">{databaseToDelete?.name}</span>
            </label>
            <input
              id="delete-confirmation"
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type database name here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDatabase}
              disabled={deleteConfirmationText !== databaseToDelete?.name || isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete Database'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
