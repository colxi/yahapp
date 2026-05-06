import { isDebugEnabled, useDebugStore } from '../use-cases/debug-store';
import { DebugMiniMap } from './DebugMiniMap';
import { DebugCompass } from './DebugCompass';
import './debug-widget.css';

export function DebugWidget() {
  if (!isDebugEnabled) return null;
  return <DebugWidgetInner />;
}

function DebugWidgetInner() {
  const { isPanelOpen, setIsPanelOpen, mockCoordinates, setMockCoordinates, mockHeading, setMockHeading } =
    useDebugStore();

  return (
    <div className={`debug-widget ${isPanelOpen ? 'debug-widget--open' : ''}`}>
      <button
        type="button"
        className="debug-widget__tab"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        aria-label={isPanelOpen ? 'Close debug panel' : 'Open debug panel'}
      >
        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
          <path d="M10 2a1 1 0 011 1v1.323a3.954 3.954 0 011.39.573l.935-.935a1 1 0 111.414 1.414l-.935.935c.254.42.44.89.573 1.39H15.7a1 1 0 110 2h-1.323a3.954 3.954 0 01-.573 1.39l.935.935a1 1 0 01-1.414 1.414l-.935-.935a3.954 3.954 0 01-1.39.573V14.7a1 1 0 11-2 0v-1.323a3.954 3.954 0 01-1.39-.573l-.935.935a1 1 0 01-1.414-1.414l.935-.935A3.954 3.954 0 015.623 10H4.3a1 1 0 110-2h1.323c.133-.5.319-.97.573-1.39l-.935-.935A1 1 0 016.675 4.26l.935.935A3.954 3.954 0 019 4.623V3a1 1 0 011-1zm0 5a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <span className="debug-widget__tab-label">Debug</span>
      </button>

      <div className="debug-widget__panel">
        <div className="debug-widget__header">
          <h2 className="debug-widget__title">Debug Tools</h2>
          <button
            type="button"
            className="debug-widget__close"
            onClick={() => setIsPanelOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="debug-widget__content">
          <section className="debug-widget__section">
            <h3 className="debug-widget__section-title">Mock Coordinates</h3>
            <p className="debug-widget__hint">Click on the map to set device position</p>
            <DebugMiniMap
              coordinates={mockCoordinates}
              onChange={setMockCoordinates}
              onReset={() => setMockCoordinates(null)}
            />
          </section>

          <section className="debug-widget__section">
            <h3 className="debug-widget__section-title">Mock Orientation</h3>
            <p className="debug-widget__hint">Click &amp; drag to rotate the compass needle</p>
            <DebugCompass
              heading={mockHeading}
              onChange={setMockHeading}
              onReset={() => setMockHeading(null)}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
