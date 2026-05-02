export type Platform = 'ios' | 'android' | 'web';

export interface PlatformInfo {
  platform: Platform;
  isNative: boolean;
  isStandalone: boolean;
  isSecureContext: boolean;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

export interface DetectPlatformDeps {
  capacitor?: CapacitorGlobal | null;
  userAgent?: string;
  isStandalone?: boolean;
  isSecureContext?: boolean;
}

export function detectPlatform(deps: DetectPlatformDeps = {}): PlatformInfo {
  const cap =
    deps.capacitor ??
    ((globalThis as unknown as { Capacitor?: CapacitorGlobal }).Capacitor ?? null);

  const userAgent =
    deps.userAgent ??
    (typeof navigator !== 'undefined' ? navigator.userAgent : '');

  const isStandalone =
    deps.isStandalone ??
    (typeof window !== 'undefined' &&
      (window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true));

  const isSecureContext =
    deps.isSecureContext ??
    (typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false);

  const isNative = Boolean(cap?.isNativePlatform?.());
  const nativePlatform = cap?.getPlatform?.();

  let platform: Platform = 'web';
  if (isNative && nativePlatform === 'ios') platform = 'ios';
  else if (isNative && nativePlatform === 'android') platform = 'android';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) platform = 'web';
  else if (/Android/i.test(userAgent)) platform = 'web';

  return {
    platform,
    isNative,
    isStandalone: Boolean(isStandalone),
    isSecureContext,
  };
}
