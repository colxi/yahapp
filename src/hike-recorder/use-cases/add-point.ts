import type { GeoSample } from '@/location-provider/types/geo-sample';
import type { Hike } from '@/hike-storage/types/hike';
import { computePathStats } from '@/tools/geo/path-stats';

const MIN_DISTANCE_METERS = 1;

export function addPoint(hike: Hike, sample: GeoSample): Hike {
  if (hike.status !== 'recording') return hike;

  const last = hike.points[hike.points.length - 1];
  if (last) {
    const dx = Math.abs(sample.lat - last.lat) + Math.abs(sample.lng - last.lng);
    if (dx < 1e-7 && sample.timestamp - last.timestamp < 500) return hike;
    if (sample.timestamp <= last.timestamp) return hike;
  }

  const points = [...hike.points, sample];
  const recomputed = computePathStats(
    points.map((p) => ({ lat: p.lat, lng: p.lng, alt: p.alt, timestamp: p.timestamp })),
  );

  if (
    last &&
    recomputed.distanceMeters - hike.stats.distanceMeters < MIN_DISTANCE_METERS &&
    sample.timestamp - last.timestamp < 2_000
  ) {
    return hike;
  }

  return {
    ...hike,
    points,
    stats: {
      distanceMeters: recomputed.distanceMeters,
      durationMs: recomputed.durationMs,
      movingDurationMs: recomputed.movingDurationMs,
      elevationGainMeters: recomputed.elevationGainMeters,
      elevationLossMeters: recomputed.elevationLossMeters,
      averageSpeedMetersPerSecond: recomputed.averageSpeedMetersPerSecond,
    },
  };
}
