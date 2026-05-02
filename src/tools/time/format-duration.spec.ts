import { formatDuration } from './format-duration';

describe('formatDuration', () => {
  it('formats durations under an hour as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5_000)).toBe('0:05');
    expect(formatDuration(65_000)).toBe('1:05');
    expect(formatDuration(59 * 60 * 1000 + 59_000)).toBe('59:59');
  });

  it('formats durations of an hour or more as h:mm:ss', () => {
    expect(formatDuration(60 * 60 * 1000)).toBe('1:00:00');
    expect(formatDuration(2 * 60 * 60 * 1000 + 3 * 60 * 1000 + 4_000)).toBe('2:03:04');
  });

  it('returns 0:00 for negative or invalid inputs', () => {
    expect(formatDuration(-1)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
  });
});
