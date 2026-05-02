import { startHike } from './start-hike';

describe('startHike', () => {
  it('creates a hike in the recording state with empty stats, points, and checkpoints', () => {
    const h = startHike({ id: 'h1', startedAt: 1_000 });
    expect(h.id).toBe('h1');
    expect(h.status).toBe('recording');
    expect(h.startedAt).toBe(1_000);
    expect(h.points).toEqual([]);
    expect(h.checkpoints).toEqual([]);
    expect(h.destination).toBeUndefined();
    expect(h.description).toBeUndefined();
    expect(h.stats).toEqual({
      distanceMeters: 0,
      durationMs: 0,
      movingDurationMs: 0,
      elevationGainMeters: 0,
      elevationLossMeters: 0,
      averageSpeedMetersPerSecond: 0,
    });
  });

  it('trims description when provided, otherwise leaves it undefined', () => {
    expect(startHike({ id: 'a', startedAt: 0, description: '  Lake loop ' }).description).toBe('Lake loop');
    expect(startHike({ id: 'a', startedAt: 0, description: '   ' }).description).toBeUndefined();
    expect(startHike({ id: 'a', startedAt: 0 }).description).toBeUndefined();
  });

  it('uses the provided name (trimmed) when given', () => {
    const h = startHike({ id: 'a', startedAt: 0, name: '   Sunday loop   ' });
    expect(h.name).toBe('Sunday loop');
  });

  it('falls back to a date-based name when none is provided', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    expect(h.name).toMatch(/Hike on /);
  });

  it('falls back to a date-based name when an empty name is provided', () => {
    const h = startHike({ id: 'a', startedAt: 0, name: '   ' });
    expect(h.name).toMatch(/Hike on /);
  });

  it('defaults startedAt to Date.now() when omitted', () => {
    const before = Date.now();
    const h = startHike({ id: 'a' });
    const after = Date.now();
    expect(h.startedAt).toBeGreaterThanOrEqual(before);
    expect(h.startedAt).toBeLessThanOrEqual(after);
  });
});
