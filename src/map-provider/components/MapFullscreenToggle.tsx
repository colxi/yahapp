interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export function MapFullscreenToggle({ expanded, onToggle }: Props) {
  return (
    <button
      type="button"
      className="map-fullscreen-toggle"
      onClick={onToggle}
      aria-label={expanded ? 'Show panel' : 'Expand map'}
      aria-pressed={expanded}
      title={expanded ? 'Show panel' : 'Expand map'}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        {expanded ? (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 4v5H4 M15 4v5h5 M9 20v-5H4 M15 20v-5h5"
          />
        ) : (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5"
          />
        )}
      </svg>
    </button>
  );
}
