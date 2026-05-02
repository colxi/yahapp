import { startHike } from './start-hike';
import { addCheckpoint } from './add-checkpoint';
import { removeCheckpoint, updateCheckpoint } from './update-checkpoint';

function withTwoCheckpoints() {
  let h = startHike({ id: 'a', startedAt: 0 });
  h = addCheckpoint({ hike: h, id: 'c1', lat: 0, lng: 0, title: 'First', createdAt: 1 });
  h = addCheckpoint({ hike: h, id: 'c2', lat: 0, lng: 0, title: 'Second', note: 'orig', createdAt: 2 });
  return h;
}

describe('updateCheckpoint', () => {
  it('updates title and note on a matching checkpoint', () => {
    const h = updateCheckpoint({
      hike: withTwoCheckpoints(),
      id: 'c2',
      title: '  Stream  ',
      note: '  refill bottles  ',
    });
    const c2 = h.checkpoints.find((c) => c.id === 'c2')!;
    expect(c2.title).toBe('Stream');
    expect(c2.note).toBe('refill bottles');
  });

  it('clears the note when an empty string is provided', () => {
    const h = updateCheckpoint({ hike: withTwoCheckpoints(), id: 'c2', note: '   ' });
    expect(h.checkpoints.find((c) => c.id === 'c2')!.note).toBeUndefined();
  });

  it('keeps the original title when an empty title is provided', () => {
    const h = updateCheckpoint({ hike: withTwoCheckpoints(), id: 'c1', title: '   ' });
    expect(h.checkpoints.find((c) => c.id === 'c1')!.title).toBe('First');
  });

  it('returns the same hike when the checkpoint id is unknown', () => {
    const h = withTwoCheckpoints();
    expect(updateCheckpoint({ hike: h, id: 'nope', title: 'x' })).toBe(h);
  });
});

describe('removeCheckpoint', () => {
  it('removes a matching checkpoint', () => {
    const h = removeCheckpoint(withTwoCheckpoints(), 'c1');
    expect(h.checkpoints.map((c) => c.id)).toEqual(['c2']);
  });

  it('returns the same hike when the id does not match', () => {
    const h = withTwoCheckpoints();
    expect(removeCheckpoint(h, 'nope')).toBe(h);
  });
});
