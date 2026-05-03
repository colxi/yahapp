import { useCallback, useEffect, useRef, useState } from 'react';

const THROTTLE_MS = 100;

let mockHeading: number | null = null;
let lastKnownHeading: number | null = null;
const mockListeners = new Set<(h: number | null) => void>();

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).setDeviceOrientationMock = (
    degrees: number | null,
  ) => {
    mockHeading = typeof degrees === 'number' ? ((degrees % 360) + 360) % 360 : null;
    mockListeners.forEach((fn) => fn(mockHeading));
  };
}

type OrientationEventWithWebkit = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

function needsPermissionRequest(): boolean {
  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>;
  };
  return typeof DOE.requestPermission === 'function';
}

function getEventName(): string {
  if (typeof window !== 'undefined' && 'ondeviceorientationabsolute' in window) {
    return 'deviceorientationabsolute';
  }
  return 'deviceorientation';
}

/**
 * Returns the device's compass heading in degrees (0–360, 0 = North, clockwise),
 * and a `requestPermission` function that must be called from a user gesture on iOS 13+.
 *
 * On iOS Safari `webkitCompassHeading` gives a true-north bearing directly.
 * On Android / Chrome, the `deviceorientationabsolute` event is preferred;
 * heading is derived from `alpha` (360 − alpha).
 */
export function useDeviceHeading(): {
  heading: number | null;
  permissionNeeded: boolean;
  requestPermission: () => void;
} {
  const [heading, _setHeading] = useState<number | null>(lastKnownHeading);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [granted, setGranted] = useState(!needsPermissionRequest());
  const lastUpdate = useRef(0);

  const setHeading = useCallback((value: number | null) => {
    if (value !== null) lastKnownHeading = value;
    _setHeading(value !== null ? value : lastKnownHeading);
  }, []);

  const handleOrientation = useCallback((event: Event) => {
    const e = event as OrientationEventWithWebkit;
    const now = Date.now();
    if (now - lastUpdate.current < THROTTLE_MS) return;

    let value: number | undefined;

    if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
      value = e.webkitCompassHeading;
    } else if (typeof e.alpha === 'number') {
      value = (360 - e.alpha) % 360;
    }

    if (value !== undefined) {
      lastUpdate.current = now;
      setHeading(value);
    }
  }, []);

  const requestPermission = useCallback(() => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE.requestPermission !== 'function') return;
    DOE.requestPermission().then((state) => {
      if (state === 'granted') {
        setGranted(true);
        setPermissionNeeded(false);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (needsPermissionRequest() && !granted) {
      setPermissionNeeded(true);
      return;
    }

    const eventName = getEventName();
    window.addEventListener(eventName, handleOrientation);
    return () => window.removeEventListener(eventName, handleOrientation);
  }, [granted, handleOrientation]);

  useEffect(() => {
    const onMock = (h: number | null) => setHeading(h);
    mockListeners.add(onMock);
    if (mockHeading !== null) setHeading(mockHeading);
    return () => { mockListeners.delete(onMock); };
  }, []);

  return { heading, permissionNeeded, requestPermission };
}
