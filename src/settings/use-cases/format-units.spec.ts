import { formatDistance, formatElevation, formatSpeed } from './format-units';

describe('formatDistance', () => {
  it('uses meters under 1km in metric', () => {
    expect(formatDistance(450, 'metric')).toBe('450 m');
  });

  it('uses km from 1km up in metric', () => {
    expect(formatDistance(1500, 'metric')).toBe('1.50 km');
  });

  it('uses feet under 0.1 mi in imperial', () => {
    expect(formatDistance(50, 'imperial')).toMatch(/ft$/);
  });

  it('uses miles from 0.1 mi up in imperial', () => {
    expect(formatDistance(1609, 'imperial')).toMatch(/^1\.00 mi$/);
  });
});

describe('formatElevation', () => {
  it('rounds to integer meters in metric', () => {
    expect(formatElevation(123.6, 'metric')).toBe('124 m');
  });

  it('converts to feet in imperial', () => {
    expect(formatElevation(100, 'imperial')).toBe('328 ft');
  });
});

describe('formatSpeed', () => {
  it('formats m/s as km/h with one decimal in metric', () => {
    expect(formatSpeed(1, 'metric')).toBe('3.6 km/h');
  });

  it('formats m/s as mph in imperial', () => {
    expect(formatSpeed(10, 'imperial')).toMatch(/mph$/);
  });
});
