import { useCallback, useEffect, useRef, useState } from 'react';

const THROTTLE_MS = 100;

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
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [granted, setGranted] = useState(!needsPermissionRequest());
  const lastUpdate = useRef(0);

  const handleOrientation = useCallback((event: Event) => {
    const e = event as OrientationEventWithWebkit;
    const now = Date.now();
    if (now - lastUpdate.current < THROTTLE_MS) return;
    lastUpdate.current = now;

    if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
      setHeading(e.webkitCompassHeading);
      return;
    }

    if (e.absolute && typeof e.alpha === 'number') {
      setHeading((360 - e.alpha) % 360);
      return;
    }

    // Non-absolute fallback: alpha still gives relative orientation on some browsers.
    if (typeof e.alpha === 'number') {
      setHeading((360 - e.alpha) % 360);
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

  return { heading, permissionNeeded, requestPermission };
}
