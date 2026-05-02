import { useState } from 'react';
import { useTheme } from '@/app/providers/use-theme';
import { useSettings } from '../use-cases/use-settings';
import { useHikesRepository } from '@/hike-storage/use-cases/use-hikes-repository';
import { usePlatform } from '@/tools/platform/use-platform';
import { exportHikes } from '@/hike-storage/use-cases/export-hikes';
import { pickFileAndImport, type ImportResult } from '@/hike-storage/use-cases/import-hikes';
import './settings-view.css';

const PLATFORM_LABEL: Record<'web' | 'ios' | 'android', string> = {
  web: 'Browser',
  ios: 'iOS native',
  android: 'Android native',
};

export function SettingsView() {
  const { settings, update, reset } = useSettings();
  const { mode, setMode } = useTheme();
  const repo = useHikesRepository();
  const platform = usePlatform();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  return (
    <div className="view settings-view">
      <h1 className="view__title">Settings</h1>
      <p className="view__subtitle">Tune Yahapp to your liking.</p>

      <section className="settings-section">
        <h2 className="settings-section__title">Appearance</h2>
        <div className="settings-row">
          <span className="settings-row__label">Theme</span>
          <div className="segmented">
            {(['dark', 'light', 'system'] as const).map((m) => (
              <button
                key={m}
                className={`segmented__option${mode === m ? ' segmented__option--active' : ''}`}
                onClick={() => setMode(m)}
                type="button"
              >
                {m[0]?.toUpperCase()}{m.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section__title">Units</h2>
        <div className="settings-row">
          <span className="settings-row__label">System</span>
          <div className="segmented">
            {(['metric', 'imperial'] as const).map((u) => (
              <button
                key={u}
                className={`segmented__option${settings.units === u ? ' segmented__option--active' : ''}`}
                onClick={() => update({ units: u })}
                type="button"
              >
                {u[0]?.toUpperCase()}{u.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section__title">Map</h2>
        <div className="settings-row">
          <span className="settings-row__label">Provider</span>
          <select
            className="select"
            value={settings.mapProviderId}
            onChange={(e) => update({ mapProviderId: e.target.value as typeof settings.mapProviderId })}
          >
            <option value="google-maps">Google Maps (Terrain)</option>
          </select>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section__title">Recording</h2>
        <label className="settings-row settings-row--toggle">
          <span className="settings-row__label">Background recording</span>
          <input
            type="checkbox"
            checked={settings.backgroundRecording}
            onChange={(e) => update({ backgroundRecording: e.target.checked })}
          />
        </label>
        <p className="settings-help">
          Continues recording when the app is backgrounded. Requires location permission "always" on iOS and
          background location permission on Android.
        </p>
      </section>

      <section className="settings-section">
        <h2 className="settings-section__title">Data</h2>
        <div className="settings-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              const hikes = repo.list();
              if (hikes.length === 0) {
                setImportStatus('Nothing to export — no hikes saved.');
                return;
              }
              exportHikes(hikes);
              setImportStatus(`Exported ${hikes.length} hike${hikes.length > 1 ? 's' : ''}.`);
            }}
          >
            Export hikes
          </button>
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
                }
              } catch (err) {
                setImportStatus(err instanceof Error ? err.message : 'Import failed.');
              }
            }}
          >
            Import hikes
          </button>
        </div>
        {importStatus && <p className="settings-help">{importStatus}</p>}

        {confirmingClear ? (
          <div className="settings-confirm" style={{ marginTop: 12 }}>
            <p>Delete all saved hikes? This cannot be undone.</p>
            <div className="settings-confirm__actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setConfirmingClear(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={() => {
                  repo.clear();
                  setConfirmingClear(false);
                }}
              >
                Delete everything
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-actions" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => reset()}
            >
              Reset settings
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() => setConfirmingClear(true)}
            >
              Clear all hikes
            </button>
          </div>
        )}
      </section>

      <section className="settings-section">
        <h2 className="settings-section__title">About this device</h2>
        <div className="settings-row">
          <span className="settings-row__label">Platform</span>
          <span className="settings-row__value">{PLATFORM_LABEL[platform.platform]}</span>
        </div>
        <div className="settings-row">
          <span className="settings-row__label">Installed (standalone)</span>
          <span className="settings-row__value">{platform.isStandalone ? 'Yes' : 'No'}</span>
        </div>
        <div className="settings-row">
          <span className="settings-row__label">Secure context</span>
          <span className="settings-row__value">{platform.isSecureContext ? 'Yes' : 'No'}</span>
        </div>
        {!platform.isNative && (
          <p className="settings-help">
            Running in the browser. Background recording is best-effort and pauses if the tab is closed
            or fully suspended. For real background tracking, install the iOS or Android app.
          </p>
        )}
      </section>

      <section className="settings-section settings-section--footer">
        <p className="settings-help">Yahapp v0.1.0</p>
      </section>
    </div>
  );
}
