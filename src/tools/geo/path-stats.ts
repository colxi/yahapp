import { haversineMeters, type LatLng } from './haversine';

export interface PathSample extends LatLng {
  alt?: number;
  timestamp: number;
}

export interface PathStats {
  distanceMeters: number;
  durationMs: number;
  movingDurationMs: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  averageSpeedMetersPerSecond: number;
  bbox: { north: number; south: number; east: number; west: number } | null;
}

const MOVING_THRESHOLD_METERS = 1.5;
const ELEVATION_NOISE_THRESHOLD_METERS = 1;

export function computePathStats(points: readonly PathSample[]): PathStats {
  if (points.length < 2) {
    const single = points[0];
    return {
      distanceMeters: 0,
      durationMs: 0,
      movingDurationMs: 0,
      elevationGainMeters: 0,
      elevationLossMeters: 0,
      averageSpeedMetersPerSecond: 0,
      bbox: single ? { north: single.lat, south: single.lat, east: single.lng, west: single.lng } : null,
    };
  }

  let distance = 0;
  let movingDuration = 0;
  let elevationGain = 0;
  let elevationLoss = 0;

  let north = points[0].lat;
  let south = points[0].lat;
  let east = points[0].lng;
  let west = points[0].lng;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const segmentDistance = haversineMeters(prev, curr);
    distance += segmentDistance;

    if (segmentDistance >= MOVING_THRESHOLD_METERS) {
      movingDuration += Math.max(0, curr.timestamp - prev.timestamp);
    }

    if (typeof prev.alt === 'number' && typeof curr.alt === 'number') {
      const dAlt = curr.alt - prev.alt;
      if (dAlt > ELEVATION_NOISE_THRESHOLD_METERS) {
        elevationGain += dAlt;
      } else if (dAlt < -ELEVATION_NOISE_THRESHOLD_METERS) {
        elevationLoss += -dAlt;
      }
    }

    if (curr.lat > north) north = curr.lat;
    if (curr.lat < south) south = curr.lat;
    if (curr.lng > east) east = curr.lng;
    if (curr.lng < west) west = curr.lng;
  }

  const totalDuration = points[points.length - 1].timestamp - points[0].timestamp;
  const averageSpeed = movingDuration > 0 ? distance / (movingDuration / 1000) : 0;

  return {
    distanceMeters: distance,
    durationMs: Math.max(0, totalDuration),
    movingDurationMs: movingDuration,
    elevationGainMeters: elevationGain,
    elevationLossMeters: elevationLoss,
    averageSpeedMetersPerSecond: averageSpeed,
    bbox: { north, south, east, west },
  };
}
