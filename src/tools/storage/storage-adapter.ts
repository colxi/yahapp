export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export function createMemoryStorageAdapter(): StorageAdapter {
  const store = new Map<string, string>();
  return {
    get<T>(key: string): T | null {
      const raw = store.get(key);
      if (raw === undefined) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    set<T>(key: string, value: T): void {
      store.set(key, JSON.stringify(value));
    },
    remove(key: string): void {
      store.delete(key);
    },
    clear(): void {
      store.clear();
    },
  };
}

export function createLocalStorageAdapter(storage: Storage = window.localStorage): StorageAdapter {
  return {
    get<T>(key: string): T | null {
      const raw = storage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    set<T>(key: string, value: T): void {
      storage.setItem(key, JSON.stringify(value));
    },
    remove(key: string): void {
      storage.removeItem(key);
    },
    clear(): void {
      storage.clear();
    },
  };
}
