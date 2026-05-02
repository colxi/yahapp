import type { Hike } from '@/hike-storage/types/hike';

export interface StartHikeInput {
  id: string;
  name?: string;
  description?: string;
  startedAt?: number;
}

export function startHike(input: StartHikeInput): Hike {
  const startedAt = input.startedAt ?? Date.now();
  const description = input.description?.trim();
  return {
    id: input.id,
    name: input.name?.trim() || `Hike on ${new Date(startedAt).toLocaleString()}`,
    description: description ? description : undefined,
    status: 'recording',
    startedAt,
    points: [],
    stats: {
      distanceMeters: 0,
      durationMs: 0,
      movingDurationMs: 0,
      elevationGainMeters: 0,
      elevationLossMeters: 0,
      averageSpeedMetersPerSecond: 0,
    },
    checkpoints: [],
  };
}
