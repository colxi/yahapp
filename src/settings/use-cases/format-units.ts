import type { UnitsSystem } from '../types/settings';

export function formatDistance(meters: number, units: UnitsSystem): string {
  if (!Number.isFinite(meters) || meters < 0) meters = 0;
  if (units === 'imperial') {
    const miles = meters / 1609.344;
    if (miles >= 0.1) return `${miles.toFixed(2)} mi`;
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

export function formatElevation(meters: number, units: UnitsSystem): string {
  if (!Number.isFinite(meters) || meters < 0) meters = 0;
  if (units === 'imperial') {
    return `${Math.round(meters * 3.28084)} ft`;
  }
  return `${Math.round(meters)} m`;
}

export function formatSpeed(metersPerSecond: number, units: UnitsSystem): string {
  if (!Number.isFinite(metersPerSecond) || metersPerSecond < 0) metersPerSecond = 0;
  if (units === 'imperial') {
    const mph = metersPerSecond * 2.23694;
    return `${mph.toFixed(1)} mph`;
  }
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}
