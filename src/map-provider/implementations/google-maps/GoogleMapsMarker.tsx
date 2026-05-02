import { AdvancedMarker, Marker, Pin } from '@vis.gl/react-google-maps';
import type { MarkerOverlayProps } from '../../types/map-provider';
import { isGoogleMapsConfigured, supportsAdvancedMarkers } from './api-key';

const palette: Record<NonNullable<MarkerOverlayProps['variant']>, { background: string; border: string; glyph: string }> = {
  default: { background: '#4ade80', border: '#052e14', glyph: '#052e14' },
  start: { background: '#4ade80', border: '#052e14', glyph: '#052e14' },
  end: { background: '#f87171', border: '#3f1212', glyph: '#3f1212' },
  live: { background: '#facc15', border: '#3f2d04', glyph: '#3f2d04' },
  destination: { background: '#60a5fa', border: '#0c2238', glyph: '#0c2238' },
  checkpoint: { background: '#a78bfa', border: '#1e1b3a', glyph: '#1e1b3a' },
};

export function GoogleMapsMarker({ position, label, variant = 'default', onClick }: MarkerOverlayProps) {
  if (!isGoogleMapsConfigured) return null;

  const colors = palette[variant];

  if (supportsAdvancedMarkers) {
    return (
      <AdvancedMarker position={position} title={label} onClick={onClick}>
        <Pin background={colors.background} borderColor={colors.border} glyphColor={colors.glyph} />
      </AdvancedMarker>
    );
  }

  return (
    <Marker
      position={position}
      title={label}
      onClick={onClick}
      icon={{
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: colors.background,
        fillOpacity: 1,
        strokeColor: colors.border,
        strokeWeight: 2,
        scale: variant === 'live' ? 8 : 7,
      }}
    />
  );
}
