import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import type { GeoSample } from '../types/geo-sample';
import type {
  LocationProvider,
  PermissionStatus,
  Subscription,
  WatchOptions,
} from '../types/location-provider';

interface CapacitorPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    accuracy?: number;
    altitudeAccuracy?: number | null;
    speed?: number | null;
    heading?: number | null;
  };
  timestamp: number;
}

function fromCapacitor(position: CapacitorPosition): GeoSample {
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

export function createCapacitorLocationProvider(): LocationProvider {
  return {
    id: 'capacitor',
    supportsBackground: true,

    async requestPermissions(): Promise<PermissionStatus> {
      const { Geolocation } = await import('@capacitor/geolocation');
      try {
        const status = await Geolocation.requestPermissions({ permissions: ['location'] });
        const value = status.location ?? 'prompt';
        if (value === 'granted' || value === 'denied' || value === 'prompt') return value;
        return 'unknown';
      } catch {
        return 'denied';
      }
    },

    async getCurrentPosition(): Promise<GeoSample> {
      const { Geolocation } = await import('@capacitor/geolocation');
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15_000,
      });
      return fromCapacitor(pos as unknown as CapacitorPosition);
    },

    watch(options: WatchOptions, onSample, onError): Subscription {
      let cancelled = false;
      let watchHandle: string | null = null;

      void (async () => {
        try {
          const { Geolocation } = await import('@capacitor/geolocation');
          if (cancelled) return;
          watchHandle = await Geolocation.watchPosition(
            { enableHighAccuracy: options.highAccuracy ?? true },
            (position, err) => {
              if (err) {
                onError?.(new Error(err.message || 'Capacitor geolocation error'));
                return;
              }
              if (position) onSample(fromCapacitor(position as unknown as CapacitorPosition));
            },
          );
        } catch (e) {
          onError?.(e as Error);
        }
      })();

      return {
        stop: async () => {
          cancelled = true;
          if (watchHandle) {
            const { Geolocation } = await import('@capacitor/geolocation');
            await Geolocation.clearWatch({ id: watchHandle });
            watchHandle = null;
          }
        },
      };
    },

    async startBackground(options: WatchOptions, onSample, onError): Promise<Subscription> {
      const { registerPlugin } = await import('@capacitor/core');
      const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

      const watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: 'Yahapp is recording your hike.',
          backgroundTitle: 'Yahapp',
          requestPermissions: true,
          stale: false,
          distanceFilter: options.distanceFilterMeters ?? 5,
        },
        (location, err) => {
          if (err) {
            onError?.(new Error(err.message || 'Background geolocation error'));
            return;
          }
          if (location) {
            onSample({
              lat: location.latitude,
              lng: location.longitude,
              alt: location.altitude ?? undefined,
              accuracy: location.accuracy ?? undefined,
              altitudeAccuracy: location.altitudeAccuracy ?? undefined,
              speed: location.speed ?? undefined,
              heading: location.bearing ?? undefined,
              timestamp: location.time ?? Date.now(),
            });
          }
        },
      );

      return {
        stop: async () => {
          await BackgroundGeolocation.removeWatcher({ id: watcherId });
        },
      };
    },
  };
}
