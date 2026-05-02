import type { Hike } from '@/hike-storage/types/hike';
import type { Annotation } from '@/hike-storage/types/annotation';

export interface SetDestinationInput {
  hike: Hike;
  id: string;
  lat: number;
  lng: number;
  title?: string;
  note?: string;
  createdAt?: number;
}

export function setDestination({ hike, id, lat, lng, title, note, createdAt }: SetDestinationInput): Hike {
  const trimmedNote = note?.trim();
  const destination: Annotation = {
    id,
    lat,
    lng,
    title: title?.trim() || 'Destination',
    note: trimmedNote ? trimmedNote : undefined,
    createdAt: createdAt ?? Date.now(),
  };
  return { ...hike, destination };
}

export function clearDestination(hike: Hike): Hike {
  if (!hike.destination) return hike;
  const { destination: _omit, ...rest } = hike;
  void _omit;
  return rest;
}
