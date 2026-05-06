import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  mode: ThemeMode;
  systemPrefers: 'dark' | 'light';
  resolved: 'dark' | 'light';
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  _setSystemPrefers: (value: 'dark' | 'light') => void;
}

const STORAGE_KEY = 'yahapp:theme';

function readPersistedMode(): ThemeMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'dark' || raw === 'light' || raw === 'system') return raw;
  } catch {
    /* localStorage unavailable */
  }
  return 'dark';
}

function detectSystem(): 'dark' | 'light' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolve(mode: ThemeMode, systemPrefers: 'dark' | 'light'): 'dark' | 'light' {
  return mode === 'system' ? systemPrefers : mode;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  immer((set) => {
    const initialMode = readPersistedMode();
    const initialSystem = detectSystem();

    return {
      mode: initialMode,
      systemPrefers: initialSystem,
      resolved: resolve(initialMode, initialSystem),

      setMode: (mode) => {
        set((state) => {
          state.mode = mode;
          state.resolved = resolve(mode, state.systemPrefers);
        });
        try {
          window.localStorage.setItem(STORAGE_KEY, mode);
        } catch {
          /* ignore */
        }
      },

      _setSystemPrefers: (value) => {
        set((state) => {
          state.systemPrefers = value;
          state.resolved = resolve(state.mode, value);
        });
      },
    };
  }),
);

export function useTheme() {
  return useThemeStore();
}
