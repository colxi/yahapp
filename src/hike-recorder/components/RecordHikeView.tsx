import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHikeRecorder } from '../hooks/use-hike-recorder';
import { useWakeLock } from '../hooks/use-wake-lock';
import { useMapProvider } from '@/map-provider/use-cases/use-map-provider';
import { MapFullscreenToggle } from '@/map-provider/components/MapFullscreenToggle';
import { useCurrentLocation } from '@/location-provider/use-cases/use-current-location';
import { useSettings } from '@/settings/use-cases/use-settings';
import { usePlatform } from '@/tools/platform/use-platform';
import { useDeviceHeading } from '@/tools/orientation/use-device-heading';
import { formatDuration } from '@/tools/time/format-duration';
import { formatDistance, formatElevation, formatSpeed } from '@/settings/use-cases/format-units';
import { HikeMetadataForm } from './HikeMetadataForm';
import { AnnotationForm } from './AnnotationForm';
import { ElevationProfile } from '@/hike-history/components/ElevationProfile';
import '@/map-provider/components/map.css';
import './forms.css';
import './record-hike-view.css';

type PlacementMode = null | 'destination' | 'checkpoint';

interface PendingAnnotation {
  kind: 'destination' | 'checkpoint';
  lat: number;
  lng: number;
}

type Sheet =
  | { kind: 'none' }
  | { kind: 'finish' }
  | { kind: 'placement'; pending: PendingAnnotation };

