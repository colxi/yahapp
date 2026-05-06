import { createContext } from 'react';
import type { DebugContextValue } from '../types/debug';

export const DebugContext = createContext<DebugContextValue | null>(null);
