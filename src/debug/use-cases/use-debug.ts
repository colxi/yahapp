import { useContext } from 'react';
import { DebugContext } from './debug-context';
import type { DebugContextValue } from '../types/debug';

export function useDebug(): DebugContextValue {
  const ctx = useContext(DebugContext);
  if (!ctx) {
    throw new Error('useDebug must be used within DebugProvider');
  }
  return ctx;
}
