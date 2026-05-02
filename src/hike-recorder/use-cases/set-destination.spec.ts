import { startHike } from './start-hike';
import { clearDestination, setDestination } from './set-destination';

describe('setDestination', () => {
  it('adds a destination annotation to a hike', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    const next = setDestination({ hike: h, id: 'd1', lat: 41, lng: 2, createdAt: 100 });
    expect(next.destination).toEqual({
      id: 'd1',
      lat: 41,
      lng: 2,
      title: 'Destination',
      note: undefined,
      createdAt: 100,
    });
  });

  it('uses the provided title (trimmed) and trims the note', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    const next = setDestination({
      hike: h,
      id: 'd1',
      lat: 0,
      lng: 0,
      title: '  Mountain top  ',
      note: '  bring water  ',
      createdAt: 1,
    });
    expect(next.destination?.title).toBe('Mountain top');
    expect(next.destination?.note).toBe('bring water');
  });

  it('drops blank notes', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    const next = setDestination({ hike: h, id: 'd', lat: 0, lng: 0, note: '   ', createdAt: 1 });
    expect(next.destination?.note).toBeUndefined();
  });

  it('replaces an existing destination', () => {
    const h = setDestination({ hike: startHike({ id: 'a' }), id: 'd1', lat: 1, lng: 1 });
    const next = setDestination({ hike: h, id: 'd2', lat: 2, lng: 2 });
    expect(next.destination?.id).toBe('d2');
  });
});

describe('clearDestination', () => {
  it('removes the destination if present', () => {
    const h = setDestination({ hike: startHike({ id: 'a' }), id: 'd1', lat: 1, lng: 1 });
    expect(clearDestination(h).destination).toBeUndefined();
  });

  it('returns the same hike when there is no destination', () => {
    const h = startHike({ id: 'a' });
    expect(clearDestination(h)).toBe(h);
  });
});
