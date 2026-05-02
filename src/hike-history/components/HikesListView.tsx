import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHikesRepository } from '@/hike-storage/use-cases/use-hikes-repository';
import { useSettings } from '@/settings/use-cases/use-settings';
import { formatDistance } from '@/settings/use-cases/format-units';
import { formatDuration } from '@/tools/time/format-duration';
import { pickFileAndImport, type ImportResult } from '@/hike-storage/use-cases/import-hikes';
import type { Hike } from '@/hike-storage/types/hike';
import './hikes-list-view.css';

export function HikesListView() {
  const repo = useHikesRepository();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const refreshHikes = () => setHikes(repo.list());

  useEffect(() => {
    refreshHikes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <div className="hikes-list-actions">
        {hikes.length > 0 && (
          <button
            type="button"
            className="button button--ghost"
            onClick={() => navigate('/history/all')}
          >
            View all on map
          </button>
        )}
        <button
          type="button"
          className="button button--ghost"
          onClick={async () => {
            try {
              setImportStatus(null);
              const result: ImportResult = await pickFileAndImport(repo);
              if (result.total === 0) {
                setImportStatus('The file contains no hikes.');
              } else {
                setImportStatus(
                  `Imported ${result.added} hike${result.added !== 1 ? 's' : ''}` +
                  (result.skipped > 0 ? `, ${result.skipped} already existed` : '') +
                  '.',
                );
                refreshHikes();
              }
            } catch (err) {
              setImportStatus(err instanceof Error ? err.message : 'Import failed.');
            }
          }}
        >
          Import hike
        </button>
      </div>
      {importStatus && <p className="hikes-import-status">{importStatus}</p>}

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
