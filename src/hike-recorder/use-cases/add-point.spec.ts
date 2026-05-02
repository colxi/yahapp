import { startHike } from './start-hike';
import { addPoint } from './add-point';

const hike = startHike({ id: 'h1', startedAt: 0 });

describe('addPoint', () => {
  it('appends a first point and resets duration to 0', () => {
    const next = addPoint(hike, { lat: 40, lng: -3, alt: 100, timestamp: 0 });
    expect(next.points).toHaveLength(1);
    expect(next.stats.distanceMeters).toBe(0);
  });

  it('grows distance as more points are added', () => {
    let h = addPoint(hike, { lat: 40, lng: -3, alt: 100, timestamp: 0 });
    h = addPoint(h, { lat: 40.001, lng: -3, alt: 102, timestamp: 60_000 });
    h = addPoint(h, { lat: 40.002, lng: -3, alt: 104, timestamp: 120_000 });
    expect(h.points).toHaveLength(3);
    expect(h.stats.distanceMeters).toBeGreaterThan(100);
    expect(h.stats.durationMs).toBe(120_000);
  });

  it('ignores duplicate timestamps and identical coordinates', () => {
    let h = addPoint(hike, { lat: 40, lng: -3, timestamp: 0 });
    h = addPoint(h, { lat: 40, lng: -3, timestamp: 0 });
    expect(h.points).toHaveLength(1);
  });

  it('does nothing when the hike is not recording', () => {
    const paused = { ...hike, status: 'paused' as const };
    const next = addPoint(paused, { lat: 1, lng: 1, timestamp: 1 });
    expect(next).toBe(paused);
  });
});
