import { useContext } from 'react';
import { MapProviderContext } from './map-provider-context';
import type { MapProvider } from '../types/map-provider';

export function useMapProvider(): MapProvider {
  const ctx = useContext(MapProviderContext);
  if (!ctx) {
    throw new Error('useMapProvider must be used within MapProviderProvider');
  }
  return ctx;
}
