import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useHikesRepository } from '@/hike-storage/use-cases/use-hikes-repository';
import { useMapProvider } from '@/map-provider/use-cases/use-map-provider';
import { MapFullscreenToggle } from '@/map-provider/components/MapFullscreenToggle';
import { useSettings } from '@/settings/use-cases/use-settings';
import { formatDistance, formatElevation, formatSpeed } from '@/settings/use-cases/format-units';
import { formatDuration } from '@/tools/time/format-duration';
import { createId } from '@/tools/id/create-id';
import { addCheckpoint } from '@/hike-recorder/use-cases/add-checkpoint';
import {
  removeCheckpoint as removeCheckpointUC,
  updateCheckpoint as updateCheckpointUC,
} from '@/hike-recorder/use-cases/update-checkpoint';
import {
  clearDestination as clearDestinationUC,
  setDestination as setDestinationUC,
} from '@/hike-recorder/use-cases/set-destination';
import { updateHikeMetadata } from '@/hike-recorder/use-cases/update-hike-metadata';
import type { Hike } from '@/hike-storage/types/hike';
import type { Annotation } from '@/hike-storage/types/annotation';
import { HikeMetadataForm } from '@/hike-recorder/components/HikeMetadataForm';
import { AnnotationForm } from '@/hike-recorder/components/AnnotationForm';
import { exportSingleHike } from '@/hike-storage/use-cases/export-hikes';
import { bboxForHike } from '../use-cases/merge-bboxes';
import '@/map-provider/components/map.css';
import '@/hike-recorder/components/forms.css';
import './hike-detail-view.css';

type PlacementMode = null | 'destination' | 'checkpoint';

type Sheet =
  | { kind: 'none' }
  | { kind: 'edit-metadata' }
  | { kind: 'placement'; pendingKind: 'destination' | 'checkpoint'; lat: number; lng: number }
  | { kind: 'edit-checkpoint'; checkpoint: Annotation }
  | { kind: 'edit-destination'; destination: Annotation };

