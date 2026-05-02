import type { MapProvider } from '../../types/map-provider';
import { GoogleMapsRoot } from './GoogleMapsRoot';
import { GoogleMapsView } from './GoogleMapsView';
import { GoogleMapsPath } from './GoogleMapsPath';
import { GoogleMapsMarker } from './GoogleMapsMarker';

export const googleMapsProvider: MapProvider = {
  id: 'google-maps',
  displayName: 'Google Maps (Terrain)',
  Root: GoogleMapsRoot,
  View: GoogleMapsView,
  PathOverlay: GoogleMapsPath,
  MarkerOverlay: GoogleMapsMarker,
};
