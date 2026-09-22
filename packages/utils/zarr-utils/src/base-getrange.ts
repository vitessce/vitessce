import * as zarr from 'zarrita';
import type { AsyncReadable } from 'zarrita';


// Provides a blanket implementation of getRange that can be used with any AsyncReadable store,
// even if it doesn't define a getRange method.
// If the store does have a native getRange method, we use that instead.
export const withGetRange = zarr.defineStoreExtension(
  (innerStore: AsyncReadable) => ({
    async getRange(
      ...args: Parameters<NonNullable<typeof innerStore['getRange']>>
    ): Promise<Uint8Array | undefined> {
      const [key, range, opts] = args;
      if (typeof innerStore.getRange === 'function') {
        return innerStore.getRange(key, range, opts);
      }
      // Store does not have a native getRange method; falling back to get.
      // This may be inefficient for large data.
      const arr = await innerStore.get(key, opts);
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
    },
  }),
);
