import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { DebugCoordinates } from '../types/debug';
import type { GeoSample } from '@/location-provider/types/geo-sample';

export const isDebugEnabled = import.meta.env.VITE_DEBUG_MODE === 'true';

type OrientationMockFn = (deg: number | null) => void;

function getOrientationMock(): OrientationMockFn | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as Record<string, unknown>).setDeviceOrientationMock as
    OrientationMockFn | undefined;
}

interface DebugState {
  mockCoordinates: DebugCoordinates | null;
  mockHeading: number | null;
  isPanelOpen: boolean;
}

interface DebugActions {
  setMockCoordinates: (coords: DebugCoordinates | null) => void;
  setMockHeading: (heading: number | null) => void;
  setIsPanelOpen: (open: boolean) => void;
}

const locationWatchers = new Set<(sample: GeoSample) => void>();

export function registerLocationWatcher(cb: (sample: GeoSample) => void) {
  locationWatchers.add(cb);
  return () => { locationWatchers.delete(cb); };
}

function notifyWatchers(coords: DebugCoordinates) {
  const sample: GeoSample = { lat: coords.lat, lng: coords.lng, accuracy: 1, timestamp: Date.now() };
  locationWatchers.forEach((cb) => cb(sample));
}

export const useDebugStore = create<DebugState & DebugActions>()(
  immer((set) => ({
    mockCoordinates: null,
    mockHeading: null,
    isPanelOpen: false,

    setMockCoordinates: (coords) => {
      set((state) => { state.mockCoordinates = coords; });
      if (coords) notifyWatchers(coords);
    },

    setMockHeading: (heading) => {
      set((state) => { state.mockHeading = heading; });
      getOrientationMock()?.(heading);
    },

    setIsPanelOpen: (open) => {
      set((state) => { state.isPanelOpen = open; });
    },
  })),
);

export function useDebug() {
  const store = useDebugStore();
  if (!isDebugEnabled) {
    throw new Error('useDebug called but debug mode is not enabled');
  }
  return store;
}
