import type { Hike } from '@/hike-storage/types/hike';

export interface BBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function bboxForHike(hike: Hike): BBox | null {
  if (hike.points.length === 0) return null;
  let north = hike.points[0].lat;
  let south = hike.points[0].lat;
  let east = hike.points[0].lng;
  let west = hike.points[0].lng;
  for (const p of hike.points) {
    if (p.lat > north) north = p.lat;
    if (p.lat < south) south = p.lat;
    if (p.lng > east) east = p.lng;
    if (p.lng < west) west = p.lng;
  }
  return { north, south, east, west };
}

export function mergeBboxes(boxes: readonly (BBox | null)[]): BBox | null {
  const valid = boxes.filter((b): b is BBox => b !== null);
  if (valid.length === 0) return null;
  return valid.reduce((acc, b) => ({
    north: Math.max(acc.north, b.north),
    south: Math.min(acc.south, b.south),
    east: Math.max(acc.east, b.east),
    west: Math.min(acc.west, b.west),
  }));
}
