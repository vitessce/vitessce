import { describe, it, expect } from 'vitest';
import type { AbsolutePath, RangeQuery } from 'zarrita';
import { CachedStore, type QueryClientLike } from './normalize.js';

// A store whose responses resolve only when released, for testing coalescing.
function makeGatedStore(withGetRange = true) {
  const calls: string[] = [];
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const bytesFor = (label: string) => new TextEncoder().encode(label);
  const store = {
    async get(key: AbsolutePath) {
      calls.push(`get:${key}`);
      await gate;
      if (key === '/missing') {
        return undefined;
      }
      return bytesFor(`get:${key}`);
    },
    ...(withGetRange ? {
      async getRange(key: AbsolutePath, range: RangeQuery) {
        calls.push(`getRange:${key}:${JSON.stringify(range)}`);
        await gate;
        return bytesFor(`getRange:${key}:${JSON.stringify(range)}`);
      },
    } : {}),
  };
  return { store, calls, release: () => release() };
}

// A minimal fetchQuery implementation with permanent retention, for testing that
// CachedStore drives a QueryClient correctly (dedup of both concurrent and
// sequential reads).
function makeQueryClientStub() {
  const cache = new Map<string, Promise<unknown>>();
  let fetchQueryCalls = 0;
  const queryClient: QueryClientLike = {
    fetchQuery({ queryKey, queryFn }) {
      fetchQueryCalls += 1;
      const key = JSON.stringify(queryKey);
      let promise = cache.get(key);
      if (!promise) {
        promise = queryFn();
        cache.set(key, promise);
      }
      return promise;
    },
  };
  return { queryClient, cache, getFetchQueryCalls: () => fetchQueryCalls };
}

describe('CachedStore', () => {
  it('coalesces concurrent gets for the same key (no queryClient)', async () => {
    const { store, calls, release } = makeGatedStore();
    const cached = new CachedStore(store, 'http://example.com/a.zarr');
    const promises = [
      cached.get('/X/0.0'),
      cached.get('/X/0.0'),
      cached.get('/X/0.1'),
    ];
    release();
    const [a, b, c] = await Promise.all(promises);
    expect(calls.filter(x => x === 'get:/X/0.0').length).toEqual(1);
    expect(calls.filter(x => x === 'get:/X/0.1').length).toEqual(1);
    expect(a).toBe(b);
    expect(new TextDecoder().decode(c)).toEqual('get:/X/0.1');
  });

  it('does not retain results without a queryClient', async () => {
    const { store, calls, release } = makeGatedStore();
    const cached = new CachedStore(store, 'http://example.com/a.zarr');
    release();
    await cached.get('/X/0.0');
    await cached.get('/X/0.0');
    // Sequential reads each hit the store: the fallback only coalesces in-flight.
    expect(calls.filter(x => x === 'get:/X/0.0').length).toEqual(2);
  });

  it('caches sequential gets through a queryClient', async () => {
    const { store, calls, release } = makeGatedStore();
    const { queryClient, getFetchQueryCalls } = makeQueryClientStub();
    const cached = new CachedStore(store, 'http://example.com/a.zarr', queryClient);
    release();
    const first = await cached.get('/X/0.0');
    const second = await cached.get('/X/0.0');
    expect(calls.filter(x => x === 'get:/X/0.0').length).toEqual(1);
    expect(getFetchQueryCalls()).toEqual(2);
    expect(first).toBe(second);
  });

  it('round-trips undefined results through the queryClient', async () => {
    const { store, release } = makeGatedStore();
    const { queryClient } = makeQueryClientStub();
    const cached = new CachedStore(store, 'http://example.com/a.zarr', queryClient);
    release();
    expect(await cached.get('/missing')).toEqual(undefined);
    // The cached undefined answers again without becoming null.
    expect(await cached.get('/missing')).toEqual(undefined);
  });

  it('keys getRange reads by range', async () => {
    const { store, calls, release } = makeGatedStore();
    const cached = new CachedStore(store, 'http://example.com/a.zarr');
    const r1 = { offset: 0, length: 10 };
    const r2 = { offset: 10, length: 10 };
    const promises = [
      cached.getRange?.('/f', r1),
      cached.getRange?.('/f', r1),
      cached.getRange?.('/f', r2),
    ];
    release();
    await Promise.all(promises);
    expect(calls.filter(x => x.startsWith('getRange:/f:')).length).toEqual(2);
  });

  it('omits getRange when the wrapped store lacks one', () => {
    const { store } = makeGatedStore(false);
    const cached = new CachedStore(store, 'http://example.com/a.zarr');
    // Consumers feature-detect getRange, so the wrapper must not invent it.
    expect(cached.getRange).toEqual(undefined);
  });

  it('separates caches by URL prefix', async () => {
    const gatedA = makeGatedStore();
    const gatedB = makeGatedStore();
    const { queryClient } = makeQueryClientStub();
    const cachedA = new CachedStore(gatedA.store, 'http://example.com/a.zarr', queryClient);
    const cachedB = new CachedStore(gatedB.store, 'http://example.com/b.zarr', queryClient);
    gatedA.release();
    gatedB.release();
    await cachedA.get('/X/0.0');
    await cachedB.get('/X/0.0');
    // Same key, different URLs: both stores are read.
    expect(gatedA.calls.length).toEqual(1);
    expect(gatedB.calls.length).toEqual(1);
  });
});
