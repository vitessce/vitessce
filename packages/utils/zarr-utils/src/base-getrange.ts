import { log } from '@vitessce/globals';
import type { RangeQuery, AsyncReadable, AbsolutePath } from 'zarrita';


// Provides a blanket implementation of getRange that can be used with any AsyncReadable store,
// even if it doesn't define a getRange method.
// If the store does have a native getRange method, we use that instead.
export function createGetRange(store: AsyncReadable) {
  return async (key: AbsolutePath, range: RangeQuery): Promise<Uint8Array | undefined> => {
    if (typeof store.getRange === 'function') {
      return store.getRange(key, range);
    }
    log.warn('Store does not have a native getRange method; falling back to get. This may be inefficient for large data.');
    const arr = await store.get(key);
    if (!arr) return undefined;
    const { buffer } = arr;
    if ('suffixLength' in range) {
      const { suffixLength } = range;
      return new Uint8Array(buffer, buffer.byteLength - suffixLength, suffixLength);
    }
    if ('offset' in range && 'length' in range) {
      const { offset, length } = range;
      return new Uint8Array(buffer, offset, length);
    }
    throw new Error('Invalid rangeQuery value.');
  };
}
