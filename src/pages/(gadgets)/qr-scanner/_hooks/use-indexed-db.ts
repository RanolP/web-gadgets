import { onCleanup, onMount } from 'solid-js';

const DB_NAME = 'qr-scanner-db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export function useIndexedDB() {
  let db: IDBDatabase | null = null;

  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
    });
  };

  const saveBlob = async (id: string, blob: Blob): Promise<void> => {
    if (!db) {
      db = await initDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const loadBlob = async (id: string): Promise<Blob | null> => {
    if (!db) {
      db = await initDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  };

  const deleteBlob = async (id: string): Promise<void> => {
    if (!db) {
      db = await initDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  const clearAllBlobs = async (): Promise<void> => {
    if (!db) {
      db = await initDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  onMount(() => {
    initDB().catch(console.error);
  });

  onCleanup(() => {
    if (db) {
      db.close();
    }
  });

  return {
    saveBlob,
    loadBlob,
    deleteBlob,
    clearAllBlobs,
  };
}