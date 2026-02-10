import type { RangeQuery, AsyncReadable, AbsolutePath } from 'zarrita';

export function createGetRange(store: AsyncReadable) {
  return async (key: AbsolutePath, range: RangeQuery): Promise<Uint8Array | undefined> => {
    if (typeof store.getRange === 'function') {
      return store.getRange(key, range);
    }
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
