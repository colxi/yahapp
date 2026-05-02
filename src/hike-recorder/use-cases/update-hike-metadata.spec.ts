import { startHike } from './start-hike';
import { updateHikeMetadata } from './update-hike-metadata';

describe('updateHikeMetadata', () => {
  it('updates the title (trimmed) and description (trimmed)', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    const next = updateHikeMetadata({ hike: h, name: '  Sunday loop ', description: '  forested  ' });
    expect(next.name).toBe('Sunday loop');
    expect(next.description).toBe('forested');
  });

  it('clears description when an empty string is provided', () => {
    const h = { ...startHike({ id: 'a', startedAt: 0 }), description: 'old' };
    const next = updateHikeMetadata({ hike: h, description: '   ' });
    expect(next.description).toBeUndefined();
  });

  it('keeps the original name when an empty name is provided', () => {
    const h = startHike({ id: 'a', startedAt: 0, name: 'Original' });
    const next = updateHikeMetadata({ hike: h, name: '   ' });
    expect(next.name).toBe('Original');
  });

  it('leaves untouched fields unchanged when only one is provided', () => {
    const h = updateHikeMetadata({
      hike: startHike({ id: 'a', startedAt: 0, name: 'A', description: 'B' }),
      name: 'Renamed',
    });
    expect(h.name).toBe('Renamed');
    expect(h.description).toBe('B');
  });
});
