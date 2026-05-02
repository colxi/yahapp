import { useMemo, type ReactNode } from 'react';
import { createLocalStorageAdapter } from '@/tools/storage/storage-adapter';
import { createLocalStorageHikesRepository } from './local-storage-hikes-repository';
import { HikesRepositoryContext } from './hikes-repository-context';

interface Props {
  children: ReactNode;
}

export function HikesRepositoryProvider({ children }: Props) {
  const repo = useMemo(() => createLocalStorageHikesRepository(createLocalStorageAdapter()), []);
  return (
    <HikesRepositoryContext.Provider value={repo}>{children}</HikesRepositoryContext.Provider>
  );
}
