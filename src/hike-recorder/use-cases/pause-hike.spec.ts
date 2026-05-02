import { startHike } from './start-hike';
import { pauseHike, resumeHike } from './pause-hike';

describe('pauseHike', () => {
  it('flips a recording hike to paused', () => {
    const h = startHike({ id: 'a', startedAt: 0 });
    expect(pauseHike(h).status).toBe('paused');
  });

  it('returns the same hike object when not currently recording', () => {
    const completed = { ...startHike({ id: 'a', startedAt: 0 }), status: 'completed' as const };
    expect(pauseHike(completed)).toBe(completed);

    const alreadyPaused = { ...startHike({ id: 'a', startedAt: 0 }), status: 'paused' as const };
    expect(pauseHike(alreadyPaused)).toBe(alreadyPaused);
  });
});

describe('resumeHike', () => {
  it('flips a paused hike back to recording', () => {
    const paused = pauseHike(startHike({ id: 'a', startedAt: 0 }));
    expect(resumeHike(paused).status).toBe('recording');
  });

  it('returns the same hike object when not currently paused', () => {
    const recording = startHike({ id: 'a', startedAt: 0 });
    expect(resumeHike(recording)).toBe(recording);

    const completed = { ...recording, status: 'completed' as const };
    expect(resumeHike(completed)).toBe(completed);
  });
});
