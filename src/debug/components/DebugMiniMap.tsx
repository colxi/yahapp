import { useEffect, useState } from 'react';
import { Map, Marker } from '@vis.gl/react-google-maps';
import type { DebugCoordinates } from '../types/debug';

const FALLBACK_CENTER = { lat: 40.4168, lng: -3.7038 };

interface Props {
  coordinates: DebugCoordinates | null;
  onChange: (coords: DebugCoordinates) => void;
  onReset: () => void;
}

function useDeviceLocation(): DebugCoordinates | null {
  const [pos, setPos] = useState<DebugCoordinates | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }, []);

  return pos;
}

export function DebugMiniMap({ coordinates, onChange, onReset }: Props) {
  const deviceLocation = useDeviceLocation();
  const center = coordinates ?? deviceLocation ?? FALLBACK_CENTER;
  const zoom = coordinates || deviceLocation ? 13 : 5;

  return (
    <div className="debug-minimap">
      <div className="debug-minimap__map">
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI
          clickableIcons={false}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
          mapTypeId="terrain"
          style={{ width: '100%', height: '100%' }}
          onClick={(e) => {
            const latLng = e.detail.latLng;
            if (latLng) onChange({ lat: latLng.lat, lng: latLng.lng });
          }}
        >
          {coordinates && (
            <Marker
              position={coordinates}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#7f1d1d',
                strokeWeight: 2,
                scale: 7,
              }}
            />
          )}
        </Map>
      </div>

      <div className="debug-minimap__readout">
        <span className="debug-minimap__value">
          {coordinates
            ? `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`
            : 'Click map to set'}
        </span>
        <button type="button" className="debug-minimap__reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
