import { useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { DebugContext } from './debug-context';
import { LocationProviderContext } from '@/location-provider/use-cases/location-provider-context';
import { useLocationProvider } from '@/location-provider/use-cases/use-location-provider';
import type { LocationProvider } from '@/location-provider/types/location-provider';
import type { GeoSample } from '@/location-provider/types/geo-sample';

interface Props {
  children: ReactNode;
}

function makeSample(lat: number, lng: number): GeoSample {
  return { lat, lng, accuracy: 1, timestamp: Date.now() };
}

export function DebugLocationOverride({ children }: Props) {
  const debug = useContext(DebugContext);
  const realProvider = useLocationProvider();
  const mockCoordinates = debug?.mockCoordinates ?? null;

  const mockCoordsRef = useRef(mockCoordinates);
  mockCoordsRef.current = mockCoordinates;

  const watchersRef = useRef(new Set<(sample: GeoSample) => void>());

  useEffect(() => {
    if (!mockCoordinates) return;
    const sample = makeSample(mockCoordinates.lat, mockCoordinates.lng);
    watchersRef.current.forEach((cb) => cb(sample));
  }, [mockCoordinates]);

  // mockCoordinates is intentionally in deps: a new reference forces consumers to re-fetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const provider = useMemo<LocationProvider>(() => ({
    ...realProvider,
    getCurrentPosition: () => {
      const mc = mockCoordsRef.current;
      if (!mc) return realProvider.getCurrentPosition();
      return Promise.resolve(makeSample(mc.lat, mc.lng));
    },
    watch: (opts, onSample, onError) => {
      const mc = mockCoordsRef.current;
      if (!mc) return realProvider.watch(opts, onSample, onError);
      watchersRef.current.add(onSample);
      onSample(makeSample(mc.lat, mc.lng));
      return {
        stop: () => { watchersRef.current.delete(onSample); },
      };
    },
  }), [realProvider, mockCoordinates]);

  return (
    <LocationProviderContext.Provider value={provider}>
      {children}
    </LocationProviderContext.Provider>
  );
}
