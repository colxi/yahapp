import { useMemo } from 'react';
import type { GeoSample } from '@/location-provider/types/geo-sample';
import { haversineMeters } from '@/tools/geo/haversine';
import './elevation-profile.css';

interface Props {
  points: readonly GeoSample[];
}

interface ElevationPoint {
  distance: number;
  altitude: number;
}

function buildProfile(points: readonly GeoSample[]): ElevationPoint[] {
  const result: ElevationPoint[] = [];
  let cumulativeDistance = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (typeof p.alt !== 'number' || Number.isNaN(p.alt)) continue;

    if (i > 0) {
      cumulativeDistance += haversineMeters(points[i - 1], p);
    }
    result.push({ distance: cumulativeDistance, altitude: p.alt });
  }

  return result;
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 80;
const PADDING_TOP = 8;
const PADDING_BOTTOM = 2;

function buildPath(
  profile: ElevationPoint[],
  totalDistance: number,
  minAlt: number,
  maxAlt: number,
): { line: string; area: string } {
  const altRange = maxAlt - minAlt || 1;
  const usableHeight = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const toX = (d: number) => (d / totalDistance) * SVG_WIDTH;
  const toY = (a: number) =>
    PADDING_TOP + usableHeight - ((a - minAlt) / altRange) * usableHeight;

  const linePoints = profile.map((p) => `${toX(p.distance)},${toY(p.altitude)}`);
  const line = `M${linePoints.join('L')}`;

  const area =
    `M${toX(profile[0].distance)},${SVG_HEIGHT}` +
    `L${linePoints.join('L')}` +
    `L${toX(profile[profile.length - 1].distance)},${SVG_HEIGHT}Z`;

  return { line, area };
}

export function ElevationProfile({ points }: Props) {
  const { profile, minAlt, maxAlt, totalDistance } = useMemo(() => {
    const prof = buildProfile(points);
    if (prof.length < 2) return { profile: prof, minAlt: 0, maxAlt: 0, totalDistance: 0 };

    let min = Infinity;
    let max = -Infinity;
    for (const p of prof) {
      if (p.altitude < min) min = p.altitude;
      if (p.altitude > max) max = p.altitude;
    }
    return {
      profile: prof,
      minAlt: min,
      maxAlt: max,
      totalDistance: prof[prof.length - 1].distance,
    };
  }, [points]);

  if (profile.length < 2 || totalDistance === 0) return null;

  const { line, area } = buildPath(profile, totalDistance, minAlt, maxAlt);

  return (
    <div className="elevation-profile">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="none"
        className="elevation-profile__svg"
      >
        <defs>
          <linearGradient id="elev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#elev-fill)" />
        <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="elevation-profile__labels">
        <span className="elevation-profile__label">{Math.round(maxAlt)} m</span>
        <span className="elevation-profile__label">{Math.round(minAlt)} m</span>
      </div>
    </div>
  );
}
