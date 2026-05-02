import type { LocationProvider } from '../types/location-provider';
import { createBrowserLocationProvider } from '../implementations/browser-location-provider';
import { createCapacitorLocationProvider } from '../implementations/capacitor-location-provider';
import { detectPlatform } from '@/tools/platform/detect-platform';

export interface SelectLocationProviderDeps {
  isNativePlatform?: () => boolean;
}

export function selectLocationProvider(deps: SelectLocationProviderDeps = {}): LocationProvider {
  const isNative = deps.isNativePlatform?.() ?? detectPlatform().isNative;
  return isNative ? createCapacitorLocationProvider() : createBrowserLocationProvider();
}
