import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createLocalStorageAdapter } from '@/tools/storage/storage-adapter';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';
import { loadSettings, saveSettings } from './load-settings';

interface SettingsState {
  settings: AppSettings;
}

interface SettingsActions {
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
}

const storage = createLocalStorageAdapter();

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  immer((set) => ({
    settings: loadSettings(storage),

    update: (patch) => {
      set((state) => {
        Object.assign(state.settings, patch);
        saveSettings(storage, { ...state.settings });
      });
    },

    reset: () => {
      set((state) => {
        state.settings = { ...DEFAULT_SETTINGS };
      });
      saveSettings(storage, DEFAULT_SETTINGS);
    },
  })),
);

export function useSettings() {
  return useSettingsStore();
}
