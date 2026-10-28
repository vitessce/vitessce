import { describe, it, expect } from 'vitest';
import { lowercaseAxisNames } from './load-ome-zarr.js';

describe('lowercaseAxisNames', () => {
  it('lowercases axis objects and keeps their other properties', () => {
    // As in Zebrahub ZSNS003.ome.zarr.
    const rootAttrs = {
      omero: {},
      multiscales: [{
        datasets: [{ path: '0' }],
        axes: [
          { name: 'T', type: 'time', unit: 'second' },
          { name: 'C', type: 'channel' },
          { name: 'Z', type: 'space', unit: 'micrometer' },
          { name: 'Y', type: 'space', unit: 'micrometer' },
          { name: 'X', type: 'space', unit: 'micrometer' },
        ],
      }],
    };
    const result = lowercaseAxisNames(rootAttrs);
    expect(result.multiscales[0].axes).toEqual([
      { name: 't', type: 'time', unit: 'second' },
      { name: 'c', type: 'channel' },
      { name: 'z', type: 'space', unit: 'micrometer' },
      { name: 'y', type: 'space', unit: 'micrometer' },
      { name: 'x', type: 'space', unit: 'micrometer' },
    ]);
    expect(result.multiscales[0].datasets).toBe(rootAttrs.multiscales[0].datasets);
    expect(result.omero).toBe(rootAttrs.omero);
    // The input is not mutated.
    expect(rootAttrs.multiscales[0].axes[0].name).toBe('T');
  });

  it('lowercases v0.3 string axes', () => {
    expect(lowercaseAxisNames({ multiscales: [{ axes: ['Z', 'Y', 'X'] }] }).multiscales[0].axes)
      .toEqual(['z', 'y', 'x']);
  });

  it('leaves names that would collide, and metadata without axes, unchanged', () => {
    const colliding = { multiscales: [{ axes: ['x', 'X'] }] };
    expect(lowercaseAxisNames(colliding).multiscales[0].axes).toEqual(['x', 'X']);
    const v02 = { multiscales: [{ datasets: [{ path: '0' }] }] };
    expect(lowercaseAxisNames(v02)).toEqual(v02);
  });
});
