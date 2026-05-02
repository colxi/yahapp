import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHikesRepository } from '@/hike-storage/use-cases/use-hikes-repository';
import { useSettings } from '@/settings/use-cases/use-settings';
import { formatDistance, formatElevation } from '@/settings/use-cases/format-units';
import { formatDuration } from '@/tools/time/format-duration';
import type { Hike } from '@/hike-storage/types/hike';
import './home-view.css';

export function HomeView() {
  const repo = useHikesRepository();
  const { settings } = useSettings();
  const [hikes, setHikes] = useState<Hike[]>([]);

  useEffect(() => {
    setHikes(repo.list());
  }, [repo]);

  const totals = useMemo(() => {
    return hikes.reduce(
      (acc, h) => ({
        count: acc.count + 1,
        distance: acc.distance + h.stats.distanceMeters,
        elevation: acc.elevation + h.stats.elevationGainMeters,
        duration: acc.duration + h.stats.durationMs,
      }),
      { count: 0, distance: 0, elevation: 0, duration: 0 },
    );
  }, [hikes]);

  const lastHike = hikes[0];

  return (
    <div className="view home-view">
      <header className="home-view__header">
        <h1 className="home-view__greeting">Yahapp</h1>
        <p className="view__subtitle">Track every step. Remember every trail.</p>
      </header>

      <Link to="/record" className="home-view__cta">
        <span className="home-view__cta-label">Start a hike</span>
        <span className="home-view__cta-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor" d="M8 5v14l11-7-11-7Z" />
          </svg>
        </span>
      </Link>

      <section className="home-view__totals">
        <h2 className="home-view__section-title">Lifetime</h2>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat__label">Hikes</div>
            <div className="stat__value">{totals.count}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Distance</div>
            <div className="stat__value">{formatDistance(totals.distance, settings.units)}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Elev. gain</div>
            <div className="stat__value">{formatElevation(totals.elevation, settings.units)}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Time</div>
            <div className="stat__value">{formatDuration(totals.duration)}</div>
          </div>
        </div>
      </section>

      {lastHike && (
        <section className="home-view__recent">
          <h2 className="home-view__section-title">Most recent</h2>
          <Link to={`/history/${lastHike.id}`} className="card home-view__recent-card">
            <div className="home-view__recent-name">{lastHike.name}</div>
            <div className="home-view__recent-meta">
              {new Date(lastHike.startedAt).toLocaleString()}
            </div>
            <div className="home-view__recent-stats">
              <span>{formatDistance(lastHike.stats.distanceMeters, settings.units)}</span>
              <span aria-hidden="true">·</span>
              <span>{formatDuration(lastHike.stats.durationMs)}</span>
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
