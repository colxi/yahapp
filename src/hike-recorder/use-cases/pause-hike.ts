import type { Hike } from '@/hike-storage/types/hike';

export function pauseHike(hike: Hike): Hike {
  if (hike.status !== 'recording') return hike;
  return { ...hike, status: 'paused' };
}

export function resumeHike(hike: Hike): Hike {
  if (hike.status !== 'paused') return hike;
  return { ...hike, status: 'recording' };
}
