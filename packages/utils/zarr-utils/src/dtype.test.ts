import { describe, it, expect } from 'vitest';
import { getBytesPerElement } from './dtype.js';

describe('getBytesPerElement', () => {
  it('maps zarrita dtypes to byte widths', () => {
    expect(['float32', 'int64', 'uint8', 'bool', 'uint16'].map(getBytesPerElement))
      .toEqual([4, 8, 1, 1, 2]);
  });

  it('reads Zarr v2 dtype codes and viv dtype names', () => {
    expect(['|u1', '<u2', '>u2', '<f4', '<f8', '|b1', 'Uint8', 'Uint16', 'Float32'].map(getBytesPerElement))
      .toEqual([1, 2, 2, 4, 8, 1, 1, 2, 4]);
  });

  it('defaults conservatively for unknown dtypes', () => {
    expect(getBytesPerElement('v2:object')).toEqual(8);
  });
});
