import { useCallback, useSyncExternalStore } from 'react';
import { createLocalStorageAdapter } from '@/tools/storage/storage-adapter';
import { createLocalStorageHikesRepository } from './local-storage-hikes-repository';
import type { Hike } from '../types/hike';
import type { HikesRepository } from '../types/hikes-repository';

const repo = createLocalStorageHikesRepository(createLocalStorageAdapter());

type Listener = () => void;
const listeners = new Set<Listener>();
let revision = 0;

function bump() {
  revision++;
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot() {
  return revision;
}

const stableRepo: HikesRepository = {
  list: () => repo.list(),
  getById: (id) => repo.getById(id),
  save: (hike: Hike) => { repo.save(hike); bump(); },
  update: (hike: Hike) => { repo.update(hike); bump(); },
  remove: (id: string) => { repo.remove(id); bump(); },
  clear: () => { repo.clear(); bump(); },
};

export function useHikesRepository(): HikesRepository {
  useSyncExternalStore(subscribe, getSnapshot);
  return stableRepo;
}

export function useHikesList(): Hike[] {
  const rev = useSyncExternalStore(subscribe, getSnapshot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(() => repo.list(), [rev])();
}
