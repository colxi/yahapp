import { useMemo } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { selectLocationProvider } from './select-location-provider';
import { isDebugEnabled, useDebugStore, registerLocationWatcher } from '@/debug/use-cases/debug-store';
import type { LocationProvider, WatchOptions, Subscription } from '../types/location-provider';
import type { GeoSample } from '../types/geo-sample';

interface LocationProviderState {
  provider: LocationProvider;
}

export const useLocationProviderStore = create<LocationProviderState>()(
  immer(() => ({
    provider: selectLocationProvider(),
  })),
);

function makeSample(lat: number, lng: number): GeoSample {
  return { lat, lng, accuracy: 1, timestamp: Date.now() };
}

export function useLocationProvider(): LocationProvider {
  const realProvider = useLocationProviderStore((s) => s.provider);
  const mockCoordinates = useDebugStore((s) => s.mockCoordinates);

  return useMemo<LocationProvider>(() => {
    if (!isDebugEnabled) return realProvider;

    return {
      ...realProvider,

      getCurrentPosition: () => {
        const coords = useDebugStore.getState().mockCoordinates;
        if (coords) return Promise.resolve(makeSample(coords.lat, coords.lng));
        return realProvider.getCurrentPosition();
      },

      watch: (opts: WatchOptions, onSample: (sample: GeoSample) => void, onError?: (err: Error) => void): Subscription => {
        const unregisterWatcher = registerLocationWatcher(onSample);

        const coords = useDebugStore.getState().mockCoordinates;
        let realSub: Subscription | null = null;

        if (coords) {
          onSample(makeSample(coords.lat, coords.lng));
        } else {
          realSub = realProvider.watch(opts, onSample, onError);
        }

        return {
          stop: () => {
            unregisterWatcher();
            if (realSub) realSub.stop();
          },
        };
      },
    };
  }, [realProvider, mockCoordinates]);
}
