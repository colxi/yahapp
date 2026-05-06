import { useCallback, useRef } from 'react';

interface Props {
  heading: number | null;
  onChange: (heading: number) => void;
  onReset: () => void;
}

const SIZE = 180;
const CENTER = SIZE / 2;
const OUTER_R = SIZE / 2 - 4;
const TICK_OUTER = OUTER_R;
const TICK_INNER_MAJOR = OUTER_R - 14;
const TICK_INNER_MINOR = OUTER_R - 8;
const LABEL_R = OUTER_R - 28;

const CARDINALS = [
  { deg: 0, label: 'N', color: '#ef4444' },
  { deg: 90, label: 'E', color: 'var(--color-text-muted)' },
  { deg: 180, label: 'S', color: 'var(--color-text-muted)' },
  { deg: 270, label: 'W', color: 'var(--color-text-muted)' },
];

function polarToXY(deg: number, r: number): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function angleFromCenter(clientX: number, clientY: number, rect: DOMRect): number {
  const dx = clientX - (rect.left + rect.width / 2);
  const dy = clientY - (rect.top + rect.height / 2);
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return ((deg % 360) + 360) % 360;
}

export function DebugCompass({ heading, onChange, onReset }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const handlePointerEvent = useCallback(
    (e: React.PointerEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const deg = Math.round(angleFromCenter(e.clientX, e.clientY, rect));
      onChange(deg % 360);
    },
    [onChange],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as Element).setPointerCapture(e.pointerId);
      handlePointerEvent(e);
    },
    [handlePointerEvent],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      handlePointerEvent(e);
    },
    [handlePointerEvent],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const displayHeading = heading ?? 0;

  const ticks = Array.from({ length: 36 }, (_, i) => {
    const deg = i * 10;
    const isMajor = deg % 30 === 0;
    const inner = isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR;
    const p1 = polarToXY(deg, TICK_OUTER);
    const p2 = polarToXY(deg, inner);
    return (
      <line
        key={deg}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke="var(--color-text-dim)"
        strokeWidth={isMajor ? 2 : 1}
        strokeLinecap="round"
      />
    );
  });

  const labels = CARDINALS.map(({ deg, label, color }) => {
    const p = polarToXY(deg, LABEL_R);
    return (
      <text
        key={label}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize="13"
        fontWeight="700"
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>
    );
  });

  const needleTip = polarToXY(displayHeading, OUTER_R - 16);
  const needleBase1 = polarToXY(displayHeading + 140, 12);
  const needleBase2 = polarToXY(displayHeading - 140, 12);
  const needleTail = polarToXY(displayHeading + 180, OUTER_R - 36);

  return (
    <div className="debug-compass">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: 'grab', touchAction: 'none' }}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER_R}
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        {ticks}
        {labels}

        {/* Needle — red north half */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill="#ef4444"
          opacity="0.9"
        />
        {/* Needle — grey south half */}
        <polygon
          points={`${needleTail.x},${needleTail.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
          fill="#94a3b8"
          opacity="0.7"
        />

        <circle cx={CENTER} cy={CENTER} r="4" fill="var(--color-text)" />
      </svg>

      <div className="debug-compass__readout">
        <span className="debug-compass__value">
          {heading !== null ? `${Math.round(heading)}°` : '—'}
        </span>
        <button type="button" className="debug-compass__reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
