import type { Hike } from '@/hike-storage/types/hike';

export interface CompleteHikeInput {
  hike: Hike;
  endedAt?: number;
  name?: string;
}

export function completeHike({ hike, endedAt, name }: CompleteHikeInput): Hike {
  return {
    ...hike,
    name: name?.trim() || hike.name,
    status: 'completed',
    endedAt: endedAt ?? Date.now(),
  };
}
