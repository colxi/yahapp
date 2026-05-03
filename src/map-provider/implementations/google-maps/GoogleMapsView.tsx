import { useEffect, useRef, useState } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import type { MapViewProps } from '../../types/map-provider';
import { googleMapsMapId, isGoogleMapsConfigured } from './api-key';

const DEFAULT_CENTER = { lat: 40.4168, lng: -3.7038 };
const DEFAULT_ZOOM = 13;

function FollowController({ followLocation }: { followLocation?: MapViewProps['followLocation'] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !followLocation) return;
    map.panTo({ lat: followLocation.lat, lng: followLocation.lng });
  }, [map, followLocation]);
  return null;
}

function BoundsController({ bounds }: { bounds?: MapViewProps['bounds'] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !bounds) return;
    const padding = 64;
    map.fitBounds(
      {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
      },
      padding,
    );
  }, [map, bounds]);
  return null;
}

function NorthResetController({ tick }: { tick?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map || tick === undefined) return;
    map.setHeading(0);
  }, [map, tick]);
  return null;
}

function HeadingWatcher({ onChange }: { onChange: (heading: number) => void }) {
  const map = useMap();
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  useEffect(() => {
    if (!map) return;
    cbRef.current(map.getHeading() ?? 0);
    const listener = map.addListener('heading_changed', () => {
      cbRef.current(map.getHeading() ?? 0);
    });
    return () => listener.remove();
  }, [map]);

  return null;
}

function NorthCompassOverlay({ mapHeading }: { mapHeading: number }) {
  const rotation = -mapHeading;
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <svg
        viewBox="0 0 36 36"
        width="36"
        height="36"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <polygon points="18,6 22,20 18,17 14,20" fill="#ef4444" />
        <polygon points="18,30 14,20 18,23 22,20" fill="#d4d4d8" />
        <text
          x="18"
          y="5"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill="#ef4444"
          style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: '18px 18px' }}
        >
          N
        </text>
      </svg>
    </div>
  );
}

function DragDetector({ onUserDrag }: { onUserDrag?: () => void }) {
  const map = useMap();
  const callbackRef = useRef(onUserDrag);
  callbackRef.current = onUserDrag;

  useEffect(() => {
    if (!map || !callbackRef.current) return;
    const listener = map.addListener('dragstart', () => callbackRef.current?.());
    return () => listener.remove();
  }, [map]);

  return null;
}

export function GoogleMapsView({
  center,
  zoom,
  bounds,
  followLocation,
  resetNorthTick,
  className,
  cursor,
  onMapClick,
  onUserDrag,
  children,
}: MapViewProps) {
  if (!isGoogleMapsConfigured) {
    return (
      <div className={`map-fallback${className ? ` ${className}` : ''}`} role="status">
        <div>
          <p>
            <strong>Google Maps is not configured.</strong>
          </p>
          <p>
            Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>.env</code> and restart the dev server to
            enable the map.
          </p>
        </div>
      </div>
    );
  }

  const containerClass = [
    'map-container',
    cursor === 'crosshair' ? 'map-container--crosshair' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const [mapHeading, setMapHeading] = useState(0);

  return (
    <div className={containerClass}>
      <NorthCompassOverlay mapHeading={mapHeading} />
      <Map
        defaultCenter={center ?? DEFAULT_CENTER}
        defaultZoom={zoom ?? DEFAULT_ZOOM}
        mapId={googleMapsMapId || undefined}
        mapTypeId="terrain"
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        style={{ width: '100%', height: '100%' }}
        onClick={
          onMapClick
            ? (event) => {
                const latLng = event.detail.latLng;
                if (latLng) onMapClick({ lat: latLng.lat, lng: latLng.lng });
              }
            : undefined
        }
      >
        <HeadingWatcher onChange={setMapHeading} />
        <FollowController followLocation={followLocation} />
        <BoundsController bounds={bounds} />
        <NorthResetController tick={resetNorthTick} />
        <DragDetector onUserDrag={onUserDrag} />
        {children}
      </Map>
    </div>
  );
}
