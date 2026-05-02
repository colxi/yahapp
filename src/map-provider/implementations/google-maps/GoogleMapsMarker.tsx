import { AdvancedMarker, Marker } from '@vis.gl/react-google-maps';
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

function LiveMarkerContent({ heading }: { heading?: number | null }) {
  const hasHeading = typeof heading === 'number' && !Number.isNaN(heading);

  return (
    <div
      style={{
        position: 'relative',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {hasHeading && (
        <div
          style={{
            position: 'absolute',
            width: 48,
            height: 48,
            transform: `rotate(${heading}deg)`,
            transition: 'transform 0.3s ease-out',
            pointerEvents: 'none',
          }}
        >
          <svg viewBox="0 0 48 48" width="48" height="48">
            <path
              d="M24 0 L34 20 Q24 16 14 20 Z"
              fill="rgba(250, 204, 21, 0.35)"
              stroke="rgba(250, 204, 21, 0.6)"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: palette.live.background,
          border: `2.5px solid ${palette.live.border}`,
          boxShadow: '0 0 0 3px rgba(250, 204, 21, 0.3)',
          zIndex: 1,
        }}
      />
    </div>
  );
}

export function GoogleMapsMarker({ position, label, variant = 'default', heading, onClick }: MarkerOverlayProps) {
  if (!isGoogleMapsConfigured) return null;

  const colors = palette[variant];
  const isLive = variant === 'live';

  if (supportsAdvancedMarkers) {
    if (isLive) {
      return (
        <AdvancedMarker position={position} title={label} onClick={onClick}>
          <LiveMarkerContent heading={heading} />
        </AdvancedMarker>
      );
    }

    return (
      <AdvancedMarker position={position} title={label} onClick={onClick}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: colors.background,
            border: `2.5px solid ${colors.border}`,
          }}
        />
      </AdvancedMarker>
    );
  }

  if (isLive && typeof heading === 'number' && !Number.isNaN(heading)) {
    return (
      <Marker
        position={position}
        title={label}
        onClick={onClick}
        icon={{
          path: 'M 0,-12 L 6,0 -6,0 Z',
          fillColor: colors.background,
          fillOpacity: 1,
          strokeColor: colors.border,
          strokeWeight: 2,
          scale: 1.4,
          rotation: heading,
          anchor: new google.maps.Point(0, 0),
        }}
      />
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
        scale: isLive ? 8 : 7,
      }}
    />
  );
}
