import { haversineMeters } from './haversine';

describe('haversineMeters', () => {
  it('returns 0 for identical points', () => {
    expect(haversineMeters({ lat: 40.4, lng: -3.7 }, { lat: 40.4, lng: -3.7 })).toBe(0);
  });

  it('matches the well-known distance between New York and Los Angeles within 0.5%', () => {
    const ny = { lat: 40.7128, lng: -74.006 };
    const la = { lat: 34.0522, lng: -118.2437 };
    const distance = haversineMeters(ny, la);
    const expected = 3_944_000;
    expect(Math.abs(distance - expected) / expected).toBeLessThan(0.005);
  });

  it('is symmetric', () => {
    const a = { lat: 51.5, lng: -0.12 };
    const b = { lat: 48.85, lng: 2.35 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 5);
  });
});
