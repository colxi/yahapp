import type { StorageAdapter } from '@/tools/storage/storage-adapter';
import type { Hike } from '../types/hike';
import type { HikesRepository } from '../types/hikes-repository';

const STORAGE_KEY = 'yahapp:v1:hikes';

interface PersistedShape {
  schemaVersion: 1;
  hikes: Hike[];
}

function isPersistedShape(value: unknown): value is PersistedShape {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return v.schemaVersion === 1 && Array.isArray(v.hikes);
}

function normalizeHike(hike: Hike): Hike {
  return {
    ...hike,
    checkpoints: Array.isArray(hike.checkpoints) ? hike.checkpoints : [],
  };
}

export function createLocalStorageHikesRepository(storage: StorageAdapter): HikesRepository {
  function readAll(): Hike[] {
    const raw = storage.get<PersistedShape>(STORAGE_KEY);
    if (raw && isPersistedShape(raw)) return raw.hikes.map(normalizeHike);
    return [];
  }

  function writeAll(hikes: Hike[]): void {
    const payload: PersistedShape = { schemaVersion: 1, hikes };
    storage.set(STORAGE_KEY, payload);
  }

  return {
    list() {
      return readAll().slice().sort((a, b) => b.startedAt - a.startedAt);
    },
    getById(id: string) {
      return readAll().find((h) => h.id === id) ?? null;
    },
    save(hike: Hike) {
      const all = readAll();
      const index = all.findIndex((h) => h.id === hike.id);
      if (index >= 0) {
        all[index] = hike;
      } else {
        all.push(hike);
      }
      writeAll(all);
    },
    update(hike: Hike) {
      this.save(hike);
    },
    remove(id: string) {
      writeAll(readAll().filter((h) => h.id !== id));
    },
    clear() {
      storage.remove(STORAGE_KEY);
    },
  };
}
