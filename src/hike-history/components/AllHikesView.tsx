import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHikesRepository } from '@/hike-storage/use-cases/use-hikes-repository';
import { useMapProvider } from '@/map-provider/use-cases/use-map-provider';
import { MapFullscreenToggle } from '@/map-provider/components/MapFullscreenToggle';
import { useSettings } from '@/settings/use-cases/use-settings';
import { formatDistance } from '@/settings/use-cases/format-units';
import type { Hike } from '@/hike-storage/types/hike';
import { bboxForHike, mergeBboxes } from '../use-cases/merge-bboxes';
import '@/map-provider/components/map.css';
import './all-hikes-view.css';

const PALETTE = ['#4ade80', '#facc15', '#60a5fa', '#f472b6', '#fb923c', '#22d3ee', '#a78bfa', '#f87171'];

export function AllHikesView() {
  const repo = useHikesRepository();
  const map = useMapProvider();
  const { settings } = useSettings();
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [mapExpanded, setMapExpanded] = useState(false);

  useEffect(() => {
    setHikes(repo.list());
  }, [repo]);

  const bbox = useMemo(() => mergeBboxes(hikes.map(bboxForHike)), [hikes]);
  const totalDistance = hikes.reduce((s, h) => s + h.stats.distanceMeters, 0);

  return (
    <div className={`all-hikes${mapExpanded ? ' all-hikes--map-only' : ''}`}>
      <div className="all-hikes__map">
        <map.View bounds={bbox ?? undefined}>
          {hikes.map((h, idx) =>
            h.points.length > 1 ? (
              <map.PathOverlay
                key={h.id}
                points={h.points.map((p) => ({ lat: p.lat, lng: p.lng }))}
                style={{ color: PALETTE[idx % PALETTE.length], width: 4, opacity: 0.9 }}
              />
            ) : null,
          )}
        </map.View>
        <MapFullscreenToggle
          expanded={mapExpanded}
          onToggle={() => setMapExpanded((v) => !v)}
        />
      </div>

      <div className="all-hikes__panel">
        <div className="all-hikes__header">
          <Link to="/history" className="all-hikes__back">
            ← History
          </Link>
        </div>
        <h1 className="view__title">All hikes</h1>
        <p className="view__subtitle">
          {hikes.length} hike{hikes.length === 1 ? '' : 's'} ·{' '}
          {formatDistance(totalDistance, settings.units)} total
        </p>

        <ul className="all-hikes__legend">
          {hikes.map((h, idx) => (
            <li key={h.id}>
              <span
                className="all-hikes__swatch"
                style={{ background: PALETTE[idx % PALETTE.length] }}
                aria-hidden="true"
              />
              <Link to={`/history/${h.id}`} className="all-hikes__link">
                {h.name}
              </Link>
              <span className="all-hikes__meta">
                {formatDistance(h.stats.distanceMeters, settings.units)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
