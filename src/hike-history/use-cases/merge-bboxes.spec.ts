import { bboxForHike, mergeBboxes } from './merge-bboxes';
import type { Hike } from '@/hike-storage/types/hike';

const baseHike: Omit<Hike, 'points'> = {
  id: 'h1',
  name: 'h1',
  status: 'completed',
  startedAt: 0,
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

describe('bboxForHike', () => {
  it('returns null for empty paths', () => {
    expect(bboxForHike({ ...baseHike, points: [] })).toBeNull();
  });

  it('computes the tight bbox of the points', () => {
    const bbox = bboxForHike({
      ...baseHike,
      points: [
        { lat: 1, lng: 1, timestamp: 0 },
        { lat: 3, lng: -2, timestamp: 1 },
        { lat: 0, lng: 4, timestamp: 2 },
      ],
    });
    expect(bbox).toEqual({ north: 3, south: 0, east: 4, west: -2 });
  });
});

describe('mergeBboxes', () => {
  it('returns null when there are no valid boxes', () => {
    expect(mergeBboxes([null, null])).toBeNull();
  });

  it('merges into the smallest enclosing box', () => {
    expect(
      mergeBboxes([
        { north: 1, south: 0, east: 1, west: 0 },
        { north: 5, south: -2, east: 2, west: -3 },
      ]),
    ).toEqual({ north: 5, south: -2, east: 2, west: -3 });
  });
});
