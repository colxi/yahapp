import { computePathStats, type PathSample } from './path-stats';

describe('computePathStats', () => {
  it('handles an empty path', () => {
    const stats = computePathStats([]);
    expect(stats.distanceMeters).toBe(0);
    expect(stats.bbox).toBeNull();
  });

  it('handles a single-point path', () => {
    const stats = computePathStats([{ lat: 1, lng: 2, timestamp: 0 }]);
    expect(stats.distanceMeters).toBe(0);
    expect(stats.bbox).toEqual({ north: 1, south: 1, east: 2, west: 2 });
  });

  it('aggregates distance, duration, and bbox over a multi-point path', () => {
    const points: PathSample[] = [
      { lat: 40.4168, lng: -3.7038, alt: 600, timestamp: 0 },
      { lat: 40.418, lng: -3.7038, alt: 605, timestamp: 60_000 },
      { lat: 40.418, lng: -3.702, alt: 603, timestamp: 120_000 },
    ];
    const stats = computePathStats(points);
    expect(stats.distanceMeters).toBeGreaterThan(0);
    expect(stats.durationMs).toBe(120_000);
    expect(stats.movingDurationMs).toBeGreaterThan(0);
    expect(stats.elevationGainMeters).toBeGreaterThanOrEqual(4);
    expect(stats.elevationLossMeters).toBeGreaterThan(0);
    expect(stats.bbox).not.toBeNull();
    expect(stats.bbox!.north).toBeCloseTo(40.418);
    expect(stats.bbox!.south).toBeCloseTo(40.4168);
  });

  it('ignores tiny elevation jitter below the noise threshold', () => {
    const points: PathSample[] = [
      { lat: 0, lng: 0, alt: 100, timestamp: 0 },
      { lat: 0.001, lng: 0, alt: 100.3, timestamp: 30_000 },
      { lat: 0.002, lng: 0, alt: 99.9, timestamp: 60_000 },
    ];
    const stats = computePathStats(points);
    expect(stats.elevationGainMeters).toBe(0);
    expect(stats.elevationLossMeters).toBe(0);
  });
});
