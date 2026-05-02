import { createContext } from 'react';
import type { HikesRepository } from '../types/hikes-repository';

export const HikesRepositoryContext = createContext<HikesRepository | null>(null);