export function RecordHikeView() {
  const recorder = useHikeRecorder();
  const map = useMapProvider();
  const currentLocation = useCurrentLocation();
  const { settings } = useSettings();
  const platform = usePlatform();
  const { heading, permissionNeeded, requestPermission: requestOrientationPermission } = useDeviceHeading();
  const navigate = useNavigate();

  const {
    hike,
    error,
    isStarting,
    start,
    pause,
    resume,
    complete,
    discard,
    setDestinationAt,
    addCheckpointAt,
  } = recorder;

  const [placementMode, setPlacementMode] = useState<PlacementMode>(null);
  const [sheet, setSheet] = useState<Sheet>({ kind: 'none' });
  const [recenterTick, setRecenterTick] = useState(0);
  const [northTick, setNorthTick] = useState(0);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [following, setFollowing] = useState(true);

  const handleUserDrag = useCallback(() => setFollowing(false), []);

  const points = hike?.points ?? [];
  const last = points[points.length - 1] ?? null;
  const isRecording = hike?.status === 'recording';

  useWakeLock(!platform.isNative && isRecording);

  const livePosition = useMemo(() => {
    if (last) return { lat: last.lat, lng: last.lng };
    if (currentLocation.location) {
      return { lat: currentLocation.location.lat, lng: currentLocation.location.lng };
    }
    return null;
  }, [last, currentLocation.location]);

  // Prefer compass heading; fall back to GPS travel heading when moving.
  const effectiveHeading = heading ?? last?.heading ?? null;

  const followTarget = useMemo(() => {
    if (!following || placementMode || !livePosition) return null;
    return { lat: livePosition.lat, lng: livePosition.lng };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [following, placementMode, livePosition?.lat, livePosition?.lng, recenterTick]);

  const handleMapClick = (location: { lat: number; lng: number }) => {
    if (!hike || !placementMode) return;
    setSheet({ kind: 'placement', pending: { kind: placementMode, ...location } });
    setPlacementMode(null);
  };

  return (
    <div className={`record-view${mapExpanded ? ' record-view--map-only' : ''}`}>
      <div className="record-view__map">
        <map.View
          center={livePosition ?? undefined}
          followLocation={followTarget}
          resetNorthTick={northTick}
          zoom={15}
          cursor={placementMode ? 'crosshair' : 'default'}
          onMapClick={hike && placementMode ? handleMapClick : undefined}
          onUserDrag={handleUserDrag}
        >
          {points.length > 1 && (
            <map.PathOverlay points={points.map((p) => ({ lat: p.lat, lng: p.lng }))} />
          )}
          {points[0] && <map.MarkerOverlay position={points[0]} variant="start" label="Start" />}
          {hike?.checkpoints.map((c) => (
            <map.MarkerOverlay
              key={c.id}
              position={{ lat: c.lat, lng: c.lng }}
              variant="checkpoint"
              label={c.title}
            />
          ))}
          {hike?.destination && (
            <map.MarkerOverlay
              position={{ lat: hike.destination.lat, lng: hike.destination.lng }}
              variant="destination"
              label={hike.destination.title}
            />
          )}
          {livePosition && (
            <map.MarkerOverlay position={livePosition} variant="live" heading={effectiveHeading} label="You are here" />
          )}
        </map.View>

        {placementMode && (
          <div className="record-view__placement-banner">
            Tap on the map to place {placementMode === 'destination' ? 'the destination' : 'a checkpoint'}.
            <button
              type="button"
              className="record-view__placement-cancel"
              onClick={() => setPlacementMode(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {!placementMode && livePosition && (
          <>
            <button
              type="button"
              className={`record-view__recenter${!following ? ' record-view__recenter--inactive' : ''}`}
              onClick={() => {
                setFollowing(true);
                setRecenterTick((t) => t + 1);
              }}
              aria-label="Center the map on your current location"
              title="Center on me"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M12 2v3M12 19v3M2 12h3M19 12h3"
                />
              </svg>
            </button>
            <button
              type="button"
              className="record-view__reset-north"
              onClick={() => setNorthTick((t) => t + 1)}
              aria-label="Reset map rotation so north points up"
              title="North up"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2 L16 10 H8 Z"
                />
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M12 10v10"
                />
              </svg>
            </button>
          </>
        )}

        {permissionNeeded && (
          <button
            type="button"
            className="record-view__compass-prompt"
            onClick={requestOrientationPermission}
          >
            Enable compass
          </button>
        )}

        {!hike && currentLocation.isLoading && (
          <div className="record-view__locating">Finding your location…</div>
        )}

        <MapFullscreenToggle
          expanded={mapExpanded}
          onToggle={() => setMapExpanded((v) => !v)}
        />
      </div>

      <div className="record-view__panel">
        {error && <div className="record-view__error">{error}</div>}

        {!hike && !platform.isNative && !platform.isSecureContext && (
          <div className="record-view__warning">
            Geolocation requires a secure context. Open Yahapp over HTTPS or on{' '}
            <code>localhost</code>.
          </div>
        )}

        {!hike && currentLocation.error && platform.isSecureContext && (
          <div className="record-view__warning">
            We couldn't get your current location: {currentLocation.error}.{' '}
            <button
              type="button"
              className="record-view__inline-button"
              onClick={() => currentLocation.refresh()}
            >
              Try again
            </button>
          </div>
        )}

        {sheet.kind === 'finish' && hike && (
          <div className="record-view__finish">
            <h2 className="record-view__title">Wrap up your hike</h2>
            <p className="record-view__subtitle">
              Add a title and a few notes so you can find this one later. Both are optional —
              skip and we'll keep the auto-generated name.
            </p>
            <HikeMetadataForm
              initialName=""
              initialDescription=""
              submitLabel="Save & finish"
              onSubmit={({ name, description }) => {
                const finished = complete({ name, description });
                setSheet({ kind: 'none' });
                if (finished) navigate(`/history/${finished.id}`);
              }}
              onCancel={() => setSheet({ kind: 'none' })}
            />
          </div>
        )}

        {sheet.kind === 'placement' && (
          <AnnotationForm
            titlePlaceholder={
              sheet.pending.kind === 'destination' ? 'Destination' : 'Checkpoint'
            }
            submitLabel={sheet.pending.kind === 'destination' ? 'Set destination' : 'Add checkpoint'}
            onSubmit={({ title, note }) => {
              if (sheet.pending.kind === 'destination') {
                setDestinationAt({ lat: sheet.pending.lat, lng: sheet.pending.lng }, { title, note });
              } else {
                addCheckpointAt({ lat: sheet.pending.lat, lng: sheet.pending.lng }, { title, note });
              }
              setSheet({ kind: 'none' });
            }}
            onCancel={() => setSheet({ kind: 'none' })}
          />
        )}

        {sheet.kind === 'none' && !hike && (
          <div className="record-view__cta">
            <h2 className="record-view__title">Ready for a hike?</h2>
            <p className="record-view__subtitle">
              {platform.isNative
                ? "We'll track your path and stats while you're out there. You can title and describe the hike when you finish."
                : "Recording works in the browser, but the tab must stay open. You can title and describe the hike when you finish."}
            </p>
            <div className="record-view__cta-actions">
              <button
                type="button"
                className="button"
                onClick={() => start()}
                disabled={isStarting}
              >
                {isStarting ? 'Starting…' : 'Start hike'}
              </button>
            </div>
          </div>
        )}

        {sheet.kind === 'none' && hike && (
          <>
            <ElevationProfile points={points} />
            <div className="stat-grid">
              <div className="stat">
                <div className="stat__label">Distance</div>
                <div className="stat__value">
                  {formatDistance(hike.stats.distanceMeters, settings.units)}
                </div>
              </div>
              <div className="stat">
                <div className="stat__label">Duration</div>
                <div className="stat__value">{formatDuration(hike.stats.durationMs)}</div>
              </div>
              <div className="stat">
                <div className="stat__label">Elev. gain</div>
                <div className="stat__value">
                  {formatElevation(hike.stats.elevationGainMeters, settings.units)}
                </div>
              </div>
              <div className="stat">
                <div className="stat__label">Avg speed</div>
                <div className="stat__value">
                  {formatSpeed(hike.stats.averageSpeedMetersPerSecond, settings.units)}
                </div>
              </div>
            </div>

            <div className="record-view__placement-bar">
              <button
                type="button"
                className={`pill${placementMode === 'destination' ? ' pill--active' : ''}`}
                onClick={() =>
                  setPlacementMode((m) => (m === 'destination' ? null : 'destination'))
                }
              >
                {hike.destination ? 'Move destination' : 'Set destination'}
              </button>
              <button
                type="button"
                className={`pill${placementMode === 'checkpoint' ? ' pill--active' : ''}`}
                onClick={() =>
                  setPlacementMode((m) => (m === 'checkpoint' ? null : 'checkpoint'))
                }
              >
                Add checkpoint
                {hike.checkpoints.length > 0 ? ` (${hike.checkpoints.length})` : ''}
              </button>
            </div>

            <div className="record-view__actions">
              {hike.status === 'recording' ? (
                <button type="button" className="button button--ghost" onClick={pause}>
                  Pause
                </button>
              ) : (
                <button type="button" className="button" onClick={resume}>
                  Resume
                </button>
              )}
              <button
                type="button"
                className="button button--danger"
                onClick={() => setSheet({ kind: 'finish' })}
              >
                Finish
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => discard()}
                title="Discard the in-progress recording without saving"
              >
                Discard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
