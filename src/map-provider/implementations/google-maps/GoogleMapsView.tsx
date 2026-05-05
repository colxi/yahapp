import { useCallback, useEffect, useRef, useState } from 'react'
import { Map, useMap } from '@vis.gl/react-google-maps'
import type { MapViewProps } from '../../types/map-provider'
import { googleMapsMapId, isGoogleMapsConfigured } from './api-key'
import { useDeviceHeading } from '@/tools/orientation/use-device-heading'

const DEFAULT_CENTER = { lat: 40.4168, lng: -3.7038 }
const DEFAULT_ZOOM = 13

type CompassMode = 'north-up' | 'free' | 'follow-heading'

function FollowController({ followLocation }: { followLocation?: MapViewProps['followLocation'] }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !followLocation) return
    map.panTo({ lat: followLocation.lat, lng: followLocation.lng })
  }, [map, followLocation])
  return null
}

function BoundsController({ bounds }: { bounds?: MapViewProps['bounds'] }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !bounds) return
    map.fitBounds(
      { north: bounds.north, south: bounds.south, east: bounds.east, west: bounds.west },
      64,
    )
  }, [map, bounds])
  return null
}

/**
 * Polls map heading every 200ms instead of using heading_changed events,
 * which cause infinite recursion when combined with programmatic setHeading.
 */
function HeadingPoller({ onChange }: { onChange: (heading: number) => void }) {
  const map = useMap()
  const cbRef = useRef(onChange)
  cbRef.current = onChange
  const prevRef = useRef<number | null>(null)

  useEffect(() => {
    if (!map) return
    const poll = () => {
      const h = Math.round(map.getHeading() ?? 0)
      if (h !== prevRef.current) {
        prevRef.current = h
        cbRef.current(h)
      }
    }
    poll()
    const id = setInterval(poll, 200)
    return () => clearInterval(id)
  }, [map])

  return null
}

function CompassModeController({
  mode,
  deviceHeading,
  onModeOverride,
}: {
  mode: CompassMode
  deviceHeading: number | null
  onModeOverride: (mode: CompassMode) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!map || mode !== 'north-up') return
    map.setHeading(0)
  }, [map, mode])

  useEffect(() => {
    if (!map || mode !== 'follow-heading' || deviceHeading === null) return
    map.setHeading(deviceHeading)
  }, [map, mode, deviceHeading])

  useEffect(() => {
    if (!map || mode !== 'follow-heading') return
    const listener = map.addListener('dragstart', () => onModeOverride('free'))
    return () => listener.remove()
  }, [map, mode, onModeOverride])

  return null
}

const MODE_RING: Record<CompassMode, string> = {
  'north-up': 'none',
  'free': '0 0 0 2px rgba(255,255,255,0.5)',
  'follow-heading': '0 0 0 2px #3b82f6, 0 0 8px rgba(59,130,246,0.4)',
}

const MODE_LABEL: Record<CompassMode, string> = {
  'north-up': 'North up — tap to unlock rotation',
  'free': 'Free rotation — tap to follow heading',
  'follow-heading': 'Following heading — tap to lock north',
}

function NorthCompassOverlay({
  mapHeading,
  compassMode,
  onClick,
}: {
  mapHeading: number
  compassMode: CompassMode
  onClick: () => void
}) {
  const displayHeading = compassMode === 'north-up' ? 0 : mapHeading
  const rotation = -displayHeading
  const needleColor = compassMode === 'follow-heading' ? '#3b82f6' : '#ef4444'

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      aria-label={MODE_LABEL[compassMode]}
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: MODE_RING[compassMode],
        transition: 'box-shadow 0.25s ease',
      }}
    >
      <svg
        viewBox="0 0 36 36"
        width="32"
        height="32"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.15s linear',
        }}
      >
        <polygon points="18,6 22,20 18,17 14,20" fill={needleColor} />
        <polygon points="18,30 14,20 18,23 22,20" fill="#d4d4d8" />
        <text
          x="18"
          y="5"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill={needleColor}
          style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: '18px 18px' }}
        >
          N
        </text>
      </svg>
      {compassMode !== 'north-up' && (
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: compassMode === 'follow-heading' ? '#3b82f6' : '#fff',
            border: '2px solid rgba(0,0,0,0.6)',
          }}
        />
      )}
    </div>
  )
}

function DragDetector({ onUserDrag }: { onUserDrag?: () => void }) {
  const map = useMap()
  const callbackRef = useRef(onUserDrag)
  callbackRef.current = onUserDrag

  useEffect(() => {
    if (!map || !callbackRef.current) return
    const listener = map.addListener('dragstart', () => callbackRef.current?.())
    return () => listener.remove()
  }, [map])

  return null
}

export function GoogleMapsView({
  center,
  zoom,
  bounds,
  followLocation,
  className,
  cursor,
  onMapClick,
  onUserDrag,
  children,
}: MapViewProps) {
  const [mapHeading, setMapHeading] = useState(0)
  const [compassMode, setCompassMode] = useState<CompassMode>('north-up')
  const [pendingFollowHeading, setPendingFollowHeading] = useState(false)
  const { heading: deviceHeading, permissionNeeded, requestPermission } = useDeviceHeading()

  const handleCompassClick = useCallback(() => {
    if (compassMode === 'north-up') {
      setCompassMode('free')
    } else if (compassMode === 'free') {
      if (permissionNeeded) {
        requestPermission()
        setPendingFollowHeading(true)
      } else {
        setCompassMode('follow-heading')
      }
    } else {
      setCompassMode('north-up')
    }
  }, [compassMode, permissionNeeded, requestPermission])

  useEffect(() => {
    if (pendingFollowHeading && !permissionNeeded) {
      setCompassMode('follow-heading')
      setPendingFollowHeading(false)
    }
  }, [pendingFollowHeading, permissionNeeded])

  if (!isGoogleMapsConfigured) {
    return (
      <div className={`map-fallback${className ? ` ${className}` : ''}`} role="status">
        <div>
          <p><strong>Google Maps is not configured.</strong></p>
          <p>
            Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>.env</code> and restart the dev
            server to enable the map.
          </p>
        </div>
      </div>
    )
  }

  const containerClass = [
    'map-container',
    cursor === 'crosshair' ? 'map-container--crosshair' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClass}>
      <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0 }}>
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
                  const latLng = event.detail.latLng
                  if (latLng) onMapClick({ lat: latLng.lat, lng: latLng.lng })
                }
              : undefined
          }
        >
          <HeadingPoller onChange={setMapHeading} />
          <CompassModeController
            mode={compassMode}
            deviceHeading={deviceHeading}
            onModeOverride={setCompassMode}
          />
          <FollowController followLocation={followLocation} />
          <BoundsController bounds={bounds} />
          <DragDetector onUserDrag={onUserDrag} />
          {children}
        </Map>
      </div>
      <NorthCompassOverlay
        mapHeading={mapHeading}
        compassMode={compassMode}
        onClick={handleCompassClick}
      />
    </div>
  )
}
