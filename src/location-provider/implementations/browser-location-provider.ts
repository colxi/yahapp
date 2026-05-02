import type { GeoSample } from '../types/geo-sample';
import type {
  LocationProvider,
  PermissionStatus,
  Subscription,
  WatchOptions,
} from '../types/location-provider';

function fromGeolocationPosition(position: GeolocationPosition): GeoSample {
  const { coords, timestamp } = position;
  return {
    lat: coords.latitude,
    lng: coords.longitude,
    alt: coords.altitude ?? undefined,
    accuracy: coords.accuracy,
    altitudeAccuracy: coords.altitudeAccuracy ?? undefined,
    speed: coords.speed ?? undefined,
    heading: coords.heading ?? undefined,
    timestamp,
  };
}

export function createBrowserLocationProvider(): LocationProvider {
  return {
    id: 'browser',
    supportsBackground: false,

    async requestPermissions(): Promise<PermissionStatus> {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return 'denied';
      }
      if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        try {
          const result = await navigator.permissions.query({
            name: 'geolocation' as PermissionName,
          });
          if (result.state === 'granted' || result.state === 'denied' || result.state === 'prompt') {
            return result.state;
          }
        } catch {
          // permissions API not supported for geolocation in this browser; fall through.
        }
      }
      return 'unknown';
    },

    getCurrentPosition() {
      return new Promise<GeoSample>((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          reject(new Error('Geolocation is not supported in this environment'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(fromGeolocationPosition(pos)),
          (err) => reject(new Error(err.message || 'Failed to get current position')),
          { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
        );
      });
    },

    watch(options: WatchOptions, onSample, onError): Subscription {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        onError?.(new Error('Geolocation is not supported in this environment'));
        return { stop: () => undefined };
      }
      const id = navigator.geolocation.watchPosition(
        (pos) => onSample(fromGeolocationPosition(pos)),
        (err) => onError?.(new Error(err.message || 'Geolocation watch error')),
        {
          enableHighAccuracy: options.highAccuracy ?? true,
          maximumAge: 0,
          timeout: 30_000,
        },
      );
      return {
        stop: () => navigator.geolocation.clearWatch(id),
      };
    },
  };
}
