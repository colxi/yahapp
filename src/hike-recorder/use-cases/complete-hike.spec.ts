import { startHike } from './start-hike';
import { completeHike } from './complete-hike';

describe('completeHike', () => {
  it('marks the hike as completed and stamps endedAt', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    const done = completeHike({ hike: h, endedAt: 5_000 });
    expect(done.status).toBe('completed');
    expect(done.endedAt).toBe(5_000);
  });

  it('trims and applies a new name when one is provided', () => {
    const h = startHike({ id: 'a', startedAt: 0, name: 'old' });
    const done = completeHike({ hike: h, endedAt: 1, name: '  My hike  ' });
    expect(done.name).toBe('My hike');
  });

  it('keeps the existing name when no name is provided', () => {
    const h = startHike({ id: 'a', startedAt: 0, name: 'Original' });
    const done = completeHike({ hike: h, endedAt: 1 });
    expect(done.name).toBe('Original');
  });

  it('defaults endedAt to Date.now() when omitted', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    const before = Date.now();
    const done = completeHike({ hike: h });
    const after = Date.now();
    expect(done.endedAt).toBeGreaterThanOrEqual(before);
    expect(done.endedAt).toBeLessThanOrEqual(after);
  });
});
