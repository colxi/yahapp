import { createContext } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeContextValue {
  mode: ThemeMode;
  resolved: 'dark' | 'light';
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