export function HikeDetailView() {
  const { id } = useParams();
  const repo = useHikesRepository();
  const map = useMapProvider();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [hike, setHike] = useState<Hike | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [placementMode, setPlacementMode] = useState<PlacementMode>(null);
  const [sheet, setSheet] = useState<Sheet>({ kind: 'none' });
  const [mapExpanded, setMapExpanded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setHike(repo.getById(id));
  }, [id, repo]);

  const persist = (next: Hike) => {
    repo.update(next);
    setHike(next);
  };

  const bbox = useMemo(() => (hike ? bboxForHike(hike) : null), [hike]);
  const start = hike?.points[0];
  const end = hike?.points[hike.points.length - 1];

  if (!hike) {
    return (
      <div className="view">
        <p className="view__subtitle">
          Hike not found. <Link to="/history">Back to history</Link>
        </p>
      </div>
    );
  }

  const handleMapClick = (location: { lat: number; lng: number }) => {
    if (!placementMode) return;
    setSheet({ kind: 'placement', pendingKind: placementMode, lat: location.lat, lng: location.lng });
    setPlacementMode(null);
  };

  return (
    <div className={`hike-detail${mapExpanded ? ' hike-detail--map-only' : ''}`}>
      <div className="hike-detail__map">
        <map.View
          bounds={!placementMode && bbox ? bbox : undefined}
          cursor={placementMode ? 'crosshair' : 'default'}
          onMapClick={placementMode ? handleMapClick : undefined}
        >
          {hike.points.length > 1 && (
            <map.PathOverlay points={hike.points.map((p) => ({ lat: p.lat, lng: p.lng }))} />
          )}
          {start && <map.MarkerOverlay position={start} variant="start" label="Start" />}
          {end && hike.points.length > 1 && (
            <map.MarkerOverlay position={end} variant="end" label="End" />
          )}
          {hike.checkpoints.map((c) => (
            <map.MarkerOverlay
              key={c.id}
              position={{ lat: c.lat, lng: c.lng }}
              variant="checkpoint"
              label={c.title}
              onClick={() => setSheet({ kind: 'edit-checkpoint', checkpoint: c })}
            />
          ))}
          {hike.destination && (
            <map.MarkerOverlay
              position={{ lat: hike.destination.lat, lng: hike.destination.lng }}
              variant="destination"
              label={hike.destination.title}
              onClick={() =>
                hike.destination &&
                setSheet({ kind: 'edit-destination', destination: hike.destination })
              }
            />
          )}
        </map.View>

        {placementMode && (
          <div className="hike-detail__placement-banner">
            Tap on the map to place {placementMode === 'destination' ? 'the destination' : 'a checkpoint'}.
            <button
              type="button"
              className="hike-detail__placement-cancel"
              onClick={() => setPlacementMode(null)}
            >
              Cancel
            </button>
          </div>
        )}

        <MapFullscreenToggle
          expanded={mapExpanded}
          onToggle={() => setMapExpanded((v) => !v)}
        />
      </div>

      <div className="hike-detail__panel">
        <div className="hike-detail__header">
          <Link to="/history" className="hike-detail__back">
            ← History
          </Link>
          <div className="hike-detail__header-actions">
            <button
              type="button"
              className="hike-detail__action-link"
              onClick={() => exportSingleHike(hike)}
            >
              Export
            </button>
            <button
              type="button"
              className="hike-detail__delete"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete
            </button>
          </div>
        </div>

        {sheet.kind === 'edit-metadata' ? (
          <HikeMetadataForm
            initialName={hike.name}
            initialDescription={hike.description}
            submitLabel="Save"
            onSubmit={({ name, description }) => {
              persist(updateHikeMetadata({ hike, name, description }));
              setSheet({ kind: 'none' });
            }}
            onCancel={() => setSheet({ kind: 'none' })}
          />
        ) : (
          <>
            <div className="hike-detail__title-row">
              <div className="hike-detail__title-block">
                <h1 className="view__title">{hike.name}</h1>
                <p className="view__subtitle">{new Date(hike.startedAt).toLocaleString()}</p>
                {hike.description && (
                  <p className="hike-detail__description">{hike.description}</p>
                )}
              </div>
              <button
                type="button"
                className="record-view__edit-meta"
                onClick={() => setSheet({ kind: 'edit-metadata' })}
              >
                Edit
              </button>
            </div>
          </>
        )}

        <div className="stat-grid">
          <div className="stat">
            <div className="stat__label">Distance</div>
            <div className="stat__value">{formatDistance(hike.stats.distanceMeters, settings.units)}</div>
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
            <div className="stat__label">Elev. loss</div>
            <div className="stat__value">
              {formatElevation(hike.stats.elevationLossMeters, settings.units)}
            </div>
          </div>
          <div className="stat">
            <div className="stat__label">Avg speed</div>
            <div className="stat__value">
              {formatSpeed(hike.stats.averageSpeedMetersPerSecond, settings.units)}
            </div>
          </div>
          <div className="stat">
            <div className="stat__label">Points</div>
            <div className="stat__value">{hike.points.length}</div>
          </div>
        </div>

        <section className="hike-detail__section">
          <div className="hike-detail__section-header">
            <h2 className="hike-detail__section-title">Destination</h2>
            <button
              type="button"
              className={`pill${placementMode === 'destination' ? ' pill--active' : ''}`}
              onClick={() =>
                setPlacementMode((m) => (m === 'destination' ? null : 'destination'))
              }
            >
              {hike.destination ? 'Move on map' : 'Set on map'}
            </button>
          </div>
          {hike.destination ? (
            <AnnotationCard
              annotation={hike.destination}
              onEdit={() =>
                hike.destination &&
                setSheet({ kind: 'edit-destination', destination: hike.destination })
              }
            />
          ) : (
            <p className="hike-detail__empty">No destination set.</p>
          )}
        </section>

        <section className="hike-detail__section">
          <div className="hike-detail__section-header">
            <h2 className="hike-detail__section-title">
              Checkpoints {hike.checkpoints.length > 0 && `(${hike.checkpoints.length})`}
            </h2>
            <button
              type="button"
              className={`pill${placementMode === 'checkpoint' ? ' pill--active' : ''}`}
              onClick={() =>
                setPlacementMode((m) => (m === 'checkpoint' ? null : 'checkpoint'))
              }
            >
              Add on map
            </button>
          </div>
          {hike.checkpoints.length === 0 ? (
            <p className="hike-detail__empty">No checkpoints yet.</p>
          ) : (
            <ul className="hike-detail__list">
              {hike.checkpoints.map((c) => (
                <li key={c.id}>
                  <AnnotationCard
                    annotation={c}
                    onEdit={() => setSheet({ kind: 'edit-checkpoint', checkpoint: c })}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {sheet.kind === 'placement' && (
          <div className="hike-detail__sheet">
            <h2 className="hike-detail__section-title">
              {sheet.pendingKind === 'destination' ? 'New destination' : 'New checkpoint'}
            </h2>
            <AnnotationForm
              titlePlaceholder={sheet.pendingKind === 'destination' ? 'Destination' : 'Checkpoint'}
              submitLabel={sheet.pendingKind === 'destination' ? 'Set destination' : 'Add checkpoint'}
              onSubmit={({ title, note }) => {
                if (sheet.pendingKind === 'destination') {
                  persist(
                    setDestinationUC({
                      hike,
                      id: createId(),
                      lat: sheet.lat,
                      lng: sheet.lng,
                      title,
                      note,
                    }),
                  );
                } else {
                  persist(
                    addCheckpoint({
                      hike,
                      id: createId(),
                      lat: sheet.lat,
                      lng: sheet.lng,
                      title,
                      note,
                    }),
                  );
                }
                setSheet({ kind: 'none' });
              }}
              onCancel={() => setSheet({ kind: 'none' })}
            />
          </div>
        )}

        {sheet.kind === 'edit-checkpoint' && (
          <div className="hike-detail__sheet">
            <h2 className="hike-detail__section-title">Edit checkpoint</h2>
            <AnnotationForm
              titlePlaceholder="Checkpoint"
              submitLabel="Save"
              showDelete
              initialTitle={sheet.checkpoint.title}
              initialNote={sheet.checkpoint.note}
              onSubmit={({ title, note }) => {
                persist(updateCheckpointUC({ hike, id: sheet.checkpoint.id, title, note }));
                setSheet({ kind: 'none' });
              }}
              onCancel={() => setSheet({ kind: 'none' })}
              onDelete={() => {
                persist(removeCheckpointUC(hike, sheet.checkpoint.id));
                setSheet({ kind: 'none' });
              }}
            />
          </div>
        )}

        {sheet.kind === 'edit-destination' && (
          <div className="hike-detail__sheet">
            <h2 className="hike-detail__section-title">Edit destination</h2>
            <AnnotationForm
              titlePlaceholder="Destination"
              submitLabel="Save"
              showDelete
              initialTitle={sheet.destination.title}
              initialNote={sheet.destination.note}
              onSubmit={({ title, note }) => {
                persist(
                  setDestinationUC({
                    hike,
                    id: sheet.destination.id,
                    lat: sheet.destination.lat,
                    lng: sheet.destination.lng,
                    title,
                    note,
                    createdAt: sheet.destination.createdAt,
                  }),
                );
                setSheet({ kind: 'none' });
              }}
              onCancel={() => setSheet({ kind: 'none' })}
              onDelete={() => {
                persist(clearDestinationUC(hike));
                setSheet({ kind: 'none' });
              }}
            />
          </div>
        )}

        {confirmingDelete && (
          <div className="hike-detail__confirm">
            <p>Delete this hike? This cannot be undone.</p>
            <div className="hike-detail__confirm-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={() => {
                  repo.remove(hike.id);
                  navigate('/history');
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnotationCard({ annotation, onEdit }: { annotation: Annotation; onEdit: () => void }) {
  return (
    <button type="button" className="annotation-card" onClick={onEdit}>
      <div className="annotation-card__title">{annotation.title}</div>
      {annotation.note && <div className="annotation-card__note">{annotation.note}</div>}
      <div className="annotation-card__coords">
        {annotation.lat.toFixed(5)}, {annotation.lng.toFixed(5)}
      </div>
    </button>
  );
}
