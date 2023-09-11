import type { Readable } from '@zarrita/storage';
import QuickLRU from 'quick-lru';

type RangeQuery =
  | {
      offset: number;
      length: number;
    }
  | {
      suffixLength: number;
    };

function normalizeKey(key: string, range?: RangeQuery) {
  if (!range) return key;
  if ('suffixLength' in range) return `${key}:-${range.suffixLength}`;
  return `${key}:${range.offset}:${range.offset + range.length - 1}`;
}

export function lru<S extends Readable>(store: S, maxSize = 100) {
  const cache = new QuickLRU<string, Promise<Uint8Array | undefined>>({ maxSize });
  let getRange = store.getRange ? store.getRange.bind(store) : undefined;
  function get(...args: Parameters<S['get']>) {
    const [key, opts] = args;
    const cacheKey = normalizeKey(key);
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const result = Promise.resolve(store.get(key, opts)).catch((err) => {
      cache.delete(cacheKey);
      throw err;
    });
    cache.set(cacheKey, result);
    return result;
  }
  if (getRange) {
    // eslint-disable-next-line no-underscore-dangle
    const _getRange = getRange;
    getRange = (...args: Parameters<NonNullable<S['getRange']>>) => {
      const [key, range, opts] = args;
      const cacheKey = normalizeKey(key, range);
      const cached = cache.get(cacheKey);
      if (cached) return cached;
      const result = Promise.resolve(_getRange!(key, range, opts)).catch((err) => {
        cache.delete(cacheKey);
        throw err;
      });
      cache.set(cacheKey, result);
      return result;
    };
  }
  return new Proxy(store, {
    get(target, prop, receiver) {
      if (prop === 'get') return get;
      if (prop === 'getRange' && getRange) return getRange;
      return Reflect.get(target, prop, receiver);
    },
  });
}
