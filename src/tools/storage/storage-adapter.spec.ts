import { createLocalStorageAdapter, createMemoryStorageAdapter } from './storage-adapter';

describe('createMemoryStorageAdapter', () => {
  it('round-trips JSON values', () => {
    const adapter = createMemoryStorageAdapter();
    adapter.set('a', { hello: 'world', n: 42 });
    expect(adapter.get<{ hello: string; n: number }>('a')).toEqual({ hello: 'world', n: 42 });
  });

  it('returns null for missing keys and after remove', () => {
    const adapter = createMemoryStorageAdapter();
    expect(adapter.get('nope')).toBeNull();
    adapter.set('x', 1);
    adapter.remove('x');
    expect(adapter.get('x')).toBeNull();
  });

  it('clear empties everything', () => {
    const adapter = createMemoryStorageAdapter();
    adapter.set('a', 1);
    adapter.set('b', 2);
    adapter.clear();
    expect(adapter.get('a')).toBeNull();
    expect(adapter.get('b')).toBeNull();
  });
});

describe('createLocalStorageAdapter', () => {
  it('round-trips through window.localStorage', () => {
    window.localStorage.clear();
    const adapter = createLocalStorageAdapter();
    adapter.set('greeting', 'hi');
    expect(adapter.get<string>('greeting')).toBe('hi');
    expect(window.localStorage.getItem('greeting')).toBe('"hi"');
  });

  it('returns null when stored value is not valid JSON', () => {
    window.localStorage.clear();
    window.localStorage.setItem('bad', 'not-json{');
    const adapter = createLocalStorageAdapter();
    expect(adapter.get('bad')).toBeNull();
  });
});
