import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { PathOverlayProps } from '../../types/map-provider';
import { isGoogleMapsConfigured } from './api-key';

export function GoogleMapsPath({ points, style }: PathOverlayProps) {
  if (!isGoogleMapsConfigured) return null;
  return <GoogleMapsPathInner points={points} style={style} />;
}

function GoogleMapsPathInner({ points, style }: PathOverlayProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;
    const polyline = new google.maps.Polyline({
      path: points.map((p) => ({ lat: p.lat, lng: p.lng })),
      strokeColor: style?.color ?? '#4ade80',
      strokeOpacity: style?.opacity ?? 0.95,
      strokeWeight: style?.width ?? 4,
      geodesic: true,
    });
    polyline.setMap(map);
    return () => {
      polyline.setMap(null);
    };
  }, [map, points, style?.color, style?.opacity, style?.width]);

  return null;
}
