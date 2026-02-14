// src/utils/videoStorage.ts
const DB_NAME = 'cancut-videos-db';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

export type StoredVideoMeta = {
  id: string;           // key in IndexedDB
  name: string;
  size: number;
  type: string;
  createdAt: number;
};

export type StoredVideo = StoredVideoMeta & {
  blob: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideo(file: File): Promise<StoredVideoMeta> {
  const db = await openDb();
  const id = crypto.randomUUID();
  const meta: StoredVideoMeta = {
    id,
    name: file.name,
    size: file.size,
    type: file.type,
    createdAt: Date.now(),
  };

  const value = { ...meta, blob: file };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(value);

    req.onsuccess = () => resolve(meta);
    req.onerror = () => reject(req.error);
  });
}

export async function listVideos(): Promise<StoredVideoMeta[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const all = (req.result || []) as StoredVideo[];
      // Strip blobs for lighter lists
      resolve(
        all
          .map(({ ...meta }) => meta)
          .sort((a, b) => b.createdAt - a.createdAt),
      );
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getVideo(id: string): Promise<StoredVideo | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onsuccess = () => {
      resolve((req.result as StoredVideo) ?? null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteVideo(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}