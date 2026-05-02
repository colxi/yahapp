import { detectPlatform } from './detect-platform';

describe('detectPlatform', () => {
  it('returns web when no Capacitor global is present', () => {
    const info = detectPlatform({ capacitor: null, userAgent: '', isSecureContext: true });
    expect(info.platform).toBe('web');
    expect(info.isNative).toBe(false);
  });

  it('returns ios when Capacitor reports native iOS', () => {
    const info = detectPlatform({
      capacitor: { isNativePlatform: () => true, getPlatform: () => 'ios' },
    });
    expect(info.platform).toBe('ios');
    expect(info.isNative).toBe(true);
  });

  it('returns android when Capacitor reports native Android', () => {
    const info = detectPlatform({
      capacitor: { isNativePlatform: () => true, getPlatform: () => 'android' },
    });
    expect(info.platform).toBe('android');
    expect(info.isNative).toBe(true);
  });

  it('treats mobile-browser user agents as web (not native)', () => {
    const info = detectPlatform({
      capacitor: null,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    });
    expect(info.platform).toBe('web');
    expect(info.isNative).toBe(false);
  });

  it('passes through standalone and secure-context flags', () => {
    const info = detectPlatform({
      capacitor: null,
      isStandalone: true,
      isSecureContext: false,
    });
    expect(info.isStandalone).toBe(true);
    expect(info.isSecureContext).toBe(false);
  });
});
