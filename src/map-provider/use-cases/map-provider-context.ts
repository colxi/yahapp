import { createContext } from 'react';
import type { MapProvider } from '../types/map-provider';

export const MapProviderContext = createContext<MapProvider | null>(null);
