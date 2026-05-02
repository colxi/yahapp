import { createMemoryStorageAdapter } from '@/tools/storage/storage-adapter';
import { loadSettings, saveSettings } from './load-settings';
import { DEFAULT_SETTINGS } from '../types/settings';

describe('settings persistence', () => {
  it('returns defaults when nothing is persisted', () => {
    expect(loadSettings(createMemoryStorageAdapter())).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips a saved settings object', () => {
    const adapter = createMemoryStorageAdapter();
    saveSettings(adapter, { ...DEFAULT_SETTINGS, units: 'imperial', backgroundRecording: false });
    const loaded = loadSettings(adapter);
    expect(loaded.units).toBe('imperial');
    expect(loaded.backgroundRecording).toBe(false);
    expect(loaded.mapProviderId).toBe('google-maps');
  });

  it('merges partial persisted shape onto defaults', () => {
    const adapter = createMemoryStorageAdapter();
    adapter.set('yahapp:settings', { units: 'imperial' });
    expect(loadSettings(adapter)).toEqual({ ...DEFAULT_SETTINGS, units: 'imperial' });
  });
});
