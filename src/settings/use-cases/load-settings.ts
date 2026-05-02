import type { StorageAdapter } from '@/tools/storage/storage-adapter';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';

const STORAGE_KEY = 'yahapp:settings';

export function loadSettings(storage: StorageAdapter): AppSettings {
  const persisted = storage.get<Partial<AppSettings>>(STORAGE_KEY);
  if (!persisted) return { ...DEFAULT_SETTINGS };
  return {
    ...DEFAULT_SETTINGS,
    ...persisted,
  };
}

export function saveSettings(storage: StorageAdapter, settings: AppSettings): void {
  storage.set(STORAGE_KEY, settings);
}
