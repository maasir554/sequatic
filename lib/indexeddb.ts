export interface DatabaseInfo {
  id: string;
  name: string;
  createdAt: Date;
  lastModified: Date;
  size: number;
}

export interface StoredDatabase {
  id: string;
  name: string;
  data: Uint8Array;
  createdAt: Date;
  lastModified: Date;
}

class IndexedDBManager {
  private dbName = 'SeqaticDatabases';
  private version = 1;
  private storeName = 'databases';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveDatabase(id: string, name: string, data: Uint8Array): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const now = new Date();
    let createdAt = now;

    return new Promise((resolve, reject) => {
      // First, try to get existing database to preserve createdAt
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          createdAt = existing.createdAt;
        }

        const database: StoredDatabase = {
          id,
          name,
          data,
          createdAt,
          lastModified: now,
        };

        // Now put the database within the same transaction
        const putRequest = store.put(database);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };

      getRequest.onerror = () => {
        // If get fails, just create new database
        const database: StoredDatabase = {
          id,
          name,
          data,
          createdAt,
          lastModified: now,
        };

        const putRequest = store.put(database);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
    });
  }

  async getDatabase(id: string): Promise<StoredDatabase | null> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllDatabases(): Promise<DatabaseInfo[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const databases = request.result.map((db: StoredDatabase) => ({
          id: db.id,
          name: db.name,
          createdAt: db.createdAt,
          lastModified: db.lastModified,
          size: db.data.length,
        }));
        resolve(databases);
      };
    });
  }

  async deleteDatabase(id: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async databaseExists(name: string): Promise<boolean> {
    const databases = await this.getAllDatabases();
    return databases.some(db => db.name.toLowerCase() === name.toLowerCase());
  }
}

export const indexedDBManager = new IndexedDBManager();
