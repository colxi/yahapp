import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { createLocalStorageAdapter } from '@/tools/storage/storage-adapter';
import { DEFAULT_SETTINGS, type AppSettings } from '../types/settings';
import { loadSettings, saveSettings } from './load-settings';
import { SettingsContext } from './settings-context';

interface Props {
  children: ReactNode;
}

export function SettingsProvider({ children }: Props) {
  const storage = useMemo(() => createLocalStorageAdapter(), []);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings(storage));

  const update = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        saveSettings(storage, next);
        return next;
      });
    },
    [storage],
  );

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(storage, DEFAULT_SETTINGS);
  }, [storage]);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
