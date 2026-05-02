import type { GeoSample } from '@/location-provider/types/geo-sample';
import type { Annotation } from './annotation';

export type HikeStatus = 'recording' | 'paused' | 'completed';

export interface HikeStats {
  distanceMeters: number;
  durationMs: number;
  movingDurationMs: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  averageSpeedMetersPerSecond: number;
}

export interface Hike {
  id: string;
  name: string;
  description?: string;
  status: HikeStatus;
  startedAt: number;
  endedAt?: number;
  points: GeoSample[];
  stats: HikeStats;
  destination?: Annotation;
  checkpoints: Annotation[];
}
