import { useEffect, useRef, useState } from 'react';

/**
 * Returns the device's compass heading in degrees (0–360, 0 = North, clockwise).
 * Uses the DeviceOrientation API on browsers and falls back to null when unavailable.
 *
 * On iOS Safari `webkitCompassHeading` gives a true-north bearing directly.
 * On Android / Chrome, the `deviceorientationabsolute` event is preferred;
 * heading is derived from `alpha` (360 − alpha).
 */
export function useDeviceHeading(): number | null {
  const [heading, setHeading] = useState<number | null>(null);
  const lastUpdate = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const THROTTLE_MS = 100;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastUpdate.current < THROTTLE_MS) return;
      lastUpdate.current = now;

      // iOS Safari exposes a ready-made compass heading.
      const webkit = (event as DeviceOrientationEvent & { webkitCompassHeading?: number })
        .webkitCompassHeading;
      if (typeof webkit === 'number' && !Number.isNaN(webkit)) {
        setHeading(webkit);
        return;
      }

      // Android / desktop: absolute alpha gives the compass bearing.
      if (event.absolute && typeof event.alpha === 'number') {
        setHeading((360 - event.alpha) % 360);
      }
    };

    // Prefer the absolute event (Chrome/Android), fall back to the generic one (iOS).
    let eventName: string = 'deviceorientation';
    if ('ondeviceorientationabsolute' in window) {
      eventName = 'deviceorientationabsolute';
    }

    window.addEventListener(eventName, handleOrientation as EventListener);

    // iOS 13+ requires explicit permission.
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().catch(() => {
        // Permission denied or not supported; heading stays null.
      });
    }

    return () => {
      window.removeEventListener(eventName, handleOrientation as EventListener);
    };
  }, []);

  return heading;
}
