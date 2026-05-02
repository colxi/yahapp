import { createMemoryStorageAdapter } from '@/tools/storage/storage-adapter';
import { createLocalStorageHikesRepository } from './local-storage-hikes-repository';
import type { Hike } from '../types/hike';

function makeHike(overrides: Partial<Hike> = {}): Hike {
  return {
    id: overrides.id ?? 'h1',
    name: overrides.name ?? 'Test hike',
    status: overrides.status ?? 'completed',
    startedAt: overrides.startedAt ?? 1_000,
    endedAt: overrides.endedAt ?? 2_000,
    points: overrides.points ?? [],
    stats: overrides.stats ?? {
      distanceMeters: 0,
      durationMs: 1_000,
      movingDurationMs: 0,
      elevationGainMeters: 0,
      elevationLossMeters: 0,
      averageSpeedMetersPerSecond: 0,
    },
    checkpoints: overrides.checkpoints ?? [],
  };
}

describe('createLocalStorageHikesRepository', () => {
  it('starts empty', () => {
    const repo = createLocalStorageHikesRepository(createMemoryStorageAdapter());
    expect(repo.list()).toEqual([]);
  });

  it('saves and retrieves a hike by id', () => {
    const repo = createLocalStorageHikesRepository(createMemoryStorageAdapter());
    const hike = makeHike();
    repo.save(hike);
    expect(repo.getById('h1')).toEqual(hike);
  });

  it('updates an existing hike in place', () => {
    const repo = createLocalStorageHikesRepository(createMemoryStorageAdapter());
    repo.save(makeHike({ id: 'h1', name: 'old' }));
    repo.save(makeHike({ id: 'h1', name: 'new' }));
    expect(repo.list()).toHaveLength(1);
    expect(repo.getById('h1')!.name).toBe('new');
  });

  it('lists hikes sorted by most recent startedAt', () => {
    const repo = createLocalStorageHikesRepository(createMemoryStorageAdapter());
    repo.save(makeHike({ id: 'a', startedAt: 1 }));
    repo.save(makeHike({ id: 'b', startedAt: 3 }));
    repo.save(makeHike({ id: 'c', startedAt: 2 }));
    expect(repo.list().map((h) => h.id)).toEqual(['b', 'c', 'a']);
  });

  it('removes a hike', () => {
    const repo = createLocalStorageHikesRepository(createMemoryStorageAdapter());
    repo.save(makeHike({ id: 'a' }));
    repo.save(makeHike({ id: 'b' }));
    repo.remove('a');
    expect(repo.list().map((h) => h.id)).toEqual(['b']);
  });

  it('ignores corrupt persisted data', () => {
    const adapter = createMemoryStorageAdapter();
    adapter.set('yahapp:v1:hikes', { schemaVersion: 999 });
    const repo = createLocalStorageHikesRepository(adapter);
    expect(repo.list()).toEqual([]);
  });

  it('normalizes legacy hikes that lack a checkpoints array', () => {
    const adapter = createMemoryStorageAdapter();
    adapter.set('yahapp:v1:hikes', {
      schemaVersion: 1,
      hikes: [
        {
          id: 'legacy',
          name: 'Old hike',
          status: 'completed',
          startedAt: 1,
          endedAt: 2,
          points: [],
          stats: {
            distanceMeters: 0,
            durationMs: 0,
            movingDurationMs: 0,
            elevationGainMeters: 0,
            elevationLossMeters: 0,
            averageSpeedMetersPerSecond: 0,
          },
        },
      ],
    });
    const repo = createLocalStorageHikesRepository(adapter);
    expect(repo.getById('legacy')!.checkpoints).toEqual([]);
  });
});
