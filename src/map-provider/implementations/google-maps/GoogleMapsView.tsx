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
    const padding = 64
    map.fitBounds(
      {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
      },
      padding,
    )
  }, [map, bounds])
  return null
}

function NorthResetController({ tick }: { tick?: number }) {
  const map = useMap()
  useEffect(() => {
    if (!map || tick === undefined) return
    map.setHeading(0)
  }, [map, tick])
  return null
}

function HeadingWatcher({ onChange }: { onChange: (heading: number) => void }) {
  const map = useMap()
  const cbRef = useRef(onChange)
  cbRef.current = onChange

  useEffect(() => {
    if (!map) return
    cbRef.current(map.getHeading() ?? 0)
    const listener = map.addListener('heading_changed', () => {
      cbRef.current(map.getHeading() ?? 0)
    })
    return () => listener.remove()
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
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    if (!map || mode !== 'north-up') return
    map.setHeading(0)
    const listener = map.addListener('heading_changed', () => {
      if (modeRef.current !== 'north-up') return
      const current = map.getHeading() ?? 0
      if (Math.abs(current) > 0.1) map.setHeading(0)
    })
    return () => listener.remove()
  }, [map, mode])

  useEffect(() => {
    if (!map || mode !== 'follow-heading' || deviceHeading === null) return
    map.setHeading(deviceHeading)
  }, [map, mode, deviceHeading])

  useEffect(() => {
    if (!map || mode !== 'follow-heading') return
    const listener = map.addListener('dragstart', () => {
      onModeOverride('free')
    })
    return () => listener.remove()
  }, [map, mode, onModeOverride])

  return null
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
  const isFollowing = compassMode === 'follow-heading'

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      aria-label={
        compassMode === 'north-up'
          ? 'North up — tap to unlock rotation'
          : compassMode === 'free'
            ? 'Free rotation — tap to follow heading'
            : 'Following heading — tap to lock north'
      }
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
        cursor: 'pointer',
        boxShadow: isFollowing
          ? '0 0 0 2px #3b82f6, 0 0 8px rgba(59,130,246,0.4)'
          : 'none',
        transition: 'box-shadow 0.2s ease',
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
  resetNorthTick,
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

  const prevResetTickRef = useRef(resetNorthTick)
  useEffect(() => {
    if (resetNorthTick !== undefined && resetNorthTick !== prevResetTickRef.current) {
      prevResetTickRef.current = resetNorthTick
      setCompassMode('north-up')
    }
  }, [resetNorthTick])

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
          <HeadingWatcher onChange={setMapHeading} />
          <CompassModeController
            mode={compassMode}
            deviceHeading={deviceHeading}
            onModeOverride={setCompassMode}
          />
          <FollowController followLocation={followLocation} />
          <BoundsController bounds={bounds} />
          <NorthResetController tick={resetNorthTick} />
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
