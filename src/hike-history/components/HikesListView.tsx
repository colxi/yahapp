import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHikesRepository } from '@/hike-storage/use-cases/use-hikes-repository';
import { useSettings } from '@/settings/use-cases/use-settings';
import { formatDistance } from '@/settings/use-cases/format-units';
import { formatDuration } from '@/tools/time/format-duration';
import type { Hike } from '@/hike-storage/types/hike';
import './hikes-list-view.css';

export function HikesListView() {
  const repo = useHikesRepository();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [hikes, setHikes] = useState<Hike[]>([]);

  useEffect(() => {
    setHikes(repo.list());
  }, [repo]);

  const total = useMemo(() => {
    const distance = hikes.reduce((sum, h) => sum + h.stats.distanceMeters, 0);
    return { count: hikes.length, distance };
  }, [hikes]);

  return (
    <div className="view">
      <h1 className="view__title">Your hikes</h1>
      <p className="view__subtitle">
        {total.count} hike{total.count === 1 ? '' : 's'} · {formatDistance(total.distance, settings.units)}
      </p>

      {hikes.length > 0 && (
        <button
          type="button"
          className="button button--ghost button--block"
          onClick={() => navigate('/history/all')}
        >
          View all on a single map
        </button>
      )}

      {hikes.length === 0 ? (
        <div className="card hikes-empty">
          <p>No hikes yet. Hit "Record" to log your first one.</p>
        </div>
      ) : (
        <ul className="hikes-list">
          {hikes.map((h) => (
            <li key={h.id}>
              <Link to={`/history/${h.id}`} className="hike-card">
                <div className="hike-card__title">{h.name}</div>
                <div className="hike-card__meta">
                  {new Date(h.startedAt).toLocaleString()}
                </div>
                <div className="hike-card__stats">
                  <span>{formatDistance(h.stats.distanceMeters, settings.units)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDuration(h.stats.durationMs)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
