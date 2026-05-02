import { useContext } from 'react';
import { HikesRepositoryContext } from './hikes-repository-context';
import type { HikesRepository } from '../types/hikes-repository';

export function useHikesRepository(): HikesRepository {
  const ctx = useContext(HikesRepositoryContext);
  if (!ctx) {
    throw new Error('useHikesRepository must be used within HikesRepositoryProvider');
  }
  return ctx;
}
