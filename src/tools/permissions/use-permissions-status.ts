import { useCallback, useEffect, useState } from 'react';
import { useLocationProvider } from '@/location-provider/use-cases/use-location-provider';

export type PermState = 'granted' | 'denied' | 'prompt' | 'unknown' | 'unsupported';

export interface PermissionsStatus {
  location: PermState;
  orientation: PermState;
  refresh: () => void;
  requestLocation: () => Promise<void>;
  requestOrientation: () => Promise<void>;
}

async function queryLocationPermission(): Promise<PermState> {
  if (!navigator.permissions?.query) return 'unknown';
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state as PermState;
  } catch {
    return 'unknown';
  }
}

async function queryOrientationPermission(): Promise<PermState> {
  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  if (typeof DOE.requestPermission !== 'function') {
    // No permission needed on this platform — assume granted if sensor exists.
    if ('ondeviceorientationabsolute' in window || 'ondeviceorientation' in window) {
      return 'granted';
    }
    return 'unsupported';
  }
  // iOS: we can't query without triggering the prompt, so check localStorage.
  try {
    const stored = localStorage.getItem('yahapp:permissions-granted');
    return stored === '1' ? 'granted' : 'prompt';
  } catch {
    return 'unknown';
  }
}

export function usePermissionsStatus(): PermissionsStatus {
  const locationProvider = useLocationProvider();
  const [location, setLocation] = useState<PermState>('unknown');
  const [orientation, setOrientation] = useState<PermState>('unknown');

  const refresh = useCallback(() => {
    queryLocationPermission().then(setLocation);
    queryOrientationPermission().then(setOrientation);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requestLocation = useCallback(async () => {
    await locationProvider.requestPermissions();
    // Trigger an actual position request to surface the browser prompt.
    try {
      await locationProvider.getCurrentPosition();
    } catch {
      // User may deny — that's fine.
    }
    refresh();
  }, [locationProvider, refresh]);

  const requestOrientation = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE.requestPermission === 'function') {
      try {
        await DOE.requestPermission();
      } catch {
        // denied or dismissed
      }
    }
    refresh();
  }, [refresh]);

  return { location, orientation, refresh, requestLocation, requestOrientation };
}
