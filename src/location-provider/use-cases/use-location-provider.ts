import { useContext } from 'react';
import { LocationProviderContext } from './location-provider-context';
import type { LocationProvider } from '../types/location-provider';

export function useLocationProvider(): LocationProvider {
  const ctx = useContext(LocationProviderContext);
  if (!ctx) {
    throw new Error('useLocationProvider must be used within LocationProviderProvider');
  }
  return ctx;
}
