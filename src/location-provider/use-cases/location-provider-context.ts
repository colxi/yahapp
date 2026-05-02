import { createContext } from 'react';
import type { LocationProvider } from '../types/location-provider';

export const LocationProviderContext = createContext<LocationProvider | null>(null);
