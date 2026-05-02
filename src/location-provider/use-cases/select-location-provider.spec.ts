import { selectLocationProvider } from './select-location-provider';

describe('selectLocationProvider', () => {
  it('returns the browser provider when not on a native platform', () => {
    const provider = selectLocationProvider({ isNativePlatform: () => false });
    expect(provider.id).toBe('browser');
    expect(provider.supportsBackground).toBe(false);
  });

  it('returns the capacitor provider when on a native platform', () => {
    const provider = selectLocationProvider({ isNativePlatform: () => true });
    expect(provider.id).toBe('capacitor');
    expect(provider.supportsBackground).toBe(true);
  });
});
