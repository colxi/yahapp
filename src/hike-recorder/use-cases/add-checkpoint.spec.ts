import { startHike } from './start-hike';
import { addCheckpoint } from './add-checkpoint';

describe('addCheckpoint', () => {
  it('appends a checkpoint with a default title based on index', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    const next = addCheckpoint({ hike: h, id: 'c1', lat: 1, lng: 2, createdAt: 10 });
    expect(next.checkpoints).toHaveLength(1);
    expect(next.checkpoints[0]).toEqual({
      id: 'c1',
      lat: 1,
      lng: 2,
      title: 'Checkpoint 1',
      note: undefined,
      createdAt: 10,
    });
  });

  it('uses the provided title (trimmed) and note (trimmed)', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    const next = addCheckpoint({
      hike: h,
      id: 'c1',
      lat: 1,
      lng: 2,
      title: '  Lake view  ',
      note: '  refill water  ',
      createdAt: 1,
    });
    expect(next.checkpoints[0].title).toBe('Lake view');
    expect(next.checkpoints[0].note).toBe('refill water');
  });

  it('numbers default titles based on existing checkpoints', () => {
    let h = startHike({ id: 'a', startedAt: 0 });
    h = addCheckpoint({ hike: h, id: 'c1', lat: 0, lng: 0 });
    h = addCheckpoint({ hike: h, id: 'c2', lat: 0, lng: 0 });
    expect(h.checkpoints[1].title).toBe('Checkpoint 2');
  });
});
