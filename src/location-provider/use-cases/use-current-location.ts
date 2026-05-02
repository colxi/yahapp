import { useCallback, useEffect, useState } from 'react';
import { useLocationProvider } from './use-location-provider';
import type { GeoSample } from '../types/geo-sample';

export interface UseCurrentLocation {
  location: GeoSample | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useCurrentLocation(): UseCurrentLocation {
  const provider = useLocationProvider();
  const [location, setLocation] = useState<GeoSample | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setIsLoading(true);

    provider.getCurrentPosition().then(
      (sample) => {
        if (!cancelled) {
          setLocation(sample);
          setIsLoading(false);
        }
      },
      (err: Error) => {
        if (!cancelled) {
          setError(err.message || 'Could not get your current location');
          setIsLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [provider, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return { location, error, isLoading, refresh };
}
