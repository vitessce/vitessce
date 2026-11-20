import { describe, it, expect, vi, afterEach } from 'vitest';
import { log } from '@vitessce/globals';
import { MatrixTooLargeError } from '@vitessce/error';
import { allocateDenseMatrix } from './matrix-guard.js';

function setHeapLimit(value) {
  // eslint-disable-next-line no-undef
  Object.defineProperty(globalThis.performance, 'memory', {
    value: { jsHeapSizeLimit: value },
    configurable: true,
  });
}

describe('allocateDenseMatrix', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // eslint-disable-next-line no-undef
    delete globalThis.performance.memory;
  });

  it('returns the allocation without warning when within budget', () => {
    const warn = vi.spyOn(log, 'warn').mockImplementation(() => {});
    const out = allocateDenseMatrix({
      source: '"my.zarr"',
      shape: [3, 5],
      allocate: () => new Float32Array(15),
    });
    expect(out.length).toEqual(15);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns but still attempts an over-budget allocation', () => {
    const warn = vi.spyOn(log, 'warn').mockImplementation(() => {});
    setHeapLimit(64);
    const out = allocateDenseMatrix({
      source: '"my.zarr"',
      shape: [3, 5],
      allocate: () => new Float32Array(15),
    });
    expect(out.length).toEqual(15);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"my.zarr"');
    expect(warn.mock.calls[0][0]).toContain('[3, 5]');
  });

  it('converts an allocation failure into a MatrixTooLargeError', () => {
    vi.spyOn(log, 'warn').mockImplementation(() => {});
    expect(() => allocateDenseMatrix({
      source: '"my.zarr"',
      shape: [2 ** 20, 2 ** 20],
      allocate: () => new Float32Array((2 ** 20) * (2 ** 20)),
    })).toThrow(MatrixTooLargeError);
    // A RangeError from another realm is recognized by name.
    const foreign = new Error('too big');
    foreign.name = 'RangeError';
    expect(() => allocateDenseMatrix({
      source: '"my.zarr"',
      shape: [1, 1],
      allocate: () => { throw foreign; },
    })).toThrow(MatrixTooLargeError);
  });

  it('converts asynchronous allocation failures and passes other errors through', async () => {
    vi.spyOn(log, 'warn').mockImplementation(() => {});
    await expect(allocateDenseMatrix({
      source: '"my.zarr"',
      shape: [1, 1],
      allocate: async () => new Float32Array((2 ** 20) * (2 ** 20)),
    })).rejects.toThrow(MatrixTooLargeError);
    await expect(allocateDenseMatrix({
      source: '"my.zarr"',
      shape: [1, 1],
      allocate: async () => { throw new Error('network'); },
    })).rejects.toThrow('network');
  });
});
