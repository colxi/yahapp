import type { MapProvider } from '../types/map-provider';
import { googleMapsProvider } from '../implementations/google-maps';

export type MapProviderId = 'google-maps';

export function selectMapProvider(id: MapProviderId = 'google-maps'): MapProvider {
  switch (id) {
    case 'google-maps':
    default:
      return googleMapsProvider;
  }
}
